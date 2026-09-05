import mongoose from 'mongoose';

const idempotencyKeySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    key: { type: String, required: true, maxlength: 200 },
    requestHash: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED'],
      default: 'PENDING',
    },
    response: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
);
idempotencyKeySchema.index({ userId: 1, key: 1 }, { unique: true });

export const IdempotencyKey = mongoose.model(
  'IdempotencyKey',
  idempotencyKeySchema,
);
