import { Router } from 'express';
import * as admin from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { giveawayIdValidator } from '../validators/claimValidators.js';

export const adminRouter = Router();
adminRouter.use(requireAuth, requireRole('ADMIN'));
adminRouter.get('/dashboard', asyncHandler(admin.dashboard));
adminRouter.get('/giveaways', asyncHandler(admin.listGiveaways));
adminRouter.post('/giveaways', asyncHandler(admin.createGiveaway));
adminRouter.patch(
  '/giveaways/:id',
  giveawayIdValidator,
  asyncHandler(admin.updateGiveaway),
);
adminRouter.get(
  '/giveaways/:id/participants',
  giveawayIdValidator,
  asyncHandler(admin.participants),
);
adminRouter.post(
  '/giveaways/:id/select-winners',
  giveawayIdValidator,
  asyncHandler(admin.finalizeWinners),
);
adminRouter.get('/participants', asyncHandler(admin.participants));
adminRouter.get('/winners', asyncHandler(admin.winners));
adminRouter.get('/claims', asyncHandler(admin.claims));
adminRouter.patch('/claims/:claimId', asyncHandler(admin.updateClaim));
adminRouter.get('/fraud', asyncHandler(admin.fraudEvents));
adminRouter.get('/audit-logs', asyncHandler(admin.auditLogs));
