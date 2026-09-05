import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';

import { User } from '../models/User.js';
import { Wallet } from '../models/Wallet.js';
import { Giveaway } from '../models/Giveaway.js';
import { Prize } from '../models/Prize.js';
import { GiveawayPrize } from '../models/GiveawayPrize.js';
import { GiveawayParticipation } from '../models/GiveawayParticipation.js';
import { GiveawayWinner } from '../models/GiveawayWinner.js';
import { PrizeClaim } from '../models/PrizeClaim.js';
import { GiveawayEntryTransaction } from '../models/GiveawayEntryTransaction.js';
import { FraudEvent } from '../models/FraudEvent.js';
import { AuditLog } from '../models/AuditLog.js';
import { IdempotencyKey } from '../models/IdempotencyKey.js';

const DAY = 24 * 60 * 60 * 1000;

const daysFromNow = (days) => new Date(Date.now() + days * DAY);

const daysAgo = (days) => new Date(Date.now() - days * DAY);

/* =========================================================
   DEMO USERS
========================================================= */

const userSeeds = [
  {
    key: 'member',
    publicId: 'VE10042',
    name: 'Demo Member',
    email: 'member@velop.demo',
    balances: {
      VE: 1500,
      SVE: 1200,
      TOKEN: 6000,
    },
  },

  {
    key: 'winner',
    publicId: 'VE10091',
    name: 'Demo Winner',
    email: 'winner@velop.demo',
    balances: {
      VE: 1800,
      SVE: 1500,
      TOKEN: 8000,
    },
  },

  {
    key: 'nonWinner',
    publicId: 'VE10027',
    name: 'Demo Non Winner',
    email: 'nonwinner@velop.demo',
    balances: {
      VE: 1200,
      SVE: 900,
      TOKEN: 5000,
    },
  },

  {
    key: 'lowBalance',
    publicId: 'VE10013',
    name: 'Low Balance User',
    email: 'lowbalance@velop.demo',
    balances: {
      VE: 120,
      SVE: 30,
      TOKEN: 80,
    },
  },

  {
    key: 'duplicateTester',
    publicId: 'VE10055',
    name: 'Duplicate Test User',
    email: 'duplicate@velop.demo',
    balances: {
      VE: 1000,
      SVE: 1000,
      TOKEN: 4000,
    },
  },

  {
    key: 'physicalWinner',
    publicId: 'VE10061',
    name: 'Physical Prize Winner',
    email: 'physicalwinner@velop.demo',
    balances: {
      VE: 1500,
      SVE: 1000,
      TOKEN: 4000,
    },
  },

  {
    key: 'giftCardWinner',
    publicId: 'VE10072',
    name: 'Gift Card Winner',
    email: 'giftwinner@velop.demo',
    balances: {
      VE: 1400,
      SVE: 1000,
      TOKEN: 4000,
    },
  },

  {
    key: 'anotherUser',
    publicId: 'VE10083',
    name: 'Another Demo User',
    email: 'another@velop.demo',
    balances: {
      VE: 1300,
      SVE: 1000,
      TOKEN: 4500,
    },
  },

  {
    key: 'anotherWinner',
    publicId: 'VE10094',
    name: 'Another Winner',
    email: 'anotherwinner@velop.demo',
    balances: {
      VE: 1600,
      SVE: 1300,
      TOKEN: 5000,
    },
  },

  {
    key: 'suspicious',
    publicId: 'VE10105',
    name: 'Suspicious Activity User',
    email: 'suspicious@velop.demo',
    balances: {
      VE: 1000,
      SVE: 500,
      TOKEN: 2000,
    },
  },

  {
    key: 'suspended',
    publicId: 'VE10116',
    name: 'Suspended User',
    email: 'suspended@velop.demo',
    accountStatus: 'SUSPENDED',
    balances: {
      VE: 1000,
      SVE: 1000,
      TOKEN: 1000,
    },
  },

  {
    key: 'admin',
    publicId: 'VE90001',
    name: 'Demo Admin',
    email: 'admin@velop.demo',
    role: 'ADMIN',
    balances: {
      VE: 0,
      SVE: 0,
      TOKEN: 0,
    },
  },
];

/* =========================================================
   PRIZE DATA
========================================================= */

const prizeSeeds = {
  iphone: {
    name: 'iPhone 15 Pro',
    description: 'A premium titanium smartphone reward.',
    prizeType: 'PHYSICAL',
    claimType: 'PHYSICAL_ADDRESS',
    image: '📱',
  },

  appleWatch: {
    name: 'Apple Watch Series 9',
    description: 'An all-day health and fitness companion.',
    prizeType: 'PHYSICAL',
    claimType: 'PHYSICAL_ADDRESS',
    image: '⌚',
  },

  airpods: {
    name: 'AirPods Pro',
    description: 'Immersive audio with adaptive noise control.',
    prizeType: 'PHYSICAL',
    claimType: 'PHYSICAL_ADDRESS',
    image: '🎧',
  },

  amazon2000: {
    name: '₹2,000 Amazon Gift Card',
    description: 'A flexible digital reward for your next purchase.',
    prizeType: 'GIFT_CARD',
    claimType: 'EMAIL_ONLY',
    image: '₹',
  },

  amazon500: {
    name: '₹500 Amazon Gift Card',
    description: 'A digital reward for your wishlist.',
    prizeType: 'GIFT_CARD',
    claimType: 'EMAIL_ONLY',
    image: '₹',
  },

  amazon20: {
    name: '₹20 Amazon Voucher',
    description: 'A quick everyday reward delivered by email.',
    prizeType: 'GIFT_CARD',
    claimType: 'EMAIL_ONLY',
    image: '₹',
  },

  gamingConsole: {
    name: 'Gaming Console',
    description: 'A premium gaming console development reward.',
    prizeType: 'PHYSICAL',
    claimType: 'PHYSICAL_ADDRESS',
    image: '🎮',
  },

  premiumHeadphones: {
    name: 'Premium Headphones',
    description: 'High-quality wireless headphones.',
    prizeType: 'PHYSICAL',
    claimType: 'PHYSICAL_ADDRESS',
    image: '🎧',
  },
};

/* =========================================================
   HELPERS
========================================================= */

async function createUser(seed) {
  const user = await User.create({
    publicId: seed.publicId,
    name: seed.name,
    email: seed.email,
    role: seed.role || 'USER',
    accountStatus: seed.accountStatus || 'ACTIVE',
    passwordHash: await User.hashPassword('DemoPass123'),
  });

  const wallet = await Wallet.create({
    userId: user._id,
    balances: seed.balances,
  });

  return {
    user,
    wallet,
  };
}

async function createPrize(prizeData) {
  return Prize.create(prizeData);
}

async function createGiveaway({
  title,
  slug,
  description,
  status,
  startAt,
  endAt,
  claimDeadlineAt,
  rules,
  eligibility,
}) {
  return Giveaway.create({
    title,
    slug,
    description,
    status,
    startAt,
    endAt,
    claimDeadlineAt,

    rules: rules || [
      'One entry per verified VELOOP account.',
      'Entry fee is deducted only after successful participation.',
      'Winners are selected after the giveaway ends.',
      'Prize claims must be submitted before the claim deadline.',
      'Fraudulent or abusive activity may result in disqualification.',
    ],

    eligibility: eligibility || [
      'User must have an active VELOOP Rewards account.',
      'User must comply with VELOOP participation rules.',
    ],

    participationSettings: {
      oneEntryPerUser: true,
      minAccountAgeDays: 0,
    },
  });
}

async function attachPrize({
  giveawayId,
  prizeId,
  position,
  winnerCount,
  entryCurrency,
  entryAmount,
}) {
  return GiveawayPrize.create({
    giveawayId,
    prizeId,
    position,
    winnerCount,
    entryCurrency,
    entryAmount,
  });
}

/*
 * Creates a successful participation and corresponding
 * entry transaction.
 *
 * Wallet balance is actually reduced so the seeded data
 * remains internally consistent.
 */
async function createEntry({
  user,
  giveaway,
  prize,
  currency,
  amount,
  deviceHash,
}) {
  const wallet = await Wallet.findOne({
    userId: user._id,
  });

  if (!wallet) {
    throw new Error(`Wallet not found for ${user.email}`);
  }

  const balanceBefore = wallet.balances[currency];

  if (balanceBefore < amount) {
    throw new Error(`Insufficient ${currency} balance for ${user.email}`);
  }

  const balanceAfter = balanceBefore - amount;

  wallet.balances[currency] = balanceAfter;

  await wallet.save();

  const transaction = await GiveawayEntryTransaction.create({
    transactionId: `TXN-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,

    userId: user._id,
    giveawayId: giveaway._id,
    prizeId: prize._id,

    currency,
    amount,

    type: 'GIVEAWAY_ENTRY',
    status: 'SUCCESS',

    balanceBefore,
    balanceAfter,
  });

  const participation = await GiveawayParticipation.create({
    userId: user._id,
    giveawayId: giveaway._id,
    prizeId: prize._id,

    entryCurrency: currency,
    entryAmount: amount,

    deviceHash: deviceHash || `device-${user.publicId}`,

    status: 'ACTIVE',

    joinedAt: new Date(),

    transactionId: transaction._id,
  });

  return {
    participation,
    transaction,
  };
}

/*
 * Creates a failed transaction for testing insufficient
 * balance behavior. No money is deducted and no
 * participation is created.
 */
async function createFailedEntry({ user, giveaway, prize, currency, amount }) {
  const wallet = await Wallet.findOne({
    userId: user._id,
  });

  const balanceBefore = wallet.balances[currency];

  return GiveawayEntryTransaction.create({
    transactionId: `TXN-FAILED-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,

    userId: user._id,
    giveawayId: giveaway._id,
    prizeId: prize._id,

    currency,
    amount,

    type: 'GIVEAWAY_ENTRY',
    status: 'FAILED',

    balanceBefore,
    balanceAfter: balanceBefore,
  });
}

async function createWinner({
  giveaway,
  prize,
  user,
  status = 'SELECTED',
  selectedAt,
}) {
  return GiveawayWinner.create({
    giveawayId: giveaway._id,
    prizeId: prize._id,
    userId: user._id,

    selectionMethod: 'HMAC_DETERMINISTIC_DRAW',

    selectedAt: selectedAt || daysAgo(10),

    status,
  });
}

async function createClaim({
  winner,
  giveaway,
  prize,
  user,
  status,
  fulfillment,
  submittedAt,
}) {
  return PrizeClaim.create({
    winnerId: winner._id,
    giveawayId: giveaway._id,
    userId: user._id,
    prizeId: prize._id,

    status,

    fulfillment,

    submittedAt,
  });
}

/* =========================================================
   MAIN SEED
========================================================= */

async function seed() {
  try {
    await connectDatabase();

    console.log('Connected to database.');
    console.log('Clearing development database...');

    /* -----------------------------------------------------
       RESET
    ----------------------------------------------------- */

    await Promise.all([
      User.deleteMany({}),
      Wallet.deleteMany({}),

      Giveaway.deleteMany({}),
      Prize.deleteMany({}),
      GiveawayPrize.deleteMany({}),

      GiveawayParticipation.deleteMany({}),
      GiveawayEntryTransaction.deleteMany({}),

      GiveawayWinner.deleteMany({}),
      PrizeClaim.deleteMany({}),

      FraudEvent.deleteMany({}),
      AuditLog.deleteMany({}),
      IdempotencyKey.deleteMany({}),
    ]);

    /* -----------------------------------------------------
       USERS + WALLETS
    ----------------------------------------------------- */

    const users = {};

    for (const seedData of userSeeds) {
      users[seedData.key] = await createUser(seedData);
    }

    console.log(`Created ${Object.keys(users).length} users.`);

    /* -----------------------------------------------------
       PRIZES
    ----------------------------------------------------- */

    const prizes = {};

    for (const [key, prizeData] of Object.entries(prizeSeeds)) {
      prizes[key] = await createPrize(prizeData);
    }

    console.log(`Created ${Object.keys(prizes).length} prizes.`);

    /* =====================================================
       1. CURRENT ACTIVE GIVEAWAY
    ===================================================== */

    const activeGiveaway = await createGiveaway({
      title: 'Summer Rewards Giveaway',
      slug: 'summer-rewards-2026',

      description:
        'Complete eligible activities, collect entries and get a chance to win premium rewards.',

      status: 'ACTIVE',

      startAt: daysAgo(2),
      endAt: daysFromNow(12),
      claimDeadlineAt: daysFromNow(19),
    });

    await attachPrize({
      giveawayId: activeGiveaway._id,
      prizeId: prizes.iphone._id,
      position: 1,
      winnerCount: 1,
      entryCurrency: 'VE',
      entryAmount: 250,
    });

    await attachPrize({
      giveawayId: activeGiveaway._id,
      prizeId: prizes.appleWatch._id,
      position: 2,
      winnerCount: 3,
      entryCurrency: 'VE',
      entryAmount: 200,
    });

    await attachPrize({
      giveawayId: activeGiveaway._id,
      prizeId: prizes.airpods._id,
      position: 3,
      winnerCount: 5,
      entryCurrency: 'SVE',
      entryAmount: 500,
    });

    await attachPrize({
      giveawayId: activeGiveaway._id,
      prizeId: prizes.amazon2000._id,
      position: 4,
      winnerCount: 10,
      entryCurrency: 'VE',
      entryAmount: 500,
    });

    await attachPrize({
      giveawayId: activeGiveaway._id,
      prizeId: prizes.amazon500._id,
      position: 5,
      winnerCount: 15,
      entryCurrency: 'VE',
      entryAmount: 300,
    });

    await attachPrize({
      giveawayId: activeGiveaway._id,
      prizeId: prizes.amazon20._id,
      position: 6,
      winnerCount: 30,
      entryCurrency: 'TOKEN',
      entryAmount: 2000,
    });

    /* -----------------------------------------------------
       ACTIVE PARTICIPATIONS
    ----------------------------------------------------- */

    // Demo Member -> iPhone
    await createEntry({
      user: users.member.user,
      giveaway: activeGiveaway,
      prize: prizes.iphone,
      currency: 'VE',
      amount: 250,
      deviceHash: 'device-member-001',
    });

    // Demo Winner -> Apple Watch
    await createEntry({
      user: users.winner.user,
      giveaway: activeGiveaway,
      prize: prizes.appleWatch,
      currency: 'VE',
      amount: 200,
      deviceHash: 'device-winner-001',
    });

    // Non Winner -> AirPods
    await createEntry({
      user: users.nonWinner.user,
      giveaway: activeGiveaway,
      prize: prizes.airpods,
      currency: 'SVE',
      amount: 500,
      deviceHash: 'device-nonwinner-001',
    });

    // Duplicate tester -> Amazon ₹500
    await createEntry({
      user: users.duplicateTester.user,
      giveaway: activeGiveaway,
      prize: prizes.amazon500,
      currency: 'VE',
      amount: 300,
      deviceHash: 'device-duplicate-001',
    });

    // Another participant -> Amazon ₹20
    await createEntry({
      user: users.anotherUser.user,
      giveaway: activeGiveaway,
      prize: prizes.amazon20,
      currency: 'TOKEN',
      amount: 2000,
      deviceHash: 'device-another-001',
    });

    /*
     * Low balance user tries to enter iPhone.
     *
     * Required amount = 250 VE
     * Available = 120 VE
     *
     * This creates a FAILED transaction.
     */
    await createFailedEntry({
      user: users.lowBalance.user,
      giveaway: activeGiveaway,
      prize: prizes.iphone,
      currency: 'VE',
      amount: 250,
    });

    /* =====================================================
       2. UPCOMING GIVEAWAY
    ===================================================== */

    const upcomingGiveaway = await createGiveaway({
      title: 'Festival Rewards Giveaway',
      slug: 'festival-rewards-2026',

      description:
        'Get ready for the next VELOOP rewards event featuring exciting premium prizes.',

      status: 'UPCOMING',

      startAt: daysFromNow(5),
      endAt: daysFromNow(19),
      claimDeadlineAt: daysFromNow(26),

      rules: [
        'The giveaway has not started yet.',
        'Participation opens when the giveaway becomes active.',
        'Only eligible VELOOP users may participate.',
      ],

      eligibility: ['Active VELOOP Rewards account required.'],
    });

    await attachPrize({
      giveawayId: upcomingGiveaway._id,
      prizeId: prizes.gamingConsole._id,
      position: 1,
      winnerCount: 1,
      entryCurrency: 'VE',
      entryAmount: 400,
    });

    await attachPrize({
      giveawayId: upcomingGiveaway._id,
      prizeId: prizes.premiumHeadphones._id,
      position: 2,
      winnerCount: 3,
      entryCurrency: 'SVE',
      entryAmount: 350,
    });

    /* =====================================================
       3. ENDED / WINNERS SELECTED GIVEAWAY
    ===================================================== */

    const endedGiveaway = await createGiveaway({
      title: 'Monsoon Rewards Giveaway',
      slug: 'monsoon-rewards-2026',

      description:
        'Completed development giveaway used for winner and claim history.',

      status: 'WINNERS_SELECTED',

      startAt: daysAgo(35),
      endAt: daysAgo(20),
      claimDeadlineAt: daysAgo(13),
    });

    await attachPrize({
      giveawayId: endedGiveaway._id,
      prizeId: prizes.iphone._id,
      position: 1,
      winnerCount: 1,
      entryCurrency: 'VE',
      entryAmount: 250,
    });

    await attachPrize({
      giveawayId: endedGiveaway._id,
      prizeId: prizes.appleWatch._id,
      position: 2,
      winnerCount: 3,
      entryCurrency: 'VE',
      entryAmount: 200,
    });

    await attachPrize({
      giveawayId: endedGiveaway._id,
      prizeId: prizes.airpods._id,
      position: 3,
      winnerCount: 2,
      entryCurrency: 'SVE',
      entryAmount: 500,
    });

    await attachPrize({
      giveawayId: endedGiveaway._id,
      prizeId: prizes.amazon2000._id,
      position: 4,
      winnerCount: 3,
      entryCurrency: 'VE',
      entryAmount: 500,
    });

    /*
     * Historical participants
     */

    const endedEntries = [
      {
        user: users.member.user,
        prize: prizes.iphone,
        currency: 'VE',
        amount: 250,
      },

      {
        user: users.winner.user,
        prize: prizes.appleWatch,
        currency: 'VE',
        amount: 200,
      },

      {
        user: users.nonWinner.user,
        prize: prizes.appleWatch,
        currency: 'VE',
        amount: 200,
      },

      {
        user: users.physicalWinner.user,
        prize: prizes.appleWatch,
        currency: 'VE',
        amount: 200,
      },

      {
        user: users.giftCardWinner.user,
        prize: prizes.airpods,
        currency: 'SVE',
        amount: 500,
      },

      {
        user: users.anotherUser.user,
        prize: prizes.airpods,
        currency: 'SVE',
        amount: 500,
      },

      {
        user: users.anotherWinner.user,
        prize: prizes.amazon2000,
        currency: 'VE',
        amount: 500,
      },

      {
        user: users.suspicious.user,
        prize: prizes.amazon2000,
        currency: 'VE',
        amount: 500,
      },
    ];

    for (const entry of endedEntries) {
      await createEntry({
        user: entry.user,
        giveaway: endedGiveaway,
        prize: entry.prize,
        currency: entry.currency,
        amount: entry.amount,

        deviceHash: `historic-${entry.user.publicId}`,
      });
    }

    /* -----------------------------------------------------
       HISTORICAL WINNERS
    ----------------------------------------------------- */

    // iPhone winner
    const iphoneWinner = await createWinner({
      giveaway: endedGiveaway,
      prize: prizes.iphone,
      user: users.member.user,
      status: 'CLAIMED',
      selectedAt: daysAgo(19),
    });

    // Apple Watch winners
    const watchWinner1 = await createWinner({
      giveaway: endedGiveaway,
      prize: prizes.appleWatch,
      user: users.winner.user,
      status: 'NOTIFIED',
      selectedAt: daysAgo(19),
    });

    const watchWinner2 = await createWinner({
      giveaway: endedGiveaway,
      prize: prizes.appleWatch,
      user: users.nonWinner.user,
      status: 'CLAIMED',
      selectedAt: daysAgo(19),
    });

    const watchWinner3 = await createWinner({
      giveaway: endedGiveaway,
      prize: prizes.appleWatch,
      user: users.physicalWinner.user,
      status: 'NOTIFIED',
      selectedAt: daysAgo(19),
    });

    // AirPods winners
    const airpodsWinner1 = await createWinner({
      giveaway: endedGiveaway,
      prize: prizes.airpods,
      user: users.giftCardWinner.user,
      status: 'NOTIFIED',
      selectedAt: daysAgo(19),
    });

    const airpodsWinner2 = await createWinner({
      giveaway: endedGiveaway,
      prize: prizes.airpods,
      user: users.anotherUser.user,
      status: 'SELECTED',
      selectedAt: daysAgo(19),
    });

    // Amazon winners
    const amazonWinner1 = await createWinner({
      giveaway: endedGiveaway,
      prize: prizes.amazon2000,
      user: users.anotherWinner.user,
      status: 'CLAIMED',
      selectedAt: daysAgo(19),
    });

    const amazonWinner2 = await createWinner({
      giveaway: endedGiveaway,
      prize: prizes.amazon2000,
      user: users.suspicious.user,
      status: 'EXPIRED',
      selectedAt: daysAgo(19),
    });

    /*
     * NOTE:
     * The winner schema uses giveawayId + userId as unique.
     * Therefore every winner above is a different user.
     */

    /* -----------------------------------------------------
       CLAIMS
    ----------------------------------------------------- */

    /*
     * iPhone
     * COMPLETED physical claim
     */
    await createClaim({
      winner: iphoneWinner,
      giveaway: endedGiveaway,
      prize: prizes.iphone,
      user: users.member.user,

      status: 'COMPLETED',

      fulfillment: {
        fullName: 'Demo Member',
        phone: '9876543210',
        address: '12 Demo Street',
        city: 'Prayagraj',
        state: 'Uttar Pradesh',
        pinCode: '211001',
      },

      submittedAt: daysAgo(18),
    });

    /*
     * Apple Watch
     * PROCESSING physical claim
     */
    await createClaim({
      winner: watchWinner1,
      giveaway: endedGiveaway,
      prize: prizes.appleWatch,
      user: users.winner.user,

      status: 'PROCESSING',

      fulfillment: {
        fullName: 'Demo Winner',
        phone: '9876543211',
        address: '45 Reward Avenue',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        pinCode: '226001',
      },

      submittedAt: daysAgo(17),
    });

    /*
     * Apple Watch
     * SUBMITTED physical claim
     */
    await createClaim({
      winner: watchWinner2,
      giveaway: endedGiveaway,
      prize: prizes.appleWatch,
      user: users.nonWinner.user,

      status: 'SUBMITTED',

      fulfillment: {
        fullName: 'Demo Non Winner',
        phone: '9876543212',
        address: '78 Demo Colony',
        city: 'Kanpur',
        state: 'Uttar Pradesh',
        pinCode: '208001',
      },

      submittedAt: daysAgo(16),
    });

    /*
     * Apple Watch
     * NOT_SUBMITTED
     */
    await createClaim({
      winner: watchWinner3,
      giveaway: endedGiveaway,
      prize: prizes.appleWatch,
      user: users.physicalWinner.user,

      status: 'NOT_SUBMITTED',

      fulfillment: {},

      submittedAt: null,
    });

    /*
     * AirPods
     * Gift-card style isn't applicable here;
     * this is a physical prize.
     */
    await createClaim({
      winner: airpodsWinner1,
      giveaway: endedGiveaway,
      prize: prizes.airpods,
      user: users.giftCardWinner.user,

      status: 'SUBMITTED',

      fulfillment: {
        fullName: 'Gift Card Winner',
        phone: '9876543213',
        address: '90 Reward Road',
        city: 'Noida',
        state: 'Uttar Pradesh',
        pinCode: '201301',
      },

      submittedAt: daysAgo(15),
    });

    /*
     * Amazon Gift Card
     * EMAIL_ONLY claim
     */
    await createClaim({
      winner: amazonWinner1,
      giveaway: endedGiveaway,
      prize: prizes.amazon2000,
      user: users.anotherWinner.user,

      status: 'COMPLETED',

      fulfillment: {
        email: 'anotherwinner@velop.demo',
      },

      submittedAt: daysAgo(16),
    });

    /*
     * Expired claim
     */
    await createClaim({
      winner: amazonWinner2,
      giveaway: endedGiveaway,
      prize: prizes.amazon2000,
      user: users.suspicious.user,

      status: 'EXPIRED',

      fulfillment: {},

      submittedAt: null,
    });

    /* =====================================================
       4. ARCHIVED GIVEAWAY
    ===================================================== */

    const archivedGiveaway = await createGiveaway({
      title: 'Spring Rewards Giveaway',
      slug: 'spring-rewards-2026',

      description: 'Archived historical development giveaway.',

      status: 'ARCHIVED',

      startAt: daysAgo(90),
      endAt: daysAgo(75),
      claimDeadlineAt: daysAgo(68),
    });

    await attachPrize({
      giveawayId: archivedGiveaway._id,
      prizeId: prizes.amazon500._id,
      position: 1,
      winnerCount: 5,
      entryCurrency: 'VE',
      entryAmount: 300,
    });

    const archivedEntry = await createEntry({
      user: users.anotherWinner.user,
      giveaway: archivedGiveaway,
      prize: prizes.amazon500,
      currency: 'VE',
      amount: 300,

      deviceHash: 'archived-device-001',
    });

    const archivedWinner = await createWinner({
      giveaway: archivedGiveaway,
      prize: prizes.amazon500,
      user: users.anotherWinner.user,
      status: 'EXPIRED',
      selectedAt: daysAgo(74),
    });

    await createClaim({
      winner: archivedWinner,
      giveaway: archivedGiveaway,
      prize: prizes.amazon500,
      user: users.anotherWinner.user,

      status: 'EXPIRED',

      fulfillment: {},

      submittedAt: null,
    });

    /* =====================================================
       FRAUD EVENTS
    ===================================================== */

    /*
     * Suspicious device activity
     */
    await FraudEvent.create({
      userId: users.suspicious.user._id,
      giveawayId: activeGiveaway._id,

      riskScore: 82,

      signals: [
        'MULTIPLE_REQUESTS',
        'SUSPICIOUS_DEVICE',
        'HIGH_REQUEST_FREQUENCY',
      ],

      action: 'REVIEW',

      deviceHash: 'suspicious-device-001',
      ipHash: 'ip-hash-demo-001',
    });

    /*
     * High-risk blocked activity
     */
    await FraudEvent.create({
      userId: users.suspended.user._id,
      giveawayId: activeGiveaway._id,

      riskScore: 97,

      signals: ['SUSPENDED_ACCOUNT', 'SUSPICIOUS_DEVICE', 'ABNORMAL_ACTIVITY'],

      action: 'BLOCKED',

      deviceHash: 'blocked-device-001',
      ipHash: 'ip-hash-demo-002',
    });

    /*
     * Duplicate participation attempt
     */
    await FraudEvent.create({
      userId: users.duplicateTester.user._id,
      giveawayId: activeGiveaway._id,

      riskScore: 35,

      signals: ['DUPLICATE_PARTICIPATION_ATTEMPT'],

      action: 'LOGGED',

      deviceHash: 'device-duplicate-001',
      ipHash: 'ip-hash-demo-003',
    });

    /* =====================================================
       IDEMPOTENCY KEYS
    ===================================================== */

    await IdempotencyKey.create({
      userId: users.member.user._id,

      key: 'demo-join-active-001',

      requestHash: 'demo-request-hash-active-001',

      status: 'COMPLETED',

      response: {
        success: true,
        message: 'Participation already processed.',
      },
    });

    await IdempotencyKey.create({
      userId: users.duplicateTester.user._id,

      key: 'demo-duplicate-request-001',

      requestHash: 'demo-request-hash-duplicate-001',

      status: 'COMPLETED',

      response: {
        success: false,
        error: 'ALREADY_PARTICIPATING',
      },
    });

    await IdempotencyKey.create({
      userId: users.winner.user._id,

      key: 'demo-pending-request-001',

      requestHash: 'demo-request-hash-pending-001',

      status: 'PENDING',

      response: null,
    });

    /* =====================================================
       AUDIT LOGS
    ===================================================== */

    await AuditLog.create({
      actorId: users.admin.user._id,

      action: 'SEED_COMPLETED',

      resourceType: 'Seed',

      resourceId: activeGiveaway._id.toString(),

      metadata: {
        developmentOnly: true,
        activeGiveaway: activeGiveaway.slug,

        upcomingGiveaway: upcomingGiveaway.slug,

        endedGiveaway: endedGiveaway.slug,

        archivedGiveaway: archivedGiveaway.slug,
      },

      ipHash: 'demo-admin-ip',
    });

    await AuditLog.create({
      actorId: users.admin.user._id,

      action: 'WINNERS_CREATED',

      resourceType: 'Giveaway',

      resourceId: endedGiveaway._id.toString(),

      metadata: {
        winnerCount: 8,
        developmentOnly: true,
      },

      ipHash: 'demo-admin-ip',
    });

    await AuditLog.create({
      actorId: users.admin.user._id,

      action: 'CLAIMS_CREATED',

      resourceType: 'Giveaway',

      resourceId: endedGiveaway._id.toString(),

      metadata: {
        claimStatuses: [
          'COMPLETED',
          'PROCESSING',
          'SUBMITTED',
          'NOT_SUBMITTED',
          'EXPIRED',
        ],

        developmentOnly: true,
      },

      ipHash: 'demo-admin-ip',
    });

    /* =====================================================
       SUMMARY
    ===================================================== */

    console.log('\n==========================================');
    console.log('       VELOOP DATABASE SEED COMPLETE');
    console.log('==========================================\n');

    console.log('Giveaways:');
    console.log(`  ACTIVE       → ${activeGiveaway.slug}`);
    console.log(`  UPCOMING     → ${upcomingGiveaway.slug}`);
    console.log(`  WINNERS      → ${endedGiveaway.slug}`);
    console.log(`  ARCHIVED     → ${archivedGiveaway.slug}`);

    console.log('\nDemo Accounts:');

    for (const seedData of userSeeds) {
      console.log(`  ${seedData.email} → ${seedData.role || 'USER'}`);
    }

    console.log('\nPassword for all accounts:');
    console.log('  DemoPass123');

    console.log('\nTest scenarios seeded:');

    console.log('  ✓ Active giveaway');
    console.log('  ✓ Upcoming giveaway');
    console.log('  ✓ Winners-selected giveaway');
    console.log('  ✓ Archived giveaway');

    console.log('  ✓ VE participation');
    console.log('  ✓ SVE participation');
    console.log('  ✓ TOKEN participation');

    console.log('  ✓ Successful transaction');
    console.log('  ✓ Failed transaction');
    console.log('  ✓ Balance before/after');

    console.log('  ✓ Multiple winners');
    console.log('  ✓ Single winner');

    console.log('  ✓ Physical prize claim');
    console.log('  ✓ Gift card claim');

    console.log('  ✓ NOT_SUBMITTED claim');
    console.log('  ✓ SUBMITTED claim');
    console.log('  ✓ PROCESSING claim');
    console.log('  ✓ COMPLETED claim');
    console.log('  ✓ EXPIRED claim');

    console.log('  ✓ Fraud events');
    console.log('  ✓ Suspicious activity');
    console.log('  ✓ Duplicate participation attempt');

    console.log('  ✓ Completed idempotency request');
    console.log('  ✓ Pending idempotency request');

    console.log('  ✓ Audit logs');

    console.log('\n==========================================\n');
  } catch (error) {
    console.error('\nSeed failed:');
    console.error(error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();
