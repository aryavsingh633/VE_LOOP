import 'dotenv/config';

const required = ['MONGO_URI', 'JWT_SECRET', 'REFRESH_SECRET'];
if (process.env.NODE_ENV === 'production') {
  for (const key of required)
    if (!process.env[key])
      throw new Error(`Missing required environment variable: ${key}`);
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/velop_rewards',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'development-only-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshSecret:
    process.env.REFRESH_SECRET || 'development-only-refresh-secret',
  refreshExpiresIn: process.env.REFRESH_EXPIRES_IN || '7d',
  winnerSelectionSecret:
    process.env.WINNER_SELECTION_SECRET || 'development-only-winner-secret',
};
