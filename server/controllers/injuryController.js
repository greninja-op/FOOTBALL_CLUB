const Injury = require('../models/Injury');
const Profile = require('../models/Profile');
const SystemLog = require('../models/SystemLog');
const { sanitizeText } = require('../utils/sanitize');

/**
 * Injury Controller
 * Handles injury tracking with fitness status updates and Socket.io events
 * 
 * Validates Requirements: 14.1, 14.2, 14.3, 14.4
 */

/**
 * Log a new injury
 * POST /api/injuries
 * 
 * @access Coach, Admin
 */
const logInjury = async (req, res) => {
  try {
    const { playerId, injuryType, severity, expectedRecovery, notes } = req.body;

    // Validate required fields
    if (!playerId || !injuryType || !severity) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: playerId, injuryType, and severity are required'
      });
    }

    // Validate severity enum
    const validSeverities = ['Minor', 'Moderate', 'Severe'];
    if (!validSeverities.includes(severity)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid severity. Must be one of: Minor, Moderate, Severe'
      });
    }

    // Verify player exists
    const player = await Profile.findById(playerId);
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }

    // Sanitize text inputs to prevent XSS (Requirement 21.5)
    const sanitizedInjuryType = sanitizeText(injuryType);
    const sanitizedNotes = notes ? sanitizeText(notes) : null;

    // Create injury record
    const injury = new Injury({
      playerId,
      injuryType: sanitizedInjuryType,
      severity,
      expectedRecovery: expectedRecovery ? new Date(expectedRecovery) : null,
      notes: sanitizedNotes,
      loggedBy: req.user.id
    });

    await injury.save();

    // Automatically set player fitness status to Red
    player.fitnessStatus = 'Red';
    await player.save();

    // Populate player details for response
    await injury.populate('playerId', 'fullName position fitnessStatus');

    // Log the operation
    await SystemLog.create({
      action: 'CREATE',
      performedBy: req.user.id,
      targetCollection: 'Injury',
      targetId: injury._id,
      changes: {
        playerId: injury.playerId._id,
        injuryType: injury.injuryType,
        severity: injury.severity,
        fitnessStatusSet: 'Red'
      }
    });

    // Emit Socket.io event for real-time updates
    const { getIO } = require('../utils/socketIO');
    const io = getIO();
    io.emit('injury:logged', {
      injuryId: injury._id,
      playerId: injury.playerId._id,
      playerName: injury.playerId.fullName,
      injuryType: injury.injuryType,
      severity: injury.severity,
      status: 'Red',
      dateLogged: injury.dateLogged
    });

    res.status(201).json({
      success: true,
      message: 'Injury logged successfully',
      injury: {
        id: injury._id,
        playerId: injury.playerId,
        injuryType: injury.injuryType,
        severity: injury.severity,
        expectedRecovery: injury.expectedRecovery,
        notes: injury.notes,
        resolved: injury.resolved,
        dateLogged: injury.dateLogged,
        loggedBy: injury.loggedBy
      }
    });
  } catch (error) {
    console.error('Log injury error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to log injury',
      error: error.message
    });
  }
};

/**
 * Get all injuries with pagination and filtering
 * GET /api/injuries
 * 
 * @access Coach, Manager, Admin
 */
const getAllInjuries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Build query filter
    const filter = {};

    // Filter by resolved status
    if (req.query.resolved !== undefined) {
      filter.resolved = req.query.resolved === 'true';
    }

    // Get injuries with pagination
    const injuries = await Injury.find(filter)
      .populate('playerId', 'fullName position fitnessStatus')
      .populate('loggedBy', 'email role')
      .sort({ dateLogged: -1 }) // Sort by date descending (newest first)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Injury.countDocuments(filter);

    res.status(200).json({
      success: true,
      injuries: injuries.map(injury => ({
        id: injury._id,
        playerId: injury.playerId,
        injuryType: injury.injuryType,
        severity: injury.severity,
        expectedRecovery: injury.expectedRecovery,
        notes: injury.notes,
        resolved: injury.resolved,
        recoveryDate: injury.recoveryDate,
        dateLogged: injury.dateLogged,
        loggedBy: injury.loggedBy
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get injuries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch injuries',
      error: error.message
    });
  }
};

/**
 * Mark injury as recovered
 * PUT /api/injuries/:id/recover
 * 
 * @access Coach, Admin
 */
const markRecovered = async (req, res) => {
  try {
    const { id } = req.params;
    const { recoveryDate, notes } = req.body;

    // Find injury
    const injury = await Injury.findById(id).populate('playerId');
    if (!injury) {
      return res.status(404).json({
        success: false,
        message: 'Injury not found'
      });
    }

    // Check if already resolved
    if (injury.resolved) {
      return res.status(400).json({
        success: false,
        message: 'Injury has already been marked as recovered'
      });
    }

    // Mark as recovered
    injury.resolved = true;
    injury.recoveryDate = recoveryDate ? new Date(recoveryDate) : new Date();
    
    if (notes) {
      injury.notes = injury.notes ? `${injury.notes}\nRecovery: ${notes}` : `Recovery: ${notes}`;
    }

    await injury.save();

    // Update player fitness status (reset from Red)
    const player = await Profile.findById(injury.playerId._id);
    if (player && player.fitnessStatus === 'Red') {
      player.fitnessStatus = 'Yellow'; // Set to Yellow after recovery
      await player.save();
    }

    // Log the operation
    await SystemLog.create({
      action: 'UPDATE',
      performedBy: req.user.id,
      targetCollection: 'Injury',
      targetId: injury._id,
      changes: {
        resolved: { from: false, to: true },
        recoveryDate: injury.recoveryDate,
        fitnessStatusUpdated: 'Yellow'
      }
    });

    res.status(200).json({
      success: true,
      message: 'Injury marked as recovered successfully',
      injury: {
        id: injury._id,
        playerId: injury.playerId,
        injuryType: injury.injuryType,
        severity: injury.severity,
        expectedRecovery: injury.expectedRecovery,
        notes: injury.notes,
        resolved: injury.resolved,
        recoveryDate: injury.recoveryDate,
        dateLogged: injury.dateLogged,
        loggedBy: injury.loggedBy
      }
    });
  } catch (error) {
    console.error('Mark recovered error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to mark injury as recovered',
      error: error.message
    });
  }
};

/**
 * Get active (unresolved) injuries
 * GET /api/injuries/active
 * 
 * @access Coach, Manager, Admin
 */
const getActiveInjuries = async (req, res) => {
  try {
    // Get all unresolved injuries
    const activeInjuries = await Injury.find({ resolved: false })
      .populate('playerId', 'fullName position fitnessStatus')
      .populate('loggedBy', 'email role')
      .sort({ dateLogged: -1 });

    res.status(200).json({
      success: true,
      count: activeInjuries.length,
      injuries: activeInjuries.map(injury => ({
        id: injury._id,
        playerId: injury.playerId,
        injuryType: injury.injuryType,
        severity: injury.severity,
        expectedRecovery: injury.expectedRecovery,
        notes: injury.notes,
        dateLogged: injury.dateLogged,
        loggedBy: injury.loggedBy
      }))
    });
  } catch (error) {
    console.error('Get active injuries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active injuries',
      error: error.message
    });
  }
};

module.exports = {
  logInjury,
  getAllInjuries,
  markRecovered,
  getActiveInjuries
};
