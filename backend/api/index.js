import { createApp } from '../src/app.js';
import { connectDatabase } from '../src/config/database.js';

const app = createApp();
let databaseConnection;

export default async function handler(request, response) {
  if (!databaseConnection) {
    databaseConnection = connectDatabase().catch((error) => {
      databaseConnection = undefined;
      throw error;
    });
  }
  await databaseConnection;
  return app(request, response);
}
