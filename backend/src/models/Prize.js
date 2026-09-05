import mongoose from 'mongoose';

const prizeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, default: '' },
    description: { type: String, required: true },
    prizeType: {
      type: String,
      enum: ['PHYSICAL', 'GIFT_CARD', 'DIGITAL'],
      required: true,
    },
    claimType: {
      type: String,
      enum: ['PHYSICAL_ADDRESS', 'EMAIL_ONLY'],
      required: true,
    },
  },
  { timestamps: true },
);
export const Prize = mongoose.model('Prize', prizeSchema);
