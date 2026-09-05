import rateLimit from 'express-rate-limit';

const response = (_req, res) =>
  res.status(429).json({
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many attempts. Please wait a moment and try again.',
    },
  });
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: response,
});
export const joinLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  handler: response,
});
export const claimLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: response,
});
