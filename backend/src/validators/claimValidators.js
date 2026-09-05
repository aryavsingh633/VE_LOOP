import { body, param } from 'express-validator';
import { validate } from '../middleware/validate.js';

export const giveawayIdValidator = [
  param('id').isMongoId().withMessage('Invalid giveaway identifier.'),
  validate,
];
export const physicalClaimValidator = [
  body('fullName').optional().trim().isLength({ min: 2, max: 100 }),
  body('phone')
    .optional()
    .matches(/^[6-9][0-9]{9}$/)
    .withMessage('Enter a valid 10-digit phone number.'),
  body('address').optional().trim().isLength({ min: 8, max: 300 }),
  body('city').optional().trim().isLength({ min: 2, max: 80 }),
  body('state').optional().trim().isLength({ min: 2, max: 80 }),
  body('pinCode')
    .optional()
    .matches(/^[1-9][0-9]{5}$/)
    .withMessage('Enter a valid 6-digit PIN code.'),
  body('email').optional().isEmail().normalizeEmail(),
  validate,
];
