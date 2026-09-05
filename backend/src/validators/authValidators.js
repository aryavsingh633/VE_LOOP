import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';

export const registerValidator = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('Enter a name between 2 and 80 characters.'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Enter a valid email address.'),
  body('password')
    .isStrongPassword({
      minLength: 10,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    })
    .withMessage(
      'Use at least 10 characters with upper/lowercase letters and a number.',
    ),
  validate,
];
export const loginValidator = [
  body('email').isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 1, max: 200 }),
  validate,
];
