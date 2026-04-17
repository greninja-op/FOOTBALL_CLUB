require('dotenv').config();
const { connectDB } = require('../config/database');
const Profile = require('../models/Profile');
const SeasonStats = require('../models/SeasonStats');
const {
  ensurePlayerFromLegacyProfile,
  ensureSeasonStatsForProfileMapping,
  getCurrentSeasonLabel
} = require('../services/playerDomainService');

async function migratePlayerDomain() {
  console.log('\nStarting legacy profile migration to player domain...\n');

  await connectDB();

  const profiles = await Profile.find().populate('userId', 'email role');
  const season = getCurrentSeasonLabel();
  let migratedPlayers = 0;
  let createdSeasonStats = 0;

  for (const profile of profiles) {
    const { player, membership } = await ensurePlayerFromLegacyProfile(profile);
    migratedPlayers += 1;

    const beforeCount = await SeasonStats.countDocuments({
      membershipId: membership._id,
      season
    });

    await ensureSeasonStatsForProfileMapping(profile, membership, { season });

    const afterCount = await SeasonStats.countDocuments({
      membershipId: membership._id,
      season
    });

    if (afterCount > beforeCount) {
      createdSeasonStats += 1;
    }

    console.log(`Migrated: ${profile.fullName} -> Player ${player._id} / Membership ${membership._id}`);
    if (afterCount === beforeCount) {
      console.log('  Existing season stats already present for current season');
    }
  }

  console.log('\nMigration complete.');
  console.log(`Profiles processed: ${profiles.length}`);
  console.log(`Player mappings ensured: ${migratedPlayers}`);
  console.log(`Season stats created: ${createdSeasonStats}\n`);

  process.exit(0);
}

migratePlayerDomain().catch((error) => {
  console.error('\nMigration failed:', error.message);
  console.error(error);
  process.exit(1);
});
