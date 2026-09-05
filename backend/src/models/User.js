import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => `VE${Math.floor(100000 + Math.random() * 899999)}`,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['USER', 'ADMIN'],
      default: 'ADMIN',
      index: true,
    },
    accountStatus: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
    },
    refreshTokenHash: { type: String, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_d, r) => {
        delete r.passwordHash;
        delete r.refreshTokenHash;
        return r;
      },
    },
  },
);

userSchema.methods.verifyPassword = function verifyPassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};
userSchema.statics.hashPassword = (password) => bcrypt.hash(password, 12);
export const User = mongoose.model('User', userSchema);
