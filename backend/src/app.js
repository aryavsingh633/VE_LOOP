import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import { authRouter } from './routes/authRoutes.js';
import { giveawayRouter } from './routes/giveawayRoutes.js';
import { walletRouter } from './routes/walletRoutes.js';
import { adminRouter } from './routes/adminRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { rejectQueryOperators } from './middleware/sanitize.js';

export function createApp() {
  const app = express();
  const allowedOrigins = env.clientUrl
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin))
          return callback(null, true);
        return callback(new Error('Origin not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    }),
  );
  app.use(express.json({ limit: '20kb' }));
  app.use(cookieParser());
  if (env.nodeEnv !== 'test')
    app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
  app.use(rejectQueryOperators);
  app.get('/api/health', (_req, res) =>
    res.json({ success: true, data: { status: 'ok' } }),
  );
  app.use('/api/auth', authRouter);
  app.use('/api/giveaways', giveawayRouter);
  app.use('/api/wallet', walletRouter);
  app.use('/api/admin', adminRouter);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
