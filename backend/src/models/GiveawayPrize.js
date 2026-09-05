import mongoose from 'mongoose';

const giveawayPrizeSchema = new mongoose.Schema(
  {
    giveawayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Giveaway',
      required: true,
      index: true,
    },
    prizeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prize',
      required: true,
      index: true,
    },
    position: { type: Number, required: true, min: 1 },
    winnerCount: { type: Number, required: true, min: 1 },
    entryCurrency: {
      type: String,
      required: true,
      enum: ['VE', 'SVE', 'TOKEN'],
    },
    entryAmount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);
giveawayPrizeSchema.index({ giveawayId: 1, prizeId: 1 }, { unique: true });

export const GiveawayPrize = mongoose.model(
  'GiveawayPrize',
  giveawayPrizeSchema,
);
