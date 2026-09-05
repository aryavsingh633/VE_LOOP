import { AppError } from '../utils/AppError.js';

export function notFound(req, _res, next) {
  next(
    new AppError(
      'NOT_FOUND',
      `Route ${req.method} ${req.originalUrl} was not found.`,
      404,
    ),
  );
}

export function errorHandler(error, _req, res, _next) {
  let safeError = error;
  if (error?.name === 'CastError')
    safeError = new AppError(
      'VALIDATION_ERROR',
      'The requested identifier is not valid.',
      422,
    );
  if (error?.code === 11000)
    safeError = new AppError('CONFLICT', 'That record already exists.', 409);
  if (!(safeError instanceof AppError)) {
    console.error(error);
    safeError = new AppError(
      'INTERNAL_ERROR',
      'Something went wrong. Please try again.',
      500,
    );
  }
  res.status(safeError.statusCode).json({
    success: false,
    error: {
      code: safeError.code,
      message: safeError.message,
      ...(safeError.details ? { details: safeError.details } : {}),
    },
  });
}
