import { Giveaway } from '../models/Giveaway.js';

export async function syncGiveawayLifecycles() {
  const now = new Date();
  await Giveaway.updateMany(
    { status: 'UPCOMING', startAt: { $lte: now }, endAt: { $gt: now } },
    { $set: { status: 'ACTIVE' } },
  );
  await Giveaway.updateMany(
    { status: { $in: ['UPCOMING', 'ACTIVE'] }, endAt: { $lte: now } },
    { $set: { status: 'ENDED' } },
  );
}

export function startLifecycleJob() {
  syncGiveawayLifecycles().catch((error) =>
    console.error('Lifecycle job failed:', error.message),
  );
  return setInterval(
    () =>
      syncGiveawayLifecycles().catch((error) =>
        console.error('Lifecycle job failed:', error.message),
      ),
    60_000,
  ).unref();
}
