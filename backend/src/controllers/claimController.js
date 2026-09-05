import { GiveawayWinner } from '../models/GiveawayWinner.js';
import { GiveawayPrize } from '../models/GiveawayPrize.js';
import { Prize } from '../models/Prize.js';
import { PrizeClaim } from '../models/PrizeClaim.js';
import { Giveaway } from '../models/Giveaway.js';
import { AppError } from '../utils/AppError.js';
import { audit } from '../services/auditService.js';

async function claimContext(giveawayId, userId) {
  const winner = await GiveawayWinner.findOne({ giveawayId, userId });
  if (!winner)
    throw new AppError(
      'CLAIM_NOT_ALLOWED',
      'Only the verified winner can submit a claim for this prize.',
      403,
    );
  const [giveaway, config, prize] = await Promise.all([
    Giveaway.findById(giveawayId),
    GiveawayPrize.findOne({ giveawayId }),
    Prize.findById(winner.prizeId),
  ]);
  if (!giveaway || !config || !prize)
    throw new AppError(
      'GIVEAWAY_NOT_FOUND',
      'This prize is not available.',
      404,
    );
  return { winner, giveaway, config, prize };
}

export async function myClaim(req, res) {
  const { winner, giveaway, prize } = await claimContext(
    req.params.id,
    req.user._id,
  );
  const claim = await PrizeClaim.findOne({ winnerId: winner._id }).select(
    '-fulfillment',
  );
  res.json({
    success: true,
    data: {
      eligible: true,
      prize: { name: prize.name, claimType: prize.claimType },
      deadlineAt: giveaway.claimDeadlineAt,
      claim: claim
        ? { status: claim.status, submittedAt: claim.submittedAt }
        : { status: 'NOT_SUBMITTED' },
    },
  });
}

export async function submitClaim(req, res) {
  const { winner, giveaway, prize } = await claimContext(
    req.params.id,
    req.user._id,
  );
  if (giveaway.claimDeadlineAt && new Date() > giveaway.claimDeadlineAt)
    throw new AppError(
      'CLAIM_EXPIRED',
      'The claim period for this prize has ended.',
      409,
    );
  const existing = await PrizeClaim.findOne({ winnerId: winner._id });
  if (existing)
    throw new AppError(
      'CLAIM_ALREADY_SUBMITTED',
      'Your prize claim has already been submitted.',
      409,
    );
  let fulfillment;
  if (prize.claimType === 'EMAIL_ONLY') {
    if (!req.body.email)
      throw new AppError(
        'VALIDATION_ERROR',
        'Enter the email address for your gift card.',
        422,
      );
    fulfillment = { email: req.body.email };
  } else {
    const required = [
      'fullName',
      'phone',
      'address',
      'city',
      'state',
      'pinCode',
    ];
    if (required.some((field) => !req.body[field]))
      throw new AppError(
        'VALIDATION_ERROR',
        'Complete every delivery field to submit your claim.',
        422,
      );
    fulfillment = Object.fromEntries(
      required.map((field) => [field, req.body[field]]),
    );
  }
  const claim = await PrizeClaim.create({
    winnerId: winner._id,
    giveawayId: giveaway._id,
    userId: req.user._id,
    prizeId: prize._id,
    fulfillment,
    status: 'SUBMITTED',
    submittedAt: new Date(),
  });
  await audit({
    actorId: req.user._id,
    action: 'CLAIM_SUBMITTED',
    resourceType: 'PrizeClaim',
    resourceId: claim._id,
    metadata: { giveawayId: String(giveaway._id), claimType: prize.claimType },
    req,
  });
  res.status(201).json({
    success: true,
    data: { claim: { status: claim.status, submittedAt: claim.submittedAt } },
  });
}
