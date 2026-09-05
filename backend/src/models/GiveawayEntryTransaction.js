import mongoose from 'mongoose';

const entryTransactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, unique: true, index: true },
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
    currency: { type: String, enum: ['VE', 'SVE', 'TOKEN'], required: true },
    amount: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      enum: ['GIVEAWAY_ENTRY', 'REVERSAL'],
      default: 'GIVEAWAY_ENTRY',
    },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'REVERSED'],
      default: 'SUCCESS',
    },
    balanceBefore: { type: Number, required: true, min: 0 },
    balanceAfter: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);
entryTransactionSchema.index({ giveawayId: 1, prizeId: 1, createdAt: -1 });

export const GiveawayEntryTransaction = mongoose.model(
  'GiveawayEntryTransaction',
  entryTransactionSchema,
);
