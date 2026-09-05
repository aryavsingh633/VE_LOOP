import test, { before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-access-secret-that-is-long-enough';
process.env.REFRESH_SECRET = 'test-refresh-secret-that-is-long-enough';
process.env.WINNER_SELECTION_SECRET = 'test-winner-secret-that-is-long-enough';
process.env.CLIENT_URL = 'http://localhost:5173';

let app; let replicaSet; const models = {}; let signAccessToken;
before(async () => {
  replicaSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(replicaSet.getUri());
  ({ User: models.User } = await import('../src/models/User.js'));
  ({ Wallet: models.Wallet } = await import('../src/models/Wallet.js'));
  ({ Giveaway: models.Giveaway } = await import('../src/models/Giveaway.js'));
  ({ Prize: models.Prize } = await import('../src/models/Prize.js'));
  ({ GiveawayPrize: models.GiveawayPrize } = await import('../src/models/GiveawayPrize.js'));
  ({ GiveawayParticipation: models.GiveawayParticipation } = await import('../src/models/GiveawayParticipation.js'));
  ({ GiveawayEntryTransaction: models.GiveawayEntryTransaction } = await import('../src/models/GiveawayEntryTransaction.js'));
  ({ GiveawayWinner: models.GiveawayWinner } = await import('../src/models/GiveawayWinner.js'));
  ({ PrizeClaim: models.PrizeClaim } = await import('../src/models/PrizeClaim.js'));
  ({ IdempotencyKey: models.IdempotencyKey } = await import('../src/models/IdempotencyKey.js'));
  ({ createApp } = await import('../src/app.js')); app = createApp();
  ({ signAccessToken } = await import('../src/utils/token.js'));
});
beforeEach(async () => { await Promise.all(Object.values(models).map((Model) => Model.deleteMany({}))); });
after(async () => { await mongoose.disconnect(); await replicaSet.stop(); });

async function setup({ balance = 1000, endAt = new Date(Date.now() + 3_600_000) } = {}) {
  const unique = new mongoose.Types.ObjectId().toString().slice(-10);
  const user = await models.User.create({ publicId: `VE${unique}`, name: 'Security Test', email: `security-${unique}@test.local`, passwordHash: await models.User.hashPassword('ValidPass123') });
  await models.Wallet.create({ userId: user._id, balances: { VE: balance, SVE: 1000, TOKEN: 1000 } });
  const giveaway = await models.Giveaway.create({ title: 'Security test giveaway', slug: `security-${new mongoose.Types.ObjectId().toString().slice(-8)}`, description: 'Test.', status: 'ACTIVE', startAt: new Date(Date.now() - 3_600_000), endAt, rules: [], eligibility: [] });
  const prize = await models.Prize.create({ name: 'Test prize', description: 'Test reward', prizeType: 'DIGITAL', claimType: 'EMAIL_ONLY' });
  await models.GiveawayPrize.create({ giveawayId: giveaway._id, prizeId: prize._id, position: 1, winnerCount: 1, entryCurrency: 'VE', entryAmount: 250 });
  return { user, giveaway, prize, token: signAccessToken(user) };
}

test('join ignores browser-supplied currency, amount, balance, and user id', async () => {
  const { user, giveaway, token } = await setup();
  const response = await request(app).post(`/api/giveaways/${giveaway._id}/join`).set('Authorization', `Bearer ${token}`).set('Idempotency-Key', 'security-ignore-client-values').send({ amount: 1, currency: 'TOKEN', userId: new mongoose.Types.ObjectId().toString(), balance: 999999 });
  assert.equal(response.status, 201); assert.equal(response.body.data.entry.amount, 250); assert.equal(response.body.data.entry.currency, 'VE');
  const wallet = await models.Wallet.findOne({ userId: user._id }); assert.equal(wallet.balances.VE, 750);
  assert.equal(await models.GiveawayParticipation.countDocuments({ userId: user._id }), 1); assert.equal(await models.GiveawayEntryTransaction.countDocuments({ userId: user._id }), 1);
});

test('replayed idempotency keys and racing joins never double-charge', async () => {
  const { user, giveaway, token } = await setup(); const path = `/api/giveaways/${giveaway._id}/join`;
  const first = await request(app).post(path).set('Authorization', `Bearer ${token}`).set('Idempotency-Key', 'stable-replay-key').send({});
  const replay = await request(app).post(path).set('Authorization', `Bearer ${token}`).set('Idempotency-Key', 'stable-replay-key').send({});
  assert.equal(first.status, 201); assert.equal(replay.status, 201); assert.deepEqual(replay.body.data, first.body.data);
  const wallet = await models.Wallet.findOne({ userId: user._id }); assert.equal(wallet.balances.VE, 750); assert.equal(await models.GiveawayParticipation.countDocuments(), 1);
});

test('insufficient balance and an ended giveaway are refused by backend authority', async () => {
  const lowBalance = await setup({ balance: 120 });
  const insufficient = await request(app).post(`/api/giveaways/${lowBalance.giveaway._id}/join`).set('Authorization', `Bearer ${lowBalance.token}`).set('Idempotency-Key', 'insufficient-balance-key').send({});
  assert.equal(insufficient.status, 409); assert.equal(insufficient.body.error.code, 'INSUFFICIENT_VE_BALANCE');
  const ended = await setup({ endAt: new Date(Date.now() - 1_000) });
  const endedResponse = await request(app).post(`/api/giveaways/${ended.giveaway._id}/join`).set('Authorization', `Bearer ${ended.token}`).set('Idempotency-Key', 'ended-giveaway-key').send({});
  assert.equal(endedResponse.status, 409); assert.equal(endedResponse.body.error.code, 'GIVEAWAY_ENDED');
});

test('only the server-verified winner can submit a claim', async () => {
  const { user, giveaway, prize, token } = await setup();
  const refused = await request(app).post(`/api/giveaways/${giveaway._id}/claim`).set('Authorization', `Bearer ${token}`).send({ email: 'winner@test.local' });
  assert.equal(refused.status, 403); assert.equal(refused.body.error.code, 'CLAIM_NOT_ALLOWED');
  await models.GiveawayWinner.create({ giveawayId: giveaway._id, prizeId: prize._id, userId: user._id });
  const accepted = await request(app).post(`/api/giveaways/${giveaway._id}/claim`).set('Authorization', `Bearer ${token}`).send({ email: 'winner@test.local' });
  assert.equal(accepted.status, 201); assert.equal(accepted.body.data.claim.status, 'SUBMITTED');
  assert.equal(await models.PrizeClaim.countDocuments({ userId: user._id }), 1);
});
