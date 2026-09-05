import { Wallet } from '../models/Wallet.js';
import { AppError } from '../utils/AppError.js';

export async function getWallet(req, res) {
  const wallet = await Wallet.findOne({ userId: req.user._id });
  if (!wallet)
    throw new AppError(
      'WALLET_NOT_FOUND',
      'Your wallet is not available.',
      404,
    );
  res.json({
    success: true,
    data: { balances: wallet.balances, updatedAt: wallet.updatedAt },
  });
}
