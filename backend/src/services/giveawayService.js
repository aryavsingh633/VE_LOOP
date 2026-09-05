import { Giveaway } from '../models/Giveaway.js';
import { GiveawayPrize } from '../models/GiveawayPrize.js';
import { GiveawayParticipation } from '../models/GiveawayParticipation.js';
import { GiveawayWinner } from '../models/GiveawayWinner.js';
import { AppError } from '../utils/AppError.js';

export function effectiveStatus(giveaway, now = new Date()) {
  if (['ARCHIVED', 'WINNERS_SELECTED'].includes(giveaway.status))
    return giveaway.status;
  if (now < new Date(giveaway.startAt)) return 'UPCOMING';
  if (now >= new Date(giveaway.endAt)) return 'ENDED';
  return 'ACTIVE';
}

export async function serializeGiveaway(
  giveaway,
  { includePrivate = false } = {},
) {
  const prizeConfig = await GiveawayPrize.findOne({ giveawayId: giveaway._id })
    .populate('prizeId')
    .lean();
  if (!prizeConfig)
    throw new AppError(
      'PRIZE_CONFIGURATION_INVALID',
      'This giveaway is not configured correctly.',
      500,
    );
  const [participants, winners] = await Promise.all([
    GiveawayParticipation.countDocuments({
      giveawayId: giveaway._id,
      status: 'ACTIVE',
    }),
    GiveawayWinner.countDocuments({ giveawayId: giveaway._id }),
  ]);
  const status = effectiveStatus(giveaway);
  return {
    id: giveaway._id.toString(),
    title: giveaway.title,
    slug: giveaway.slug,
    description: giveaway.description,
    status,
    startAt: giveaway.startAt,
    endAt: giveaway.endAt,
    ...(includePrivate ? { claimDeadlineAt: giveaway.claimDeadlineAt } : {}),
    rules: giveaway.rules,
    eligibility: giveaway.eligibility,
    participationSettings: giveaway.participationSettings,
    participantCount: participants,
    winnerCount: prizeConfig.winnerCount,
    selectedWinnerCount: winners,
    prize: {
      id: prizeConfig.prizeId._id.toString(),
      name: prizeConfig.prizeId.name,
      image: prizeConfig.prizeId.image,
      description: prizeConfig.prizeId.description,
      prizeType: prizeConfig.prizeId.prizeType,
      claimType: prizeConfig.prizeId.claimType,
      position: prizeConfig.position,
      entryCurrency: prizeConfig.entryCurrency,
      entryAmount: prizeConfig.entryAmount,
    },
  };
}

export async function getGiveawayByIdentifier(identifier) {
  const giveaway = /^[a-fA-F0-9]{24}$/.test(identifier)
    ? await Giveaway.findById(identifier)
    : await Giveaway.findOne({ slug: identifier });
  if (!giveaway)
    throw new AppError(
      'GIVEAWAY_NOT_FOUND',
      'This giveaway could not be found.',
      404,
    );
  return giveaway;
}

export async function listCurrentGiveaways() {
  const giveaways = await Giveaway.find({ status: { $ne: 'ARCHIVED' } }).sort({
    endAt: 1,
  });
  const items = await Promise.all(
    giveaways.map((giveaway) => serializeGiveaway(giveaway)),
  );
  return items.filter(({ status }) =>
    ['ACTIVE', 'UPCOMING', 'ENDED', 'WINNERS_SELECTED'].includes(status),
  );
}
