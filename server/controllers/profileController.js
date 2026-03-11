const Profile = require('../models/Profile');
const SystemLog = require('../models/SystemLog');
const { sanitizeText } = require('../utils/sanitize');

/**
 * Profile Controller
 * Handles profile management operations including fitness status, statistics, and profile updates
 * 
 * Validates Requirements: 7.1, 7.2, 13.2, 13.3, 16.5
 */

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

    // Filter performance notes based on role
    // Only Coach and Admin can see performance notes
    let profileData = profile.toObject();
    if (req.user.role === 'player' || req.user.role === 'manager') {
      profileData.performanceNotes = [];
    }

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
    const { userId } = req.params;
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
    const { goals, assists, appearances, rating } = req.body;

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
  getProfile,
  updateProfile,
  updateFitnessStatus,
  updateStats
};
