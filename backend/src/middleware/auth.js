import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { verifyAccessToken } from '../utils/token.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token)
    throw new AppError(
      'LOGIN_REQUIRED',
      'Please log in before continuing.',
      401,
    );
  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);
    if (!user || user.accountStatus !== 'ACTIVE')
      throw new AppError('UNAUTHORIZED', 'Your session is not valid.', 401);
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      'UNAUTHORIZED',
      'Your session has expired. Please log in again.',
      401,
    );
  }
});

export const requireRole =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role))
      return next(
        new AppError(
          'FORBIDDEN',
          'You do not have access to this action.',
          403,
        ),
      );
    next();
  };
