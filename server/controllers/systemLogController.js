const SystemLog = require('../models/SystemLog');

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

    // Get logs with pagination, sorted by timestamp descending (newest first)
    const logs = await SystemLog.find(filter)
      .populate('performedBy', 'email role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SystemLog.countDocuments(filter);

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
      }
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
