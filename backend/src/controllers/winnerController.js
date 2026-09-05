import { GiveawayWinner } from '../models/GiveawayWinner.js';
import { Giveaway } from '../models/Giveaway.js';
import { GiveawayPrize } from '../models/GiveawayPrize.js';
import { AppError } from '../utils/AppError.js';
import {
  getGiveawayByIdentifier,
  effectiveStatus,
} from '../services/giveawayService.js';
import { maskUser } from '../utils/publicUser.js';

const serializeWinner = (winner) => ({
  id: winner._id.toString(),
  maskedUserId: maskUser(winner.userId),
  prize: winner.prizeId.name,
  prizeType: winner.prizeId.prizeType,
  giveaway: winner.giveawayId.title,
  selectedAt: winner.selectedAt,
  status: winner.status,
});

export async function winnersForGiveaway(req, res) {
  const giveaway = await getGiveawayByIdentifier(req.params.id);
  const status = effectiveStatus(giveaway);
  if (status === 'ACTIVE' || status === 'UPCOMING' || status === 'ENDED')
    return res.json({
      success: true,
      data: { announced: false, status, winners: [] },
    });
  const winners = await GiveawayWinner.find({ giveawayId: giveaway._id })
    .populate('userId', 'publicId')
    .populate('prizeId', 'name prizeType')
    .populate('giveawayId', 'title');
  res.json({
    success: true,
    data: { announced: true, status, winners: winners.map(serializeWinner) },
  });
}

export async function previousWinners(_req, res) {
  const winners = await GiveawayWinner.find()
    .sort({ selectedAt: -1 })
    .limit(50)
    .populate('userId', 'publicId')
    .populate('prizeId', 'name prizeType')
    .populate('giveawayId', 'title');
  res.json({
    success: true,
    data: {
      winners: winners.map(serializeWinner),
      meta: { isDemoData: process.env.NODE_ENV !== 'production' },
    },
  });
}
