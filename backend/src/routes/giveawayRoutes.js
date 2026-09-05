import { Router } from 'express';
import {
  current,
  getOne,
  join,
  myStatus,
  previous,
} from '../controllers/giveawayController.js';
import { myClaim, submitClaim } from '../controllers/claimController.js';
import {
  previousWinners,
  winnersForGiveaway,
} from '../controllers/winnerController.js';
import { requireAuth } from '../middleware/auth.js';
import { claimLimiter, joinLimiter } from '../middleware/rateLimiters.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  giveawayIdValidator,
  physicalClaimValidator,
} from '../validators/claimValidators.js';

export const giveawayRouter = Router();
giveawayRouter.get('/current', asyncHandler(current));
giveawayRouter.get('/previous', asyncHandler(previous));
giveawayRouter.get('/previous/winners', asyncHandler(previousWinners));
giveawayRouter.get(
  '/:id/my-status',
  requireAuth,
  giveawayIdValidator,
  asyncHandler(myStatus),
);
giveawayRouter.post(
  '/:id/join',
  requireAuth,
  joinLimiter,
  giveawayIdValidator,
  asyncHandler(join),
);
giveawayRouter.get('/:id/winners', asyncHandler(winnersForGiveaway));
giveawayRouter.get(
  '/:id/my-claim',
  requireAuth,
  giveawayIdValidator,
  asyncHandler(myClaim),
);
giveawayRouter.post(
  '/:id/claim',
  requireAuth,
  claimLimiter,
  giveawayIdValidator,
  physicalClaimValidator,
  asyncHandler(submitClaim),
);
giveawayRouter.get('/:identifier', asyncHandler(getOne));
