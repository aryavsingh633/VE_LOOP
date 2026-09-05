import mongoose from 'mongoose';

const winnerSchema = new mongoose.Schema(
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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    selectionMethod: { type: String, default: 'HMAC_DETERMINISTIC_DRAW' },
    selectedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['SELECTED', 'NOTIFIED', 'CLAIMED', 'EXPIRED'],
      default: 'SELECTED',
    },
  },
  { timestamps: true },
);
winnerSchema.index({ giveawayId: 1, userId: 1 }, { unique: true });
export const GiveawayWinner = mongoose.model('GiveawayWinner', winnerSchema);
