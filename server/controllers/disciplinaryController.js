const DisciplinaryAction = require('../models/DisciplinaryAction');
const Profile = require('../models/Profile');
const SystemLog = require('../models/SystemLog');
const { sanitizeText } = require('../utils/sanitize');

/**
 * Disciplinary Action Controller
 * Handles disciplinary action management with fine tracking and Socket.io events
 * 
 * Validates Requirements: 15.1, 15.2, 15.3, 15.4
 */

/**
 * Log a disciplinary action
 * POST /api/disciplinary
 * 
 * @access Coach, Admin
 */
const logAction = async (req, res) => {
  try {
    const { playerId, offense, fineAmount, dateIssued } = req.body;

    // Validate required fields
    if (!playerId || !offense || fineAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: playerId, offense, and fineAmount are required'
      });
    }

    // Validate fine amount range
    if (fineAmount < 0 || fineAmount > 100000) {
      return res.status(400).json({
        success: false,
        message: 'Fine amount must be between 0 and 100,000'
      });
    }

    // Sanitize text input to prevent XSS (Requirement 21.5)
    const sanitizedOffense = sanitizeText(offense);

    // Verify player exists
    const player = await Profile.findById(playerId);
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }

    // Create disciplinary action
    const action = new DisciplinaryAction({
      playerId,
      offense: sanitizedOffense,
      fineAmount,
      dateIssued: dateIssued || new Date(),
      issuedBy: req.user.id
    });

    await action.save();

    // Populate player details for response
    await action.populate('playerId', 'fullName position');

    // Log the operation
    await SystemLog.create({
      action: 'CREATE',
      performedBy: req.user.id,
      targetCollection: 'DisciplinaryAction',
      targetId: action._id,
      changes: {
        playerId: action.playerId._id,
        offense: action.offense,
        fineAmount: action.fineAmount
      }
    });

    // Emit Socket.io event for real-time updates
    const { getIO } = require('../utils/socketIO');
    const io = getIO();
    io.emit('fine:issued', {
      actionId: action._id,
      playerId: action.playerId._id,
      playerName: action.playerId.fullName,
      offense: action.offense,
      amount: action.fineAmount,
      dateIssued: action.dateIssued
    });

    res.status(201).json({
      success: true,
      message: 'Disciplinary action logged successfully',
      action: {
        id: action._id,
        playerId: action.playerId,
        offense: action.offense,
        fineAmount: action.fineAmount,
        dateIssued: action.dateIssued,
        isPaid: action.isPaid,
        paymentDate: action.paymentDate,
        issuedBy: action.issuedBy
      }
    });
  } catch (error) {
    console.error('Log disciplinary action error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to log disciplinary action',
      error: error.message
    });
  }
};

/**
 * Get all disciplinary actions with pagination and filtering
 * GET /api/disciplinary
 * 
 * @access Coach, Manager, Admin
 */
const getAllActions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Build query filter
    const filter = {};

    // Filter by payment status
    if (req.query.isPaid !== undefined) {
      filter.isPaid = req.query.isPaid === 'true';
    }

    // Get disciplinary actions with pagination
    const actions = await DisciplinaryAction.find(filter)
      .populate('playerId', 'fullName position')
      .populate('issuedBy', 'email role')
      .sort({ dateIssued: -1 }) // Sort by date descending (newest first)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await DisciplinaryAction.countDocuments(filter);

    res.status(200).json({
      success: true,
      actions: actions.map(action => ({
        id: action._id,
        playerId: action.playerId,
        offense: action.offense,
        fineAmount: action.fineAmount,
        dateIssued: action.dateIssued,
        isPaid: action.isPaid,
        paymentDate: action.paymentDate,
        issuedBy: action.issuedBy
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get disciplinary actions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch disciplinary actions',
      error: error.message
    });
  }
};

/**
 * Mark disciplinary action as paid
 * PUT /api/disciplinary/:id/pay
 * 
 * @access Manager, Admin
 */
const markPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentDate } = req.body;

    // Find disciplinary action
    const action = await DisciplinaryAction.findById(id);
    if (!action) {
      return res.status(404).json({
        success: false,
        message: 'Disciplinary action not found'
      });
    }

    // Check if already paid
    if (action.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'Fine has already been marked as paid'
      });
    }

    // Mark as paid
    action.isPaid = true;
    action.paymentDate = paymentDate ? new Date(paymentDate) : new Date();

    await action.save();

    // Log the operation
    await SystemLog.create({
      action: 'UPDATE',
      performedBy: req.user.id,
      targetCollection: 'DisciplinaryAction',
      targetId: action._id,
      changes: {
        isPaid: { from: false, to: true },
        paymentDate: action.paymentDate
      }
    });

    res.status(200).json({
      success: true,
      message: 'Fine marked as paid successfully',
      action: {
        id: action._id,
        playerId: action.playerId,
        offense: action.offense,
        fineAmount: action.fineAmount,
        dateIssued: action.dateIssued,
        isPaid: action.isPaid,
        paymentDate: action.paymentDate,
        issuedBy: action.issuedBy
      }
    });
  } catch (error) {
    console.error('Mark paid error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to mark fine as paid',
      error: error.message
    });
  }
};

/**
 * Get pending fines with totals
 * GET /api/disciplinary/pending
 * 
 * @access Coach, Manager, Admin
 */
const getPendingFines = async (req, res) => {
  try {
    // Get all unpaid fines
    const pendingFines = await DisciplinaryAction.find({ isPaid: false })
      .populate('playerId', 'fullName position')
      .populate('issuedBy', 'email role')
      .sort({ dateIssued: -1 });

    // Calculate total pending amount
    const totalPending = pendingFines.reduce((sum, action) => sum + action.fineAmount, 0);

    // Group by player
    const finesByPlayer = {};
    pendingFines.forEach(action => {
      const playerId = action.playerId._id.toString();
      if (!finesByPlayer[playerId]) {
        finesByPlayer[playerId] = {
          playerId: action.playerId._id,
          playerName: action.playerId.fullName,
          position: action.playerId.position,
          fines: [],
          totalAmount: 0
        };
      }
      finesByPlayer[playerId].fines.push({
        id: action._id,
        offense: action.offense,
        amount: action.fineAmount,
        dateIssued: action.dateIssued,
        issuedBy: action.issuedBy
      });
      finesByPlayer[playerId].totalAmount += action.fineAmount;
    });

    res.status(200).json({
      success: true,
      totalPending,
      count: pendingFines.length,
      finesByPlayer: Object.values(finesByPlayer),
      allFines: pendingFines.map(action => ({
        id: action._id,
        playerId: action.playerId,
        offense: action.offense,
        fineAmount: action.fineAmount,
        dateIssued: action.dateIssued,
        issuedBy: action.issuedBy
      }))
    });
  } catch (error) {
    console.error('Get pending fines error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending fines',
      error: error.message
    });
  }
};

module.exports = {
  logAction,
  getAllActions,
  markPaid,
  getPendingFines
};
