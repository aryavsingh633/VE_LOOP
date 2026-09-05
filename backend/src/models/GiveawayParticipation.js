import mongoose from 'mongoose';

const participationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
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
    entryCurrency: {
      type: String,
      enum: ['VE', 'SVE', 'TOKEN'],
      required: true,
    },
    entryAmount: { type: Number, required: true, min: 0 },
    deviceHash: { type: String, maxlength: 128 },
    status: {
      type: String,
      enum: ['ACTIVE', 'DISQUALIFIED'],
      default: 'ACTIVE',
    },
    joinedAt: { type: Date, default: Date.now },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GiveawayEntryTransaction',
    },
  },
  { timestamps: true },
);
participationSchema.index({ userId: 1, giveawayId: 1 }, { unique: true });

export const GiveawayParticipation = mongoose.model(
  'GiveawayParticipation',
  participationSchema,
);
