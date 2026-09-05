import crypto from 'crypto';
import mongoose from 'mongoose';
import { Giveaway } from '../models/Giveaway.js';
import { GiveawayPrize } from '../models/GiveawayPrize.js';
import { GiveawayParticipation } from '../models/GiveawayParticipation.js';
import { GiveawayEntryTransaction } from '../models/GiveawayEntryTransaction.js';
import { Wallet } from '../models/Wallet.js';
import { IdempotencyKey } from '../models/IdempotencyKey.js';
import { AppError } from '../utils/AppError.js';
import { effectiveStatus } from './giveawayService.js';
import { assessParticipationRisk } from './fraudService.js';
import { audit } from './auditService.js';

const keyHash = (id, key) =>
  crypto.createHash('sha256').update(`${id}:${key}`).digest('hex');

async function getOrCreateIdempotency(userId, key, giveawayId) {
  if (!key || key.length < 8 || key.length > 200)
    throw new AppError(
      'VALIDATION_ERROR',
      'A valid Idempotency-Key header is required to join.',
      422,
    );
  const requestHash = keyHash(giveawayId, key);
  let record = await IdempotencyKey.findOne({ userId, key });
  if (record) {
    if (record.requestHash !== requestHash)
      throw new AppError(
        'IDEMPOTENCY_KEY_REUSED',
        'This request key was used for a different action.',
        409,
      );
    if (record.status === 'COMPLETED') return { record, replay: true };
    throw new AppError(
      'REQUEST_IN_PROGRESS',
      'Your participation request is already being processed.',
      409,
    );
  }
  try {
    record = await IdempotencyKey.create({ userId, key, requestHash });
    return { record, replay: false };
  } catch (error) {
    if (error.code !== 11000) throw error;
    record = await IdempotencyKey.findOne({ userId, key });
    if (record?.status === 'COMPLETED') return { record, replay: true };
    throw new AppError(
      'REQUEST_IN_PROGRESS',
      'Your participation request is already being processed.',
      409,
    );
  }
}

export async function joinGiveaway({ giveawayId, user, req }) {
  const { record, replay } = await getOrCreateIdempotency(
    user._id,
    req.get('Idempotency-Key'),
    giveawayId,
  );
  if (replay) return record.response;
  const fraud = await assessParticipationRisk({ req, user, giveawayId });
  const session = await mongoose.startSession();
  try {
    let response;
    await session.withTransaction(
      async () => {
        const giveaway = await Giveaway.findById(giveawayId).session(session);
        if (!giveaway)
          throw new AppError(
            'GIVEAWAY_NOT_FOUND',
            'This giveaway could not be found.',
            404,
          );
        const status = effectiveStatus(giveaway);
        if (status === 'ENDED')
          throw new AppError(
            'GIVEAWAY_ENDED',
            'This giveaway has ended and is no longer accepting entries.',
            409,
          );
        if (status !== 'ACTIVE')
          throw new AppError(
            'GIVEAWAY_NOT_ACTIVE',
            'This giveaway is not open for participation.',
            409,
          );
        const config = await GiveawayPrize.findOne({ giveawayId }).session(
          session,
        );
        if (!config)
          throw new AppError(
            'PRIZE_CONFIGURATION_INVALID',
            'This giveaway is not configured correctly.',
            500,
          );
        const ageDays = (Date.now() - user.createdAt.getTime()) / 86400000;
        if (ageDays < giveaway.participationSettings.minAccountAgeDays)
          throw new AppError(
            'PARTICIPATION_BLOCKED',
            'Your account is not yet eligible for this giveaway.',
            403,
          );
        const duplicate = await GiveawayParticipation.exists({
          userId: user._id,
          giveawayId,
        }).session(session);
        if (duplicate)
          throw new AppError(
            'ALREADY_PARTICIPATING',
            'You are already participating in this giveaway.',
            409,
          );
        const currency = config.entryCurrency;
        const amount = config.entryAmount;
        const wallet = await Wallet.findOne({ userId: user._id }).session(
          session,
        );
        const before = wallet?.balances?.[currency] ?? 0;
        if (!wallet || before < amount) {
          const labels = { VE: 'VEs', SVE: 'SVEs', TOKEN: 'Tokens' };
          throw new AppError(
            `INSUFFICIENT_${currency}_BALANCE`,
            `You need ${amount - before} more ${labels[currency]} to join this giveaway.`,
            409,
          );
        }
        const balancePath = `balances.${currency}`;
        const updatedWallet = await Wallet.findOneAndUpdate(
          { _id: wallet._id, [balancePath]: { $gte: amount } },
          { $inc: { [balancePath]: -amount } },
          { new: true, session },
        );
        if (!updatedWallet)
          throw new AppError(
            `INSUFFICIENT_${currency}_BALANCE`,
            'Your balance changed. Please review it and try again.',
            409,
          );
        const transactionId = `ENT-${crypto.randomUUID()}`;
        const [transaction] = await GiveawayEntryTransaction.create(
          [
            {
              transactionId,
              userId: user._id,
              giveawayId,
              prizeId: config.prizeId,
              currency,
              amount,
              balanceBefore: before,
              balanceAfter: updatedWallet.balances[currency],
            },
          ],
          { session },
        );
        const [participation] = await GiveawayParticipation.create(
          [
            {
              userId: user._id,
              giveawayId,
              prizeId: config.prizeId,
              entryCurrency: currency,
              entryAmount: amount,
              deviceHash: fraud.deviceHash,
              transactionId: transaction._id,
            },
          ],
          { session },
        );
        await audit({
          actorId: user._id,
          action: 'PARTICIPATION_CREATED',
          resourceType: 'GiveawayParticipation',
          resourceId: participation._id,
          metadata: {
            giveawayId: String(giveawayId),
            currency,
            amount,
            riskScore: fraud.riskScore,
          },
          req,
          session,
        });
        await audit({
          actorId: user._id,
          action: 'ENTRY_DEDUCTED',
          resourceType: 'GiveawayEntryTransaction',
          resourceId: transaction._id,
          metadata: { currency, amount },
          req,
          session,
        });
        response = {
          participation: {
            id: participation._id.toString(),
            status: participation.status,
            joinedAt: participation.joinedAt,
          },
          wallet: { balances: updatedWallet.balances },
          entry: { currency, amount },
        };
        record.status = 'COMPLETED';
        record.response = response;
        await record.save({ session });
      },
      { readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' } },
    );
    return response;
  } catch (error) {
    // A failed request must not strand an idempotency key in PENDING state.
    await IdempotencyKey.deleteOne({ _id: record._id, status: 'PENDING' });
    if (error?.code === 11000)
      throw new AppError(
        'ALREADY_PARTICIPATING',
        'You are already participating in this giveaway.',
        409,
      );
    throw error;
  } finally {
    await session.endSession();
  }
}
