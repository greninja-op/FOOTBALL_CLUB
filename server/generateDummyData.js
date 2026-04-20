require('dotenv').config();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

const { connectDB } = require('./config/database');
const User = require('./models/User');
const Profile = require('./models/Profile');
const Player = require('./models/Player');
const ClubMembership = require('./models/ClubMembership');
const Fixture = require('./models/Fixture');
const Transaction = require('./models/Transaction');
const DisciplinaryAction = require('./models/DisciplinaryAction');

const DUMMY_DOMAIN = 'portfolio.local';
const DUMMY_PREFIX = '[Portfolio Seed]';
const PLAYER_COUNT = 25;
const COACH_COUNT = 3;

const positionTemplates = [
  { profilePosition: 'Goalkeeper', preferredPosition: 'GK' },
  { profilePosition: 'Defender', preferredPosition: 'CB' },
  { profilePosition: 'Defender', preferredPosition: 'LB' },
  { profilePosition: 'Defender', preferredPosition: 'RB' },
  { profilePosition: 'Midfielder', preferredPosition: 'DM' },
  { profilePosition: 'Midfielder', preferredPosition: 'CM' },
  { profilePosition: 'Midfielder', preferredPosition: 'AM' },
  { profilePosition: 'Forward', preferredPosition: 'LW' },
  { profilePosition: 'Forward', preferredPosition: 'RW' },
  { profilePosition: 'Forward', preferredPosition: 'ST' }
];

const fixtureOpponents = [
  'Redbridge Athletic',
  'Kingsford Rovers',
  'Northgate United',
  'Westfield Town',
  'Eastborough FC',
  'Harbor City',
  'Riverton Albion',
  'Southport Rangers',
  'Ironvale FC',
  'Oakridge County',
  'Bluehaven FC',
  'Stonebridge United',
  'Lakeside Athletic',
  'Crownford SC',
  'Valley Park FC'
];

const offensePool = [
  'Late to training',
  'Missed team meeting',
  'Dress code violation',
  'Unapproved media appearance',
  'Missed recovery session'
];

const incomeCategories = ['Matchday', 'Sponsorship', 'Merchandising', 'Prize Money'];
const expenseCategories = ['Travel', 'Maintenance', 'Operations'];

const randomFrom = (items) => items[Math.floor(Math.random() * items.length)];

const randomDateBetween = (start, end) => {
  const startMs = start.getTime();
  const endMs = end.getTime();
  const randomMs = faker.number.int({ min: startMs, max: endMs });
  return new Date(randomMs);
};

const normalizeToken = (value) => String(value || '')
  .toLowerCase()
  .replace(/[^a-z0-9]/g, '');

const buildDummyEmail = (firstName, lastName, role, index) => {
  const first = normalizeToken(firstName);
  const last = normalizeToken(lastName);
  return `${first}.${last}.${role}.${index}@${DUMMY_DOMAIN}`;
};

const uniqueJerseyNumbers = () => {
  const all = Array.from({ length: 99 }, (_, index) => index + 1);
  return faker.helpers.shuffle(all).slice(0, PLAYER_COUNT);
};

async function clearExistingDummyData() {
  const dummyUsers = await User.find({
    email: { $regex: new RegExp(`@${DUMMY_DOMAIN}$`, 'i') }
  }).select('_id');

  const dummyUserIds = dummyUsers.map((user) => user._id);
  const dummyProfiles = await Profile.find({ userId: { $in: dummyUserIds } }).select('_id');
  const dummyProfileIds = dummyProfiles.map((profile) => profile._id);

  const dummyPlayers = await Player.find({
    $or: [
      { currentUserId: { $in: dummyUserIds } },
      { legacyProfileId: { $in: dummyProfileIds } }
    ]
  }).select('_id');
  const dummyPlayerIds = dummyPlayers.map((player) => player._id);

  await ClubMembership.deleteMany({
    $or: [
      { playerId: { $in: dummyPlayerIds } },
      { userId: { $in: dummyUserIds } },
      { legacyProfileId: { $in: dummyProfileIds } }
    ]
  });

  await DisciplinaryAction.deleteMany({ playerId: { $in: dummyProfileIds } });
  await Player.deleteMany({ _id: { $in: dummyPlayerIds } });
  await Profile.deleteMany({ _id: { $in: dummyProfileIds } });
  await User.deleteMany({ _id: { $in: dummyUserIds } });

  await Fixture.deleteMany({ location: { $regex: /^Portfolio Seed - / } });
  await Transaction.deleteMany({ description: { $regex: /^\[Portfolio Seed\]/ } });

  console.log(`Cleared ${dummyUserIds.length} old dummy users and related records.`);
}

async function createStaff(passwordHash) {
  const createdStaff = [];

  const managerFirst = faker.person.firstName();
  const managerLast = faker.person.lastName();
  const managerEmail = buildDummyEmail(managerFirst, managerLast, 'manager', 1);

  const managerUser = await User.create({
    email: managerEmail,
    passwordHash,
    role: 'manager'
  });

  const managerProfile = await Profile.create({
    userId: managerUser._id,
    fullName: `${managerFirst} ${managerLast}`,
    position: 'Staff',
    preferredPosition: 'STAFF',
    contractType: 'Full-Time',
    weeklySalary: faker.number.int({ min: 60000, max: 220000 }),
    marketabilityScore: faker.number.int({ min: 25, max: 85 })
  });

  createdStaff.push({ user: managerUser, profile: managerProfile });

  for (let index = 0; index < COACH_COUNT; index += 1) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const coachEmail = buildDummyEmail(firstName, lastName, 'coach', index + 1);

    const coachUser = await User.create({
      email: coachEmail,
      passwordHash,
      role: 'coach'
    });

    const coachProfile = await Profile.create({
      userId: coachUser._id,
      fullName: `${firstName} ${lastName}`,
      position: 'Staff',
      preferredPosition: 'STAFF',
      contractType: 'Full-Time',
      weeklySalary: faker.number.int({ min: 25000, max: 90000 }),
      marketabilityScore: faker.number.int({ min: 20, max: 70 })
    });

    createdStaff.push({ user: coachUser, profile: coachProfile });
  }

  return {
    manager: createdStaff[0],
    coaches: createdStaff.slice(1)
  };
}

async function createPlayers(passwordHash) {
  const players = [];
  const jerseyNumbers = uniqueJerseyNumbers();

  for (let index = 0; index < PLAYER_COUNT; index += 1) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const fullName = `${firstName} ${lastName}`;
    const email = buildDummyEmail(firstName, lastName, 'player', index + 1);

    const positionTemplate = randomFrom(positionTemplates);
    const contractLengthYears = faker.number.int({ min: 1, max: 6 });
    const contractStart = faker.date.between({
      from: new Date(new Date().setFullYear(new Date().getFullYear() - 2)),
      to: new Date()
    });
    const contractEnd = new Date(contractStart);
    contractEnd.setFullYear(contractEnd.getFullYear() + contractLengthYears);

    const playerUser = await User.create({
      email,
      passwordHash,
      role: 'player'
    });

    const profile = await Profile.create({
      userId: playerUser._id,
      fullName,
      position: positionTemplate.profilePosition,
      preferredPosition: positionTemplate.preferredPosition,
      jerseyNumber: jerseyNumbers[index],
      weight: faker.number.int({ min: 65, max: 94 }),
      height: faker.number.int({ min: 168, max: 200 }),
      fitnessStatus: randomFrom(['Green', 'Green', 'Yellow']),
      contractType: 'Full-Time',
      contractStart,
      contractEnd,
      weeklySalary: faker.number.int({ min: 5000, max: 200000 }),
      transferFee: faker.number.int({ min: 250000, max: 120000000 }),
      contractLengthYears,
      marketabilityScore: faker.number.int({ min: 20, max: 100 }),
      playerStatus: 'active',
      stats: {
        goals: faker.number.int({ min: 0, max: 18 }),
        assists: faker.number.int({ min: 0, max: 15 }),
        appearances: faker.number.int({ min: 1, max: 38 }),
        minutes: faker.number.int({ min: 120, max: 3420 }),
        yellowCards: faker.number.int({ min: 0, max: 10 }),
        redCards: faker.number.int({ min: 0, max: 2 }),
        rating: faker.number.float({ min: 6.2, max: 8.9, multipleOf: 0.1 })
      }
    });

    const player = await Player.create({
      fullName,
      status: 'active',
      currentUserId: playerUser._id,
      legacyProfileId: profile._id
    });

    await ClubMembership.create({
      playerId: player._id,
      userId: playerUser._id,
      legacyProfileId: profile._id,
      jerseyNumber: jerseyNumbers[index],
      primaryPosition: positionTemplate.preferredPosition,
      secondaryPositions: ['UTILITY'],
      contractType: 'Owned',
      squadRole: randomFrom(['starter', 'rotation', 'prospect']),
      contractStart,
      contractEnd,
      joinedAt: contractStart,
      isActive: true,
      availabilityStatus: 'available'
    });

    players.push({
      user: playerUser,
      profile,
      player
    });
  }

  return players;
}

async function createFixtures(managerUserId) {
  const fixtures = [];

  for (let index = 0; index < 10; index += 1) {
    const pastDate = faker.date.between({
      from: new Date(new Date().setMonth(new Date().getMonth() - 6)),
      to: new Date(new Date().setDate(new Date().getDate() - 3))
    });

    fixtures.push({
      opponent: randomFrom(fixtureOpponents),
      date: pastDate,
      location: `Portfolio Seed - ${randomFrom(['Home', 'Away'])}`,
      matchType: randomFrom(['League', 'League', 'Cup', 'Friendly']),
      status: 'completed',
      opponentRank: faker.number.int({ min: 1, max: 20 }),
      homeScore: faker.number.int({ min: 0, max: 5 }),
      awayScore: faker.number.int({ min: 0, max: 4 }),
      matchdaySimulated: false,
      createdBy: managerUserId
    });
  }

  for (let index = 0; index < 5; index += 1) {
    const futureDate = faker.date.between({
      from: new Date(new Date().setDate(new Date().getDate() + 7)),
      to: new Date(new Date().setMonth(new Date().getMonth() + 4))
    });

    fixtures.push({
      opponent: randomFrom(fixtureOpponents),
      date: futureDate,
      location: `Portfolio Seed - ${randomFrom(['Home', 'Away'])}`,
      matchType: randomFrom(['League', 'Cup', 'Friendly', 'Tournament']),
      status: 'scheduled',
      opponentRank: faker.number.int({ min: 1, max: 20 }),
      homeScore: null,
      awayScore: null,
      matchdaySimulated: false,
      createdBy: managerUserId
    });
  }

  await Fixture.insertMany(fixtures);
}

async function createTransactions() {
  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 6);

  const transactions = [];

  for (let index = 0; index < 30; index += 1) {
    const type = Math.random() > 0.42 ? 'Income' : 'Expense';
    const category = type === 'Income' ? randomFrom(incomeCategories) : randomFrom(expenseCategories);

    const amount = type === 'Income'
      ? faker.number.int({ min: 20000, max: 750000 })
      : faker.number.int({ min: 5000, max: 320000 });

    const date = randomDateBetween(sixMonthsAgo, now);

    transactions.push({
      type,
      category,
      amount,
      date,
      description: `${DUMMY_PREFIX} ${category} ${type.toLowerCase()} for ${date.toLocaleString('en-US', { month: 'short', year: 'numeric' })}`
    });
  }

  await Transaction.insertMany(transactions);
}

async function createDisciplinaryActions(issuerUserId, players) {
  const playerProfiles = players.map((entry) => entry.profile);

  const pendingActions = Array.from({ length: 3 }).map(() => ({
    playerId: randomFrom(playerProfiles)._id,
    offense: randomFrom(offensePool),
    fineAmount: faker.number.int({ min: 500, max: 7000 }),
    dateIssued: faker.date.recent({ days: 40 }),
    isPaid: false,
    issuedBy: issuerUserId
  }));

  const paidActions = Array.from({ length: 2 }).map(() => {
    const issuedDate = faker.date.recent({ days: 80 });
    const paymentDate = faker.date.between({ from: issuedDate, to: new Date() });

    return {
      playerId: randomFrom(playerProfiles)._id,
      offense: randomFrom(offensePool),
      fineAmount: faker.number.int({ min: 500, max: 7000 }),
      dateIssued: issuedDate,
      isPaid: true,
      paymentDate,
      issuedBy: issuerUserId
    };
  });

  await DisciplinaryAction.insertMany([...pendingActions, ...paidActions]);
}

async function main() {
  try {
    console.log('Starting portfolio dummy data generation...');

    await connectDB();

    await clearExistingDummyData();

    const passwordHash = await bcrypt.hash('password123', 10);

    const { manager, coaches } = await createStaff(passwordHash);
    const players = await createPlayers(passwordHash);

    await createFixtures(manager.user._id);
    await createTransactions();
    await createDisciplinaryActions(coaches[0].user._id, players);

    console.log('----------------------------------------------');
    console.log('Dummy data generated successfully.');
    console.log(`Manager created: 1`);
    console.log(`Coaches created: ${coaches.length}`);
    console.log(`Players created: ${players.length}`);
    console.log('Fixtures created: 15 (10 past, 5 upcoming)');
    console.log('Transactions created: 30 (last 6 months)');
    console.log('Disciplinary actions created: 5 (3 pending, 2 paid)');
    console.log('----------------------------------------------');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Dummy data generation failed:', error.message);
    console.error(error);

    try {
      await mongoose.connection.close();
    } catch (closeError) {
      console.error('Failed to close MongoDB connection cleanly:', closeError.message);
    }

    process.exit(1);
  }
}

main();
