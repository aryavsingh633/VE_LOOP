import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';

export function validate(req, _res, next) {
  const result = validationResult(req);
  if (!result.isEmpty())
    return next(
      new AppError(
        'VALIDATION_ERROR',
        'Please check the highlighted information and try again.',
        422,
        result.array().map(({ path, msg }) => ({ field: path, message: msg })),
      ),
    );
  next();
}
