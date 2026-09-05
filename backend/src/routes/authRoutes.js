import { Router } from 'express';
import {
  login,
  logout,
  me,
  refresh,
  register,
} from '../controllers/authController.js';
import { authLimiter } from '../middleware/rateLimiters.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  loginValidator,
  registerValidator,
} from '../validators/authValidators.js';

export const authRouter = Router();
authRouter.post(
  '/register',
  authLimiter,
  registerValidator,
  asyncHandler(register),
);
authRouter.post('/login', authLimiter, loginValidator, asyncHandler(login));
authRouter.post('/refresh', authLimiter, asyncHandler(refresh));
authRouter.post('/logout', requireAuth, asyncHandler(logout));
authRouter.get('/me', requireAuth, asyncHandler(me));
