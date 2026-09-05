import { createApp } from './src/app.js';
import { connectDatabase } from './src/config/database.js';
import { env } from './src/config/env.js';
import { startLifecycleJob } from './src/jobs/lifecycleJob.js';

async function bootstrap() {
  await connectDatabase();
  startLifecycleJob();
  createApp().listen(env.port, () =>
    console.info(`VELOOP API listening on port ${env.port}`),
  );
}

bootstrap().catch((error) => {
  console.error('Unable to start VELOOP API:', error.message);
  process.exit(1);
});
