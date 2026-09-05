import { Giveaway } from '../models/Giveaway.js';
import { GiveawayParticipation } from '../models/GiveawayParticipation.js';
import { GiveawayWinner } from '../models/GiveawayWinner.js';
import { AppError } from '../utils/AppError.js';
import {
  getGiveawayByIdentifier,
  listCurrentGiveaways,
  serializeGiveaway,
} from '../services/giveawayService.js';
import { joinGiveaway } from '../services/participationService.js';

export async function current(req, res) {
  const items = await listCurrentGiveaways();
  const [participants, rewardsWon] = await Promise.all([
    GiveawayParticipation.countDocuments(),
    GiveawayWinner.countDocuments(),
  ]);
  res.json({
    success: true,
    data: {
      items,
      stats: {
        activeGiveaways: items.filter((item) => item.status === 'ACTIVE')
          .length,
        participants,
        rewardsWon,
      },
      meta: { isDemoData: process.env.NODE_ENV !== 'production' },
    },
  });
}

export async function previous(req, res) {
  const records = await Giveaway.find({
    status: { $in: ['WINNERS_SELECTED', 'ARCHIVED'] },
  })
    .sort({ endAt: -1 })
    .limit(30);
  res.json({
    success: true,
    data: {
      items: await Promise.all(
        records.map((record) => serializeGiveaway(record)),
      ),
    },
  });
}

export async function getOne(req, res) {
  const giveaway = await getGiveawayByIdentifier(req.params.identifier);
  res.json({
    success: true,
    data: await serializeGiveaway(giveaway, {
      includePrivate: Boolean(req.user),
    }),
  });
}

export async function myStatus(req, res) {
  const giveaway = await getGiveawayByIdentifier(req.params.id);
  const [participation, winner] = await Promise.all([
    GiveawayParticipation.findOne({
      giveawayId: giveaway._id,
      userId: req.user._id,
    }),
    GiveawayWinner.findOne({ giveawayId: giveaway._id, userId: req.user._id }),
  ]);
  res.json({
    success: true,
    data: {
      participating: Boolean(participation),
      participation: participation
        ? {
            id: participation._id,
            joinedAt: participation.joinedAt,
            status: participation.status,
          }
        : null,
      winner: Boolean(winner),
      winnerId: winner?._id || null,
    },
  });
}

export async function join(req, res) {
  const data = await joinGiveaway({
    giveawayId: req.params.id,
    user: req.user,
    req,
  });
  res.status(201).json({ success: true, data });
}
