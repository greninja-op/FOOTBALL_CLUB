const Profile = require('../models/Profile');
const User = require('../models/User');
const Player = require('../models/Player');
const ClubMembership = require('../models/ClubMembership');
const SeasonStats = require('../models/SeasonStats');

const LEGACY_POSITION_MAP = {
  Goalkeeper: 'GK',
  Defender: 'CB',
  Midfielder: 'CM',
  Forward: 'ST',
  Staff: 'STAFF'
};

function getCurrentSeasonLabel(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const startYear = month >= 6 ? year : year - 1;
  const endYearShort = String((startYear + 1) % 100).padStart(2, '0');
  return `${startYear}/${endYearShort}`;
}

function normalizePreferredPosition(profile) {
  if (profile.preferredPosition) {
    return profile.preferredPosition;
  }

  return LEGACY_POSITION_MAP[profile.position] || 'STAFF';
}

function deriveContractType(profile) {
  if (profile.contractType === 'Loan') {
    return 'On Loan';
  }

  if (profile.position === 'Staff') {
    return 'Staff';
  }

  if (profile.contractType === 'Trial') {
    return 'Trial';
  }

  return 'Owned';
}

function deriveSquadRole(profile) {
  if (profile.position === 'Staff') {
    return 'staff';
  }

  return 'rotation';
}

async function ensurePlayerFromLegacyProfile(profileInput) {
  const profile = profileInput.userId
    ? profileInput
    : await Profile.findById(profileInput).populate('userId', 'email role');

  if (!profile) {
    throw new Error('Legacy profile not found');
  }

  const populatedProfile = profile.userId && profile.userId.email
    ? profile
    : await Profile.findById(profile._id).populate('userId', 'email role');

  const userDoc = populatedProfile.userId && populatedProfile.userId._id
    ? populatedProfile.userId
    : (populatedProfile.userId ? await User.findById(populatedProfile.userId) : null);

  let player = await Player.findOne({ legacyProfileId: populatedProfile._id });

  if (!player) {
    player = await Player.create({
      fullName: populatedProfile.fullName,
      photo: populatedProfile.photo,
      contactEmail: userDoc ? userDoc.email : null,
      currentUserId: userDoc ? userDoc._id : null,
      legacyProfileId: populatedProfile._id,
      status: populatedProfile.playerStatus === 'active' ? 'active' : 'archived'
    });
  }

  let membership = await ClubMembership.findOne({
    legacyProfileId: populatedProfile._id,
    isActive: true
  });

  if (!membership) {
    membership = await ClubMembership.create({
      playerId: player._id,
      userId: userDoc ? userDoc._id : null,
      legacyProfileId: populatedProfile._id,
      primaryPosition: normalizePreferredPosition(populatedProfile),
      secondaryPositions: populatedProfile.secondaryPositions || [],
      contractType: deriveContractType(populatedProfile),
      squadRole: deriveSquadRole(populatedProfile),
      contractStart: populatedProfile.contractStart || null,
      contractEnd: populatedProfile.contractEnd || null,
      availabilityStatus: 'available'
    });
  }

  return {
    profile: populatedProfile,
    user: userDoc,
    player,
    membership
  };
}

async function ensureSeasonStatsForProfileMapping(profile, membership, options = {}) {
  const season = options.season || getCurrentSeasonLabel();

  let stats = await SeasonStats.findOne({
    membershipId: membership._id,
    season
  });

  if (!stats) {
    stats = await SeasonStats.create({
      playerId: membership.playerId,
      membershipId: membership._id,
      season,
      goals: profile.stats?.goals || 0,
      assists: profile.stats?.assists || 0,
      appearances: profile.stats?.appearances || 0,
      matchRatings: []
    });
  }

  return stats;
}

async function summarizePlayerCareer(playerId, fallbackProfile = null) {
  const seasonStats = await SeasonStats.find({ playerId });

  if (seasonStats.length === 0 && fallbackProfile) {
    return {
      totalGoals: fallbackProfile.stats?.goals || 0,
      totalAssists: fallbackProfile.stats?.assists || 0,
      totalAppearances: fallbackProfile.stats?.appearances || 0,
      totalMinutes: 0,
      seasonsPlayed: fallbackProfile.stats ? 1 : 0,
      trophiesWon: []
    };
  }

  return seasonStats.reduce((summary, season) => {
    summary.totalGoals += season.goals || 0;
    summary.totalAssists += season.assists || 0;
    summary.totalAppearances += season.appearances || 0;
    summary.totalMinutes += season.minutesPlayed || 0;
    summary.seasonsPlayed += 1;
    return summary;
  }, {
    totalGoals: 0,
    totalAssists: 0,
    totalAppearances: 0,
    totalMinutes: 0,
    seasonsPlayed: 0,
    trophiesWon: []
  });
}

module.exports = {
  getCurrentSeasonLabel,
  normalizePreferredPosition,
  ensurePlayerFromLegacyProfile,
  ensureSeasonStatsForProfileMapping,
  summarizePlayerCareer
};
