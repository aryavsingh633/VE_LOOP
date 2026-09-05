import { AppError } from '../utils/AppError.js';

function hasOperator(value) {
  if (!value || typeof value !== 'object') return false;
  return Object.entries(value).some(
    ([key, nested]) =>
      key.startsWith('$') || key.includes('.') || hasOperator(nested),
  );
}

export function rejectQueryOperators(req, _res, next) {
  if (
    hasOperator(req.body) ||
    hasOperator(req.query) ||
    hasOperator(req.params)
  )
    return next(new AppError('VALIDATION_ERROR', 'Invalid request data.', 422));
  next();
}
