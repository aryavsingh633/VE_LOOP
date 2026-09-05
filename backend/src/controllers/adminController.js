import { Giveaway } from '../models/Giveaway.js';
import { Prize } from '../models/Prize.js';
import { GiveawayPrize } from '../models/GiveawayPrize.js';
import { GiveawayParticipation } from '../models/GiveawayParticipation.js';
import { GiveawayWinner } from '../models/GiveawayWinner.js';
import { PrizeClaim } from '../models/PrizeClaim.js';
import { FraudEvent } from '../models/FraudEvent.js';
import { AuditLog } from '../models/AuditLog.js';
import { AppError, assert } from '../utils/AppError.js';
import { audit } from '../services/auditService.js';
import { selectWinners } from '../services/winnerService.js';
import { serializeGiveaway } from '../services/giveawayService.js';

export async function dashboard(_req, res) {
  const [
    activeGiveaways,
    totalParticipants,
    totalWinners,
    pendingClaims,
    suspiciousActivities,
  ] = await Promise.all([
    Giveaway.countDocuments({ status: 'ACTIVE' }),
    GiveawayParticipation.countDocuments(),
    GiveawayWinner.countDocuments(),
    PrizeClaim.countDocuments({ status: { $in: ['SUBMITTED', 'PROCESSING'] } }),
    FraudEvent.countDocuments({ action: { $in: ['REVIEW', 'BLOCKED'] } }),
  ]);
  res.json({
    success: true,
    data: {
      activeGiveaways,
      totalParticipants,
      totalWinners,
      pendingClaims,
      suspiciousActivities,
    },
  });
}

export async function listGiveaways(_req, res) {
  const giveaways = await Giveaway.find().sort({ createdAt: -1 });
  res.json({
    success: true,
    data: {
      items: await Promise.all(
        giveaways.map((item) =>
          serializeGiveaway(item, { includePrivate: true }),
        ),
      ),
    },
  });
}

export async function createGiveaway(req, res) {
  const { giveaway, prize, configuration } = req.body;
  assert(
    giveaway && prize && configuration,
    'VALIDATION_ERROR',
    'Giveaway, prize, and configuration are required.',
    422,
  );
  const startAt = new Date(giveaway.startAt);
  const endAt = new Date(giveaway.endAt);
  assert(
    !Number.isNaN(startAt.getTime()) &&
      !Number.isNaN(endAt.getTime()) &&
      endAt > startAt,
    'VALIDATION_ERROR',
    'Giveaway end time must be later than its start time.',
    422,
  );
  giveaway.startAt = startAt;
  giveaway.endAt = endAt;
  assert(
    ['VE', 'SVE', 'TOKEN'].includes(configuration.entryCurrency) &&
      Number.isFinite(configuration.entryAmount) &&
      configuration.entryAmount >= 0,
    'VALIDATION_ERROR',
    'Entry currency and amount are invalid.',
    422,
  );
  assert(
    Number.isInteger(configuration.winnerCount) &&
      configuration.winnerCount > 0,
    'VALIDATION_ERROR',
    'Winner count must be a positive whole number.',
    422,
  );
  const record = await Giveaway.create(giveaway);
  const prizeRecord = await Prize.create(prize);
  await GiveawayPrize.create({
    giveawayId: record._id,
    prizeId: prizeRecord._id,
    position: configuration.position || 1,
    winnerCount: configuration.winnerCount,
    entryCurrency: configuration.entryCurrency,
    entryAmount: configuration.entryAmount,
  });
  await audit({
    actorId: req.user._id,
    action: 'GIVEAWAY_CREATED',
    resourceType: 'Giveaway',
    resourceId: record._id,
    metadata: { slug: record.slug },
    req,
  });
  res.status(201).json({
    success: true,
    data: await serializeGiveaway(record, { includePrivate: true }),
  });
}

export async function updateGiveaway(req, res) {
  const allowed = [
    'title',
    'description',
    'status',
    'startAt',
    'endAt',
    'claimDeadlineAt',
    'rules',
    'eligibility',
    'participationSettings',
  ];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowed.includes(key)),
  );
  if (!Object.keys(updates).length)
    throw new AppError(
      'VALIDATION_ERROR',
      'No editable giveaway fields were provided.',
      422,
    );
  if (updates.startAt || updates.endAt) {
    const existing = await Giveaway.findById(req.params.id).select(
      'startAt endAt',
    );
    if (!existing)
      throw new AppError(
        'GIVEAWAY_NOT_FOUND',
        'This giveaway could not be found.',
        404,
      );
    const startAt = new Date(updates.startAt || existing.startAt);
    const endAt = new Date(updates.endAt || existing.endAt);
    assert(
      !Number.isNaN(startAt.getTime()) &&
        !Number.isNaN(endAt.getTime()) &&
        endAt > startAt,
      'VALIDATION_ERROR',
      'Giveaway end time must be later than its start time.',
      422,
    );
    if (updates.startAt) updates.startAt = startAt;
    if (updates.endAt) updates.endAt = endAt;
  }
  const giveaway = await Giveaway.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!giveaway)
    throw new AppError(
      'GIVEAWAY_NOT_FOUND',
      'This giveaway could not be found.',
      404,
    );
  await audit({
    actorId: req.user._id,
    action: 'GIVEAWAY_UPDATED',
    resourceType: 'Giveaway',
    resourceId: giveaway._id,
    metadata: { fields: Object.keys(updates) },
    req,
  });
  res.json({
    success: true,
    data: await serializeGiveaway(giveaway, { includePrivate: true }),
  });
}

export async function participants(req, res) {
  const filter = req.params.id ? { giveawayId: req.params.id } : {};
  const rows = await GiveawayParticipation.find(filter)
    .sort({ joinedAt: -1 })
    .limit(250)
    .populate('userId', 'publicId name email')
    .populate('giveawayId', 'title')
    .populate('prizeId', 'name');
  res.json({
    success: true,
    data: {
      items: rows.map((row) => ({
        id: row._id,
        joinedAt: row.joinedAt,
        status: row.status,
        entryCurrency: row.entryCurrency,
        entryAmount: row.entryAmount,
        user: row.userId,
        giveaway: row.giveawayId?.title,
        prize: row.prizeId?.name,
      })),
    },
  });
}

export async function winners(_req, res) {
  const rows = await GiveawayWinner.find()
    .sort({ selectedAt: -1 })
    .limit(250)
    .populate('userId', 'publicId name email')
    .populate('giveawayId', 'title')
    .populate('prizeId', 'name');
  res.json({ success: true, data: { items: rows } });
}

export async function claims(_req, res) {
  const rows = await PrizeClaim.find()
    .sort({ submittedAt: -1 })
    .limit(250)
    .populate('userId', 'publicId name email')
    .populate('giveawayId', 'title')
    .populate('prizeId', 'name prizeType');
  res.json({ success: true, data: { items: rows } });
}

export async function fraudEvents(_req, res) {
  res.json({
    success: true,
    data: {
      items: await FraudEvent.find()
        .sort({ createdAt: -1 })
        .limit(250)
        .populate('userId', 'publicId email'),
    },
  });
}
export async function auditLogs(_req, res) {
  res.json({
    success: true,
    data: {
      items: await AuditLog.find()
        .sort({ createdAt: -1 })
        .limit(300)
        .populate('actorId', 'publicId name'),
    },
  });
}
export async function finalizeWinners(req, res) {
  res.json({
    success: true,
    data: {
      winners: await selectWinners({
        giveawayId: req.params.id,
        actor: req.user,
        req,
      }),
    },
  });
}

export async function updateClaim(req, res) {
  if (!['PROCESSING', 'COMPLETED', 'EXPIRED'].includes(req.body.status))
    throw new AppError('VALIDATION_ERROR', 'Invalid claim status.', 422);
  const claim = await PrizeClaim.findByIdAndUpdate(
    req.params.claimId,
    { status: req.body.status },
    { new: true },
  );
  if (!claim)
    throw new AppError(
      'CLAIM_NOT_FOUND',
      'This claim could not be found.',
      404,
    );
  await audit({
    actorId: req.user._id,
    action: 'CLAIM_PROCESSED',
    resourceType: 'PrizeClaim',
    resourceId: claim._id,
    metadata: { status: claim.status },
    req,
  });
  res.json({ success: true, data: { id: claim._id, status: claim.status } });
}
