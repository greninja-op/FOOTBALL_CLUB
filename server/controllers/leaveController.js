const LeaveRequest = require('../models/LeaveRequest');
const Profile = require('../models/Profile');
const SystemLog = require('../models/SystemLog');
const { sanitizeText } = require('../utils/sanitize');

/**
 * Leave Request Controller
 * Handles leave request submission and approval workflow with Socket.io events
 * 
 * Validates Requirements: 12.1, 12.2, 12.3, 12.4, 12.7
 */

/**
 * Submit a new leave request
 * POST /api/leave
 * 
 * @access Player
 */
const submitRequest = async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;

    // Validate required fields
    if (!startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: startDate, endDate, and reason are required'
      });
    }

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date must be on or after start date'
      });
    }

    // Get player profile from authenticated user
    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Player profile not found'
      });
    }

    // Sanitize text input to prevent XSS (Requirement 21.5)
    const sanitizedReason = sanitizeText(reason);

    // Create leave request
    const leaveRequest = new LeaveRequest({
      playerId: profile._id,
      startDate: start,
      endDate: end,
      reason: sanitizedReason,
      status: 'Pending'
    });

    await leaveRequest.save();

    // Populate player details for response
    await leaveRequest.populate('playerId', 'fullName position');

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      request: {
        id: leaveRequest._id,
        playerId: leaveRequest.playerId,
        startDate: leaveRequest.startDate,
        endDate: leaveRequest.endDate,
        reason: leaveRequest.reason,
        status: leaveRequest.status,
        dateRequested: leaveRequest.dateRequested
      }
    });
  } catch (error) {
    console.error('Submit leave request error:', error);

    // Extract readable Mongoose validation error message
    let message = 'Failed to submit leave request';
    if (error.name === 'ValidationError') {
      // Get the first validation error message (e.g. "Reason must be at least 10 characters")
      const firstError = Object.values(error.errors)[0];
      message = firstError ? firstError.message : message;
    } else if (error.message) {
      message = error.message;
    }

    res.status(400).json({
      success: false,
      message
    });
  }
};

/**
 * Approve a leave request
 * PUT /api/leave/:id/approve
 * 
 * @access Coach, Admin
 */
const approveRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Find leave request
    const leaveRequest = await LeaveRequest.findById(id).populate('playerId', 'fullName position userId');
    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Check if already processed
    if (leaveRequest.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Leave request has already been ${leaveRequest.status.toLowerCase()}`
      });
    }

    // Update status
    leaveRequest.status = 'Approved';
    leaveRequest.reviewedBy = req.user.id;
    leaveRequest.reviewedAt = new Date();

    await leaveRequest.save();

    // Log the operation
    await SystemLog.create({
      action: 'UPDATE',
      performedBy: req.user.id,
      targetCollection: 'LeaveRequest',
      targetId: leaveRequest._id,
      changes: {
        status: { from: 'Pending', to: 'Approved' },
        reviewedBy: req.user.id,
        reviewedAt: leaveRequest.reviewedAt
      }
    });

    // Emit Socket.io event for real-time updates
    const { getIO } = require('../utils/socketIO');
    const io = getIO();
    io.emit('leave:approved', {
      requestId: leaveRequest._id,
      playerId: leaveRequest.playerId._id,
      playerName: leaveRequest.playerId.fullName,
      startDate: leaveRequest.startDate,
      endDate: leaveRequest.endDate,
      reviewedBy: req.user.id,
      reviewedAt: leaveRequest.reviewedAt
    });

    res.status(200).json({
      success: true,
      message: 'Leave request approved successfully',
      request: {
        id: leaveRequest._id,
        playerId: leaveRequest.playerId,
        startDate: leaveRequest.startDate,
        endDate: leaveRequest.endDate,
        reason: leaveRequest.reason,
        status: leaveRequest.status,
        dateRequested: leaveRequest.dateRequested,
        reviewedBy: leaveRequest.reviewedBy,
        reviewedAt: leaveRequest.reviewedAt
      }
    });
  } catch (error) {
    console.error('Approve leave request error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to approve leave request',
      error: error.message
    });
  }
};

/**
 * Deny a leave request
 * PUT /api/leave/:id/deny
 * 
 * @access Coach, Admin
 */
const denyRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Find leave request
    const leaveRequest = await LeaveRequest.findById(id).populate('playerId', 'fullName position userId');
    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Check if already processed
    if (leaveRequest.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Leave request has already been ${leaveRequest.status.toLowerCase()}`
      });
    }

    // Update status
    leaveRequest.status = 'Denied';
    leaveRequest.reviewedBy = req.user.id;
    leaveRequest.reviewedAt = new Date();

    await leaveRequest.save();

    // Log the operation
    await SystemLog.create({
      action: 'UPDATE',
      performedBy: req.user.id,
      targetCollection: 'LeaveRequest',
      targetId: leaveRequest._id,
      changes: {
        status: { from: 'Pending', to: 'Denied' },
        reviewedBy: req.user.id,
        reviewedAt: leaveRequest.reviewedAt
      }
    });

    // Emit Socket.io event for real-time updates
    const { getIO } = require('../utils/socketIO');
    const io = getIO();
    io.emit('leave:denied', {
      requestId: leaveRequest._id,
      playerId: leaveRequest.playerId._id,
      playerName: leaveRequest.playerId.fullName,
      startDate: leaveRequest.startDate,
      endDate: leaveRequest.endDate,
      reviewedBy: req.user.id,
      reviewedAt: leaveRequest.reviewedAt
    });

    res.status(200).json({
      success: true,
      message: 'Leave request denied successfully',
      request: {
        id: leaveRequest._id,
        playerId: leaveRequest.playerId,
        startDate: leaveRequest.startDate,
        endDate: leaveRequest.endDate,
        reason: leaveRequest.reason,
        status: leaveRequest.status,
        dateRequested: leaveRequest.dateRequested,
        reviewedBy: leaveRequest.reviewedBy,
        reviewedAt: leaveRequest.reviewedAt
      }
    });
  } catch (error) {
    console.error('Deny leave request error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to deny leave request',
      error: error.message
    });
  }
};

/**
 * Get player's leave request history
 * GET /api/leave/player/:playerId
 * 
 * @access Coach, Admin, Player (own only)
 */
const getPlayerRequests = async (req, res) => {
  try {
    const { playerId } = req.params;

    // Verify player exists
    const player = await Profile.findById(playerId);
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }

    if (req.user.role === 'player' && String(player.userId) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Players can only view their own leave history.'
      });
    }

    // Get all leave requests for this player
    const requests = await LeaveRequest.find({ playerId })
      .populate('reviewedBy', 'email role')
      .sort({ dateRequested: -1 }); // Sort by date descending (newest first)

    res.status(200).json({
      success: true,
      count: requests.length,
      requests: requests.map(req => ({
        id: req._id,
        playerId: req.playerId,
        startDate: req.startDate,
        endDate: req.endDate,
        reason: req.reason,
        status: req.status,
        dateRequested: req.dateRequested,
        reviewedBy: req.reviewedBy,
        reviewedAt: req.reviewedAt
      }))
    });
  } catch (error) {
    console.error('Get player requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave requests',
      error: error.message
    });
  }
};

/**
 * Get all pending leave requests
 * GET /api/leave/pending
 * 
 * @access Coach, Admin
 */
const getPendingRequests = async (req, res) => {
  try {
    // Get all pending leave requests
    const pendingRequests = await LeaveRequest.find({ status: 'Pending' })
      .populate('playerId', 'fullName position')
      .sort({ dateRequested: 1 }); // Sort by date ascending (oldest first)

    res.status(200).json({
      success: true,
      count: pendingRequests.length,
      requests: pendingRequests.map(req => ({
        id: req._id,
        playerId: req.playerId,
        startDate: req.startDate,
        endDate: req.endDate,
        reason: req.reason,
        status: req.status,
        dateRequested: req.dateRequested
      }))
    });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending requests',
      error: error.message
    });
  }
};

/**
 * Get all approved leave requests
 * GET /api/leave/approved
 *
 * @access Coach, Admin
 */
const getApprovedRequests = async (req, res) => {
  try {
    const today = new Date();
    const approvedRequests = await LeaveRequest.find({
      status: 'Approved',
      endDate: { $gte: today }
    })
      .populate('playerId', 'fullName position')
      .sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      count: approvedRequests.length,
      requests: approvedRequests.map((req) => ({
        id: req._id,
        playerId: req.playerId,
        startDate: req.startDate,
        endDate: req.endDate,
        reason: req.reason,
        status: req.status,
        dateRequested: req.dateRequested,
        reviewedBy: req.reviewedBy,
        reviewedAt: req.reviewedAt
      }))
    });
  } catch (error) {
    console.error('Get approved requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch approved requests',
      error: error.message
    });
  }
};

module.exports = {
  submitRequest,
  approveRequest,
  denyRequest,
  getPlayerRequests,
  getPendingRequests,
  getApprovedRequests
};
