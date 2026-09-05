import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema(
  {
    winnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GiveawayWinner',
      required: true,
      unique: true,
      index: true,
    },
    giveawayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Giveaway',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    prizeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prize',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        'NOT_SUBMITTED',
        'SUBMITTED',
        'PROCESSING',
        'COMPLETED',
        'EXPIRED',
      ],
      default: 'NOT_SUBMITTED',
    },
    // Kept private: never selected or returned from public APIs.
    fulfillment: {
      fullName: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      pinCode: String,
      email: String,
    },
    submittedAt: Date,
  },
  { timestamps: true },
);
export const PrizeClaim = mongoose.model('PrizeClaim', claimSchema);
