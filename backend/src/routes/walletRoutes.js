import { Router } from 'express';
import { getWallet } from '../controllers/walletController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
export const walletRouter = Router();
walletRouter.get('/', requireAuth, asyncHandler(getWallet));
