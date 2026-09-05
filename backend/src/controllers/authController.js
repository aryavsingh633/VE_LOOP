import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Wallet } from '../models/Wallet.js';
import { AppError } from '../utils/AppError.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/token.js';
import { audit } from '../services/auditService.js';

const userPayload = (user) => ({
  id: user._id.toString(),
  publicId: user.publicId,
  name: user.name,
  email: user.email,
  role: user.role,
});
const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/api/auth',
};

async function issueSession(user, res) {
  const refreshToken = signRefreshToken(user);
  await User.updateOne(
    { _id: user._id },
    { $set: { refreshTokenHash: await bcrypt.hash(refreshToken, 10) } },
  );
  res.cookie('velop_refresh', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return { token: signAccessToken(user), user: userPayload(user) };
}

export async function register(req, res) {
  const { name, email, password } = req.body;
  if (await User.exists({ email }))
    throw new AppError(
      'EMAIL_IN_USE',
      'An account with that email already exists.',
      409,
    );
  const user = await User.create({
    name,
    email,
    passwordHash: await User.hashPassword(password),
  });
  await Wallet.create({ userId: user._id });
  await audit({
    actorId: user._id,
    action: 'ACCOUNT_REGISTERED',
    resourceType: 'User',
    resourceId: user._id,
    req,
  });
  res.status(201).json({ success: true, data: await issueSession(user, res) });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select(
    '+passwordHash +refreshTokenHash',
  );
  if (
    !user ||
    !(await user.verifyPassword(password)) ||
    user.accountStatus !== 'ACTIVE'
  )
    throw new AppError(
      'INVALID_CREDENTIALS',
      'Email or password is incorrect.',
      401,
    );
  await audit({
    actorId: user._id,
    action: 'LOGIN',
    resourceType: 'User',
    resourceId: user._id,
    req,
  });
  res.json({ success: true, data: await issueSession(user, res) });
}

export async function refresh(req, res) {
  const token = req.cookies.velop_refresh;
  if (!token) throw new AppError('UNAUTHORIZED', 'Please log in again.', 401);
  try {
    const payload = verifyRefreshToken(token);
    const user = await User.findById(payload.sub).select('+refreshTokenHash');
    if (
      !user ||
      !user.refreshTokenHash ||
      !(await bcrypt.compare(token, user.refreshTokenHash))
    )
      throw new Error('Invalid refresh');
    res.json({ success: true, data: await issueSession(user, res) });
  } catch {
    throw new AppError(
      'UNAUTHORIZED',
      'Your session has expired. Please log in again.',
      401,
    );
  }
}

export async function logout(req, res) {
  if (req.user)
    await User.updateOne(
      { _id: req.user._id },
      { $unset: { refreshTokenHash: 1 } },
    );
  res.clearCookie('velop_refresh', cookieOptions);
  res.json({ success: true, data: { loggedOut: true } });
}

export async function me(req, res) {
  res.json({ success: true, data: { user: userPayload(req.user) } });
}
