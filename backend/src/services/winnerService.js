import crypto from 'crypto';
import { env } from '../config/env.js';
import { Giveaway } from '../models/Giveaway.js';
import { GiveawayPrize } from '../models/GiveawayPrize.js';
import { GiveawayParticipation } from '../models/GiveawayParticipation.js';
import { GiveawayWinner } from '../models/GiveawayWinner.js';
import { AppError } from '../utils/AppError.js';
import { effectiveStatus } from './giveawayService.js';
import { audit } from './auditService.js';

const rank = (giveaway, userId) =>
  crypto
    .createHmac('sha256', env.winnerSelectionSecret)
    .update(`${giveaway._id}:${giveaway.endAt.toISOString()}:${userId}`)
    .digest('hex');

export async function selectWinners({ giveawayId, actor, req }) {
  const giveaway = await Giveaway.findById(giveawayId);
  if (!giveaway)
    throw new AppError(
      'GIVEAWAY_NOT_FOUND',
      'This giveaway could not be found.',
      404,
    );
  if (
    effectiveStatus(giveaway) !== 'ENDED' &&
    giveaway.status !== 'WINNERS_SELECTED'
  )
    throw new AppError(
      'GIVEAWAY_NOT_ENDED',
      'Winners can only be selected after the giveaway ends.',
      409,
    );
  const config = await GiveawayPrize.findOne({ giveawayId });
  const current = await GiveawayWinner.find({ giveawayId });
  if (current.length >= config.winnerCount) return current;
  const candidates = await GiveawayParticipation.find({
    giveawayId,
    status: 'ACTIVE',
    userId: { $nin: current.map((winner) => winner.userId) },
  });
  const selected = candidates
    .sort((a, b) =>
      rank(giveaway, a.userId).localeCompare(rank(giveaway, b.userId)),
    )
    .slice(0, config.winnerCount - current.length);
  if (selected.length)
    await GiveawayWinner.insertMany(
      selected.map((participant) => ({
        giveawayId,
        prizeId: config.prizeId,
        userId: participant.userId,
        selectionMethod: 'HMAC_DETERMINISTIC_DRAW',
      })),
    );
  giveaway.status = 'WINNERS_SELECTED';
  await giveaway.save();
  await audit({
    actorId: actor._id,
    action: 'WINNER_SELECTED',
    resourceType: 'Giveaway',
    resourceId: giveaway._id,
    metadata: {
      selectedCount: selected.length,
      selectionMethod: 'HMAC_DETERMINISTIC_DRAW',
    },
    req,
  });
  return GiveawayWinner.find({ giveawayId });
}
