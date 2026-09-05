import mongoose from 'mongoose';

const fraudEventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    giveawayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Giveaway',
      index: true,
    },
    riskScore: { type: Number, required: true, min: 0, max: 100 },
    signals: [{ type: String }],
    action: {
      type: String,
      enum: ['LOGGED', 'REVIEW', 'BLOCKED'],
      default: 'LOGGED',
    },
    deviceHash: String,
    ipHash: String,
  },
  { timestamps: true },
);
fraudEventSchema.index({ createdAt: -1, riskScore: -1 });
export const FraudEvent = mongoose.model('FraudEvent', fraudEventSchema);
