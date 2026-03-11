const TrainingSession = require('../models/TrainingSession');
const SystemLog = require('../models/SystemLog');
const { sanitizeText } = require('../utils/sanitize');

/**
 * Training Session Controller
 * Handles training session management with attendance tracking
 * 
 * Validates Requirements: 11.1, 11.2, 11.3, 11.5
 */

/**
 * Create a new training session
 * POST /api/training
 * 
 * @access Coach, Admin
 */
const createSession = async (req, res) => {
  try {
    const { date, drillDescription, duration, attendees } = req.body;

    // Validate required fields
    if (!date || !drillDescription || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: date, drillDescription, and duration are required'
      });
    }

    // Validate date is not in the past
    const sessionDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (sessionDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Training session date cannot be in the past'
      });
    }

    // Validate duration range
    if (duration < 30 || duration > 300) {
      return res.status(400).json({
        success: false,
        message: 'Duration must be between 30 and 300 minutes'
      });
    }

    // Sanitize text input to prevent XSS (Requirement 21.5)
    const sanitizedDrillDescription = sanitizeText(drillDescription);

    // Create training session
    const session = new TrainingSession({
      date: sessionDate,
      drillDescription: sanitizedDrillDescription,
      duration,
      attendees: attendees || [],
      createdBy: req.user.id
    });

    await session.save();

    // Log the operation
    await SystemLog.create({
      action: 'CREATE',
      performedBy: req.user.id,
      targetCollection: 'TrainingSession',
      targetId: session._id,
      changes: {
        date: session.date,
        drillDescription: session.drillDescription,
        duration: session.duration
      }
    });

    res.status(201).json({
      success: true,
      message: 'Training session created successfully',
      session: {
        id: session._id,
        date: session.date,
        drillDescription: session.drillDescription,
        duration: session.duration,
        attendees: session.attendees,
        createdBy: session.createdBy,
        createdAt: session.createdAt
      }
    });
  } catch (error) {
    console.error('Create training session error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create training session',
      error: error.message
    });
  }
};

/**
 * Mark attendance for a training session
 * PUT /api/training/:id/attendance
 * 
 * @access Coach, Admin
 */
const markAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { playerId, status } = req.body;

    // Validate required fields
    if (!playerId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: playerId and status are required'
      });
    }

    // Validate status enum
    const validStatuses = ['Present', 'Absent', 'Excused'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: Present, Absent, Excused'
      });
    }

    // Find training session
    const session = await TrainingSession.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Training session not found'
      });
    }

    // Check if player already in attendees
    const existingAttendee = session.attendees.find(
      a => a.playerId.toString() === playerId
    );

    if (existingAttendee) {
      // Update existing attendance
      existingAttendee.status = status;
    } else {
      // Add new attendee
      session.attendees.push({ playerId, status });
    }

    await session.save();

    // Log the operation
    await SystemLog.create({
      action: 'UPDATE',
      performedBy: req.user.id,
      targetCollection: 'TrainingSession',
      targetId: session._id,
      changes: {
        playerId,
        attendanceStatus: status,
        timestamp: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: 'Attendance marked successfully',
      session: {
        id: session._id,
        date: session.date,
        drillDescription: session.drillDescription,
        duration: session.duration,
        attendees: session.attendees,
        createdBy: session.createdBy,
        createdAt: session.createdAt
      }
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to mark attendance',
      error: error.message
    });
  }
};

/**
 * Get all training sessions with pagination and date filtering
 * GET /api/training
 * 
 * @access All authenticated users
 */
const getAllSessions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Build query filter
    const filter = {};

    // Date range filtering
    if (req.query.startDate || req.query.endDate) {
      filter.date = {};
      if (req.query.startDate) {
        filter.date.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.date.$lte = new Date(req.query.endDate);
      }
    }

    // Get training sessions with pagination
    const sessions = await TrainingSession.find(filter)
      .populate('createdBy', 'email role')
      .populate('attendees.playerId', 'fullName position')
      .sort({ date: 1 }) // Sort by date ascending (upcoming first)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await TrainingSession.countDocuments(filter);

    res.status(200).json({
      success: true,
      sessions: sessions.map(session => ({
        id: session._id,
        date: session.date,
        drillDescription: session.drillDescription,
        duration: session.duration,
        attendees: session.attendees,
        createdBy: session.createdBy,
        createdAt: session.createdAt
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get training sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch training sessions',
      error: error.message
    });
  }
};

module.exports = {
  createSession,
  markAttendance,
  getAllSessions
};
