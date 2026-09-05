import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import { User } from '../models/User.js';
import { Wallet } from '../models/Wallet.js';
import { Giveaway } from '../models/Giveaway.js';
import { Prize } from '../models/Prize.js';
import { GiveawayPrize } from '../models/GiveawayPrize.js';
import { GiveawayWinner } from '../models/GiveawayWinner.js';
import { PrizeClaim } from '../models/PrizeClaim.js';

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (days) => new Date(Date.now() - days * DAY);
const daysFromNow = (days) => new Date(Date.now() + days * DAY);

async function createUser(userData) {
  const user = await User.create({
    publicId: userData.publicId,
    name: userData.name,
    email: userData.email,
    role: userData.role || 'USER',
    accountStatus: userData.accountStatus || 'ACTIVE',
    passwordHash: await User.hashPassword('DemoPass123'),
  });

  await Wallet.create({
    userId: user._id,
    balances: userData.balances || { VE: 1500, SVE: 1200, TOKEN: 6000 },
  });

  return user;
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

async function seedWinnersOnly() {
  try {
    await connectDatabase();
    console.log('Connected to database.');

    // Get or create the ended giveaway (Monsoon Rewards Giveaway)
    let endedGiveaway = await Giveaway.findOne({
      slug: 'monsoon-rewards-2026',
    });

    if (!endedGiveaway) {
      console.log('Monsoon Giveaway not found. Creating it...');

      // Create prizes if they don't exist
      let prizeMap = {};
      const prizeNames = [
        'iPhone 15 Pro',
        'Apple Watch Series 9',
        'AirPods Pro',
        '₹2,000 Amazon Gift Card',
      ];

      for (const name of prizeNames) {
        let prize = await Prize.findOne({ name });
        if (!prize) {
          prize = await Prize.create({
            name,
            description: `Demo prize: ${name}`,
            prizeType: name.includes('Amazon') ? 'GIFT_CARD' : 'PHYSICAL',
            claimType: name.includes('Amazon')
              ? 'EMAIL_ONLY'
              : 'PHYSICAL_ADDRESS',
            image: '🎁',
          });
        }
        prizeMap[name] = prize;
      }

      // Create the giveaway
      endedGiveaway = await Giveaway.create({
        title: 'Monsoon Rewards Giveaway',
        slug: 'monsoon-rewards-2026',
        description:
          'Completed development giveaway used for winner and claim history.',
        status: 'WINNERS_SELECTED',
        startAt: daysAgo(35),
        endAt: daysAgo(20),
        claimDeadlineAt: daysAgo(13),
        rules: [
          'One entry per verified VELOOP account.',
          'Entry fee is deducted only after successful participation.',
          'Winners are selected after the giveaway ends.',
        ],
        eligibility: ['User must have an active VELOOP Rewards account.'],
        participationSettings: { oneEntryPerUser: true, minAccountAgeDays: 0 },
      });

      // Attach prizes to giveaway
      await GiveawayPrize.create({
        giveawayId: endedGiveaway._id,
        prizeId: prizeMap['iPhone 15 Pro']._id,
        position: 1,
        winnerCount: 1,
        entryCurrency: 'VE',
        entryAmount: 250,
      });

      await GiveawayPrize.create({
        giveawayId: endedGiveaway._id,
        prizeId: prizeMap['Apple Watch Series 9']._id,
        position: 2,
        winnerCount: 3,
        entryCurrency: 'VE',
        entryAmount: 200,
      });

      await GiveawayPrize.create({
        giveawayId: endedGiveaway._id,
        prizeId: prizeMap['AirPods Pro']._id,
        position: 3,
        winnerCount: 2,
        entryCurrency: 'SVE',
        entryAmount: 500,
      });

      await GiveawayPrize.create({
        giveawayId: endedGiveaway._id,
        prizeId: prizeMap['₹2,000 Amazon Gift Card']._id,
        position: 4,
        winnerCount: 3,
        entryCurrency: 'VE',
        entryAmount: 500,
      });

      console.log('Created Monsoon Rewards Giveaway and its prizes.');
    }

    // Get all prizes for the giveaway
    const giveawayPrizes = await GiveawayPrize.find({
      giveawayId: endedGiveaway._id,
    }).populate('prizeId');

    if (giveawayPrizes.length === 0) {
      console.log('ERROR: No prizes found for Monsoon Giveaway.');
      process.exit(1);
    }

    console.log(`Found ${giveawayPrizes.length} prizes.`);

    // Get all demo users
    const users = {};
    const userEmails = {
      member: {
        email: 'member@velop.demo',
        name: 'Demo Member',
        publicId: 'VE10042',
      },
      winner: {
        email: 'winner@velop.demo',
        name: 'Demo Winner',
        publicId: 'VE10091',
      },
      nonWinner: {
        email: 'nonwinner@velop.demo',
        name: 'Demo Non Winner',
        publicId: 'VE10027',
      },
      physicalWinner: {
        email: 'physicalwinner@velop.demo',
        name: 'Physical Prize Winner',
        publicId: 'VE10061',
      },
      giftCardWinner: {
        email: 'giftwinner@velop.demo',
        name: 'Gift Card Winner',
        publicId: 'VE10072',
      },
      anotherUser: {
        email: 'another@velop.demo',
        name: 'Another Demo User',
        publicId: 'VE10083',
      },
      anotherWinner: {
        email: 'anotherwinner@velop.demo',
        name: 'Another Winner',
        publicId: 'VE10094',
      },
      suspicious: {
        email: 'suspicious@velop.demo',
        name: 'Suspicious Activity User',
        publicId: 'VE10105',
      },
    };

    console.log('Ensuring all demo users exist...');
    for (const [key, userData] of Object.entries(userEmails)) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        console.log(`  Creating user: ${userData.name}`);
        user = await createUser(userData);
      }
      users[key] = user;
    }

    console.log(`Found/created ${Object.keys(users).length} demo users.`);

    // Clear existing winners and claims for this giveaway
    await GiveawayWinner.deleteMany({ giveawayId: endedGiveaway._id });
    await PrizeClaim.deleteMany({ giveawayId: endedGiveaway._id });
    console.log('Cleared existing winners and claims for Monsoon Giveaway.');

    // Create winners for Monsoon Rewards Giveaway
    console.log('Creating winners for Monsoon Rewards Giveaway...');

    const prizeAtPosition = (position) =>
      giveawayPrizes.find((p) => p.position === position);

    // iPhone winner
    const iphoneWinner = await createWinner({
      giveaway: endedGiveaway,
      prize: prizeAtPosition(1).prizeId,
      user: users.member,
      status: 'CLAIMED',
      selectedAt: daysAgo(19),
    });

    // Apple Watch winners
    const watchWinner1 = await createWinner({
      giveaway: endedGiveaway,
      prize: prizeAtPosition(2).prizeId,
      user: users.winner,
      status: 'NOTIFIED',
      selectedAt: daysAgo(19),
    });

    const watchWinner2 = await createWinner({
      giveaway: endedGiveaway,
      prize: prizeAtPosition(2).prizeId,
      user: users.nonWinner,
      status: 'CLAIMED',
      selectedAt: daysAgo(19),
    });

    const watchWinner3 = await createWinner({
      giveaway: endedGiveaway,
      prize: prizeAtPosition(2).prizeId,
      user: users.physicalWinner,
      status: 'NOTIFIED',
      selectedAt: daysAgo(19),
    });

    // AirPods winners
    const airpodsWinner1 = await createWinner({
      giveaway: endedGiveaway,
      prize: prizeAtPosition(3).prizeId,
      user: users.giftCardWinner,
      status: 'NOTIFIED',
      selectedAt: daysAgo(19),
    });

    const airpodsWinner2 = await createWinner({
      giveaway: endedGiveaway,
      prize: prizeAtPosition(3).prizeId,
      user: users.anotherUser,
      status: 'SELECTED',
      selectedAt: daysAgo(19),
    });

    // Amazon winners
    const amazonWinner1 = await createWinner({
      giveaway: endedGiveaway,
      prize: prizeAtPosition(4).prizeId,
      user: users.anotherWinner,
      status: 'CLAIMED',
      selectedAt: daysAgo(19),
    });

    const amazonWinner2 = await createWinner({
      giveaway: endedGiveaway,
      prize: prizeAtPosition(4).prizeId,
      user: users.suspicious,
      status: 'EXPIRED',
      selectedAt: daysAgo(19),
    });

    console.log('Created 8 winners for Monsoon Giveaway.');

    // Create claims
    console.log('Creating claims...');

    // iPhone - COMPLETED
    await createClaim({
      winner: iphoneWinner,
      giveaway: endedGiveaway,
      prize: prizeAtPosition(1).prizeId,
      user: users.member,
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

    // Apple Watch - PROCESSING
    await createClaim({
      winner: watchWinner1,
      giveaway: endedGiveaway,
      prize: prizeAtPosition(2).prizeId,
      user: users.winner,
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

    // Apple Watch - SUBMITTED
    await createClaim({
      winner: watchWinner2,
      giveaway: endedGiveaway,
      prize: prizeAtPosition(2).prizeId,
      user: users.nonWinner,
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

    // Apple Watch - NOT_SUBMITTED
    await createClaim({
      winner: watchWinner3,
      giveaway: endedGiveaway,
      prize: prizeAtPosition(2).prizeId,
      user: users.physicalWinner,
      status: 'NOT_SUBMITTED',
      fulfillment: {},
      submittedAt: null,
    });

    // AirPods - SUBMITTED
    await createClaim({
      winner: airpodsWinner1,
      giveaway: endedGiveaway,
      prize: prizeAtPosition(3).prizeId,
      user: users.giftCardWinner,
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

    // Amazon Gift Card - COMPLETED
    await createClaim({
      winner: amazonWinner1,
      giveaway: endedGiveaway,
      prize: prizeAtPosition(4).prizeId,
      user: users.anotherWinner,
      status: 'COMPLETED',
      fulfillment: {
        email: 'anotherwinner@velop.demo',
      },
      submittedAt: daysAgo(16),
    });

    // Amazon Gift Card - EXPIRED
    await createClaim({
      winner: amazonWinner2,
      giveaway: endedGiveaway,
      prize: prizeAtPosition(4).prizeId,
      user: users.suspicious,
      status: 'EXPIRED',
      fulfillment: {},
      submittedAt: null,
    });

    console.log('Created 7 claims.');
    console.log('✅ Winners data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding winners:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedWinnersOnly();
