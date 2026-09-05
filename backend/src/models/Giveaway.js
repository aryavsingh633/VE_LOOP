import mongoose from 'mongoose';

const giveawaySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      index: true,
    },
    description: { type: String, required: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ['UPCOMING', 'ACTIVE', 'ENDED', 'WINNERS_SELECTED', 'ARCHIVED'],
      required: true,
      default: 'UPCOMING',
      index: true,
    },
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true, index: true },
    claimDeadlineAt: { type: Date },
    rules: [{ type: String, maxlength: 500 }],
    eligibility: [{ type: String, maxlength: 500 }],
    participationSettings: {
      oneEntryPerUser: { type: Boolean, default: true },
      minAccountAgeDays: { type: Number, default: 0, min: 0 },
    },
  },
  { timestamps: true },
);
giveawaySchema.index({ status: 1, startAt: 1, endAt: 1 });

export const Giveaway = mongoose.model('Giveaway', giveawaySchema);
