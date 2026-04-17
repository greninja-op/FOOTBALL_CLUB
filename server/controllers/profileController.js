const Profile = require('../models/Profile');
const Player = require('../models/Player');
const ClubMembership = require('../models/ClubMembership');
const SystemLog = require('../models/SystemLog');
const { sanitizeText } = require('../utils/sanitize');

const buildPlayerDomainLookups = async (profiles) => {
  const profileIds = profiles.map((profile) => profile._id);

  const [players, memberships] = await Promise.all([
    Player.find({ legacyProfileId: { $in: profileIds } }),
    ClubMembership.find({ legacyProfileId: { $in: profileIds } }).sort({ joinedAt: -1 })
  ]);

  const playerByProfileId = new Map(
    players.map((player) => [String(player.legacyProfileId), player])
  );

  const membershipsByProfileId = memberships.reduce((acc, membership) => {
    const key = String(membership.legacyProfileId);
    if (!acc.has(key)) {
      acc.set(key, []);
    }
    acc.get(key).push(membership);
    return acc;
  }, new Map());

  return { playerByProfileId, membershipsByProfileId };
};

const serializeProfile = (profile, role, lookups) => {
  const profileData = profile.toObject();
  const player = lookups.playerByProfileId.get(String(profile._id)) || null;
  const memberships = lookups.membershipsByProfileId.get(String(profile._id)) || [];
  const activeMembership = memberships.find((membership) => membership.isActive) || null;

  if (role === 'manager' || role === 'player') {
    profileData.performanceNotes = [];
  }

  const contractType = activeMembership?.contractType || profileData.contractType || null;
  const contractStart = activeMembership?.contractStart || profileData.contractStart || null;
  const contractEnd = activeMembership?.contractEnd || profileData.contractEnd || null;
  const availabilityStatus = profileData.availabilityOverrideStatus === 'available'
    ? 'available'
    : profileData.availabilityOverrideStatus === 'unavailable'
      ? 'manual-unavailable'
      : activeMembership?.availabilityStatus || (profileData.fitnessStatus === 'Red' ? 'injured' : 'available');

  return {
    ...profileData,
    contractType,
    contractStart,
    contractEnd,
    contract: {
      contractType,
      contractStart,
      contractEnd,
      source: activeMembership ? 'membership' : 'legacy-profile'
    },
    playerDomain: {
      playerId: player?._id || null,
      status: player?.status || profileData.playerStatus || 'active',
      membershipCount: memberships.length,
      activeMembership: activeMembership ? {
        id: activeMembership._id,
        userId: activeMembership.userId || null,
        jerseyNumber: activeMembership.jerseyNumber,
        primaryPosition: activeMembership.primaryPosition,
        secondaryPositions: activeMembership.secondaryPositions || [],
        contractType: activeMembership.contractType,
        contractStart: activeMembership.contractStart,
        contractEnd: activeMembership.contractEnd,
        squadRole: activeMembership.squadRole,
        joinedAt: activeMembership.joinedAt,
        availabilityStatus: activeMembership.availabilityStatus,
        availabilityDetails: activeMembership.availabilityDetails || null
      } : null
    },
    availabilityStatus,
    displayPosition: activeMembership?.primaryPosition || profileData.preferredPosition || profileData.position
  };
};

/**
 * Profile Controller
 * Handles profile management operations including fitness status, statistics, and profile updates
 * 
 * Validates Requirements: 7.1, 7.2, 13.2, 13.3, 16.5
 */

/**
 * Get all profiles
 * GET /api/profiles
 *
 * @access Admin, Manager, Coach
 */
const getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find()
      .populate('userId', 'email role')
      .sort({ fullName: 1 });

    const lookups = await buildPlayerDomainLookups(profiles);
    const serializedProfiles = profiles.map((profile) => serializeProfile(profile, req.user.role, lookups));

    res.status(200).json({
      success: true,
      count: serializedProfiles.length,
      profiles: serializedProfiles
    });
  } catch (error) {
    console.error('Get all profiles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profiles',
      error: error.message
    });
  }
};

/**
 * Get profile by user ID
 * GET /api/profiles/:userId
 * 
 * @access Admin (all), Manager (all), Coach (all), Player (own only)
 */
const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find profile by userId
    const profile = await Profile.findOne({ userId })
      .populate('userId', 'email role')
      .populate('performanceNotes.createdBy', 'email role');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    const lookups = await buildPlayerDomainLookups([profile]);
    const profileData = serializeProfile(profile, req.user.role, lookups);

    res.status(200).json({
      success: true,
      profile: profileData
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

/**
 * Update profile fields
 * PUT /api/profiles/:userId
 * 
 * @access Admin, Manager
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const { fullName, photo, position, weight, height, contractType, contractStart, contractEnd } = req.body;

    // Find profile
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Track changes for logging
    const changes = {};

    // Update fields if provided
    if (fullName !== undefined) {
      changes.fullName = { from: profile.fullName, to: fullName };
      profile.fullName = fullName;
    }

    if (photo !== undefined) {
      changes.photo = { from: profile.photo, to: photo };
      profile.photo = photo;
    }

    if (position !== undefined) {
      changes.position = { from: profile.position, to: position };
      profile.position = position;
    }

    if (weight !== undefined) {
      // Validate weight range (Requirement 20.4)
      if (weight < 40 || weight > 150) {
        return res.status(400).json({
          success: false,
          message: 'Weight must be between 40 and 150 kg'
        });
      }
      changes.weight = { from: profile.weight, to: weight };
      profile.weight = weight;
    }

    if (height !== undefined) {
      // Validate height range (Requirement 20.4)
      if (height < 150 || height > 220) {
        return res.status(400).json({
          success: false,
          message: 'Height must be between 150 and 220 cm'
        });
      }
      changes.height = { from: profile.height, to: height };
      profile.height = height;
    }

    if (contractType !== undefined) {
      changes.contractType = { from: profile.contractType, to: contractType };
      profile.contractType = contractType;
    }

    if (contractStart !== undefined) {
      changes.contractStart = { from: profile.contractStart, to: contractStart };
      profile.contractStart = contractStart;
    }

    if (contractEnd !== undefined) {
      changes.contractEnd = { from: profile.contractEnd, to: contractEnd };
      profile.contractEnd = contractEnd;
    }

    await profile.save();

    // Log the operation
    await SystemLog.create({
      action: 'UPDATE',
      performedBy: req.user.id,
      targetCollection: 'Profile',
      targetId: profile._id,
      changes
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: profile.toObject()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

/**
 * Add a performance note
 * POST /api/profiles/:userId/notes
 *
 * @access Coach, Admin
 */
const addPerformanceNote = async (req, res) => {
  try {
    const { userId } = req.params;
    const { note } = req.body;

    if (!note || !String(note).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Performance note is required'
      });
    }

    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    const sanitizedNote = sanitizeText(String(note).trim());

    profile.performanceNotes.push({
      note: sanitizedNote,
      createdBy: req.user.id
    });

    await profile.save();
    await profile.populate('performanceNotes.createdBy', 'email role');

    await SystemLog.create({
      action: 'UPDATE',
      performedBy: req.user.id,
      targetCollection: 'Profile',
      targetId: profile._id,
      changes: {
        performanceNotes: {
          action: 'added',
          note: sanitizedNote
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Performance note added successfully',
      performanceNotes: profile.performanceNotes
    });
  } catch (error) {
    console.error('Add performance note error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to add performance note',
      error: error.message
    });
  }
};

/**
 * Update fitness status
 * PUT /api/profiles/:userId/fitness
 * 
 * @access Coach, Admin
 */
const updateFitnessStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, notes } = req.body;

    // Validate status
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Fitness status is required'
      });
    }

    const validStatuses = ['Green', 'Yellow', 'Red'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid fitness status. Must be one of: Green, Yellow, Red'
      });
    }

    // Find profile
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Track changes for logging
    const changes = {
      fitnessStatus: { from: profile.fitnessStatus, to: status }
    };

    if (notes) {
      changes.notes = notes;
    }

    // Update fitness status
    profile.fitnessStatus = status;

    // Add performance note if notes provided (sanitize to prevent XSS - Requirement 21.5)
    if (notes) {
      const sanitizedNotes = sanitizeText(notes);
      profile.performanceNotes.push({
        note: `Fitness status updated to ${status}: ${sanitizedNotes}`,
        createdBy: req.user.id
      });
    }

    await profile.save();

    // Log the operation
    await SystemLog.create({
      action: 'UPDATE',
      performedBy: req.user.id,
      targetCollection: 'Profile',
      targetId: profile._id,
      changes
    });

    res.status(200).json({
      success: true,
      message: 'Fitness status updated successfully',
      profile: {
        id: profile._id,
        userId: profile.userId,
        fullName: profile.fullName,
        fitnessStatus: profile.fitnessStatus
      }
    });
  } catch (error) {
    console.error('Update fitness status error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update fitness status',
      error: error.message
    });
  }
};

/**
 * Update player statistics
 * PUT /api/profiles/:userId/stats
 * 
 * @access Coach, Admin
 */
const updateStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const { goals, assists, appearances, minutes, yellowCards, redCards, rating } = req.body;

    // Find profile
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Track changes for logging
    const changes = {
      stats: {
        from: { ...profile.stats },
        to: {}
      }
    };

    // Update stats if provided
    if (goals !== undefined) {
      profile.stats.goals = goals;
      changes.stats.to.goals = goals;
    }

    if (assists !== undefined) {
      profile.stats.assists = assists;
      changes.stats.to.assists = assists;
    }

    if (appearances !== undefined) {
      profile.stats.appearances = appearances;
      changes.stats.to.appearances = appearances;
    }

    if (minutes !== undefined) {
      profile.stats.minutes = minutes;
      changes.stats.to.minutes = minutes;
    }

    if (yellowCards !== undefined) {
      profile.stats.yellowCards = yellowCards;
      changes.stats.to.yellowCards = yellowCards;
    }

    if (redCards !== undefined) {
      profile.stats.redCards = redCards;
      changes.stats.to.redCards = redCards;
    }

    if (rating !== undefined) {
      // Validate rating is between 0 and 10
      if (rating < 0 || rating > 10) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 0 and 10'
        });
      }
      profile.stats.rating = rating;
      changes.stats.to.rating = rating;
    }

    await profile.save();

    // Log the operation
    await SystemLog.create({
      action: 'UPDATE',
      performedBy: req.user.id,
      targetCollection: 'Profile',
      targetId: profile._id,
      changes
    });

    // Emit Socket.io event for real-time updates
    const { getIO } = require('../utils/socketIO');
    const io = getIO();
    io.emit('stats:updated', {
      playerId: userId,
      stats: profile.stats,
      fullName: profile.fullName
    });

    res.status(200).json({
      success: true,
      message: 'Statistics updated successfully',
      profile: {
        id: profile._id,
        userId: profile.userId,
        fullName: profile.fullName,
        stats: profile.stats
      }
    });
  } catch (error) {
    console.error('Update stats error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllProfiles,
  getProfile,
  updateProfile,
  addPerformanceNote,
  updateFitnessStatus,
  updateStats
};
