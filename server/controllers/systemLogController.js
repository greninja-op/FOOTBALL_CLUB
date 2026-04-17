const SystemLog = require('../models/SystemLog');
const User = require('../models/User');
const { getOnlineUserIds } = require('../utils/socketIO');

/**
 * System Log Controller
 * Read-only controller for viewing audit logs
 * 
 * Validates Requirements: 5.2, 5.5
 */

/**
 * Get all system logs with pagination and filtering
 * GET /api/logs
 * 
 * @access Admin only
 * @query page - Page number (default: 1)
 * @query limit - Items per page (default: 20)
 * @query startDate - Filter logs from this date
 * @query endDate - Filter logs until this date
 */
exports.getAllLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter query
    const filter = {};
    
    // Date range filtering
    if (req.query.startDate || req.query.endDate) {
      filter.timestamp = {};
      if (req.query.startDate) {
        filter.timestamp.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.timestamp.$lte = new Date(req.query.endDate);
      }
    }

    const [logs, total, onlineUsers, loginHistory] = await Promise.all([
      SystemLog.find(filter)
        .populate('performedBy', 'email role')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      SystemLog.countDocuments(filter),
      User.find({ _id: { $in: getOnlineUserIds() } })
        .select('email role')
        .sort({ role: 1, email: 1 }),
      SystemLog.find({ action: 'LOGIN' })
        .populate('performedBy', 'email role')
        .sort({ timestamp: -1 })
        .limit(20)
    ]);

    res.status(200).json({
      success: true,
      logs: logs.map(log => ({
        id: log._id,
        action: log.action,
        performedBy: log.performedBy ? {
          id: log.performedBy._id,
          email: log.performedBy.email,
          role: log.performedBy.role
        } : null,
        targetCollection: log.targetCollection,
        targetId: log.targetId,
        timestamp: log.timestamp
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      onlineUsers: onlineUsers.map((user) => ({
        id: user._id,
        email: user.email,
        role: user.role
      })),
      loginHistory: loginHistory.map((entry) => ({
        id: entry._id,
        timestamp: entry.timestamp,
        performedBy: entry.performedBy ? {
          id: entry.performedBy._id,
          email: entry.performedBy.email,
          role: entry.performedBy.role
        } : null
      }))
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching system logs',
      error: error.message
    });
  }
};
