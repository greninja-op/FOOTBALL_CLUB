const Fixture = require('../models/Fixture');
const SystemLog = require('../models/SystemLog');
const { sanitizeText } = require('../utils/sanitize');

/**
 * Fixture Controller
 * Handles fixture management with CRUD operations, Socket.io events, and audit logging
 * 
 * Validates Requirements: 6.1, 6.2, 6.4, 6.5, 10.6
 */

/**
 * Create a new fixture
 * POST /api/fixtures
 * 
 * @access Manager, Admin
 */
const createFixture = async (req, res) => {
  try {
    const { opponent, date, location, matchType, lineup } = req.body;

    // Validate required fields
    if (!opponent || !date || !location) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: opponent, date, and location are required'
      });
    }

    // Validate lineup size if provided (max 18 players)
    if (lineup && lineup.length > 18) {
      return res.status(400).json({
        success: false,
        message: 'Lineup cannot exceed 18 players (11 starters + 7 substitutes)'
      });
    }

    // Validate date is not in the past
    const fixtureDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (fixtureDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Fixture date cannot be in the past'
      });
    }

    // Sanitize text inputs to prevent XSS (Requirement 21.5)
    const sanitizedOpponent = sanitizeText(opponent);
    const sanitizedLocation = sanitizeText(location);

    // Create fixture
    const fixture = new Fixture({
      opponent: sanitizedOpponent,
      date: fixtureDate,
      location: sanitizedLocation,
      matchType: matchType || 'League',
      lineup: lineup || [],
      createdBy: req.user.id
    });

    await fixture.save();

    // Log the operation
    await SystemLog.create({
      action: 'CREATE',
      performedBy: req.user.id,
      targetCollection: 'Fixture',
      targetId: fixture._id,
      changes: {
        opponent: fixture.opponent,
        date: fixture.date,
        location: fixture.location,
        matchType: fixture.matchType
      }
    });

    // Emit Socket.io event for real-time updates
    const { getIO } = require('../utils/socketIO');
    const io = getIO();
    io.emit('fixture:created', {
      id: fixture._id,
      opponent: fixture.opponent,
      date: fixture.date,
      location: fixture.location,
      matchType: fixture.matchType,
      lineup: fixture.lineup
    });

    res.status(201).json({
      success: true,
      message: 'Fixture created successfully',
      fixture: {
        id: fixture._id,
        opponent: fixture.opponent,
        date: fixture.date,
        location: fixture.location,
        matchType: fixture.matchType,
        lineup: fixture.lineup,
        createdBy: fixture.createdBy,
        createdAt: fixture.createdAt
      }
    });
  } catch (error) {
    console.error('Create fixture error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create fixture',
      error: error.message
    });
  }
};

/**
 * Get all fixtures with pagination and date filtering
 * GET /api/fixtures
 * 
 * @access All authenticated users
 */
const getAllFixtures = async (req, res) => {
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

    // Get fixtures with pagination
    const fixtures = await Fixture.find(filter)
      .populate('createdBy', 'email role')
      .populate('lineup', 'fullName position fitnessStatus')
      .sort({ date: 1 }) // Sort by date ascending (upcoming first)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Fixture.countDocuments(filter);

    res.status(200).json({
      success: true,
      fixtures: fixtures.map(fixture => ({
        id: fixture._id,
        opponent: fixture.opponent,
        date: fixture.date,
        location: fixture.location,
        matchType: fixture.matchType,
        lineup: fixture.lineup,
        createdBy: fixture.createdBy,
        createdAt: fixture.createdAt
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get fixtures error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fixtures',
      error: error.message
    });
  }
};

/**
 * Update fixture details
 * PUT /api/fixtures/:id
 * 
 * @access Manager, Coach, Admin
 * Note: Only coach can update lineup field
 */
const updateFixture = async (req, res) => {
  try {
    const { id } = req.params;
    const { opponent, date, location, matchType, lineup } = req.body;

    // Find fixture
    const fixture = await Fixture.findById(id);
    if (!fixture) {
      return res.status(404).json({
        success: false,
        message: 'Fixture not found'
      });
    }

    // Track changes for logging
    const changes = {};

    // Update fields if provided
    if (opponent !== undefined) {
      changes.opponent = { from: fixture.opponent, to: opponent };
      fixture.opponent = opponent;
    }

    if (date !== undefined) {
      // Validate date is not in the past
      const newDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (newDate < today) {
        return res.status(400).json({
          success: false,
          message: 'Fixture date cannot be in the past'
        });
      }
      
      changes.date = { from: fixture.date, to: newDate };
      fixture.date = newDate;
    }

    if (location !== undefined) {
      changes.location = { from: fixture.location, to: location };
      fixture.location = location;
    }

    if (matchType !== undefined) {
      changes.matchType = { from: fixture.matchType, to: matchType };
      fixture.matchType = matchType;
    }

    if (lineup !== undefined) {
      // Validate lineup size (max 18 players)
      if (lineup.length > 18) {
        return res.status(400).json({
          success: false,
          message: 'Lineup cannot exceed 18 players (11 starters + 7 substitutes)'
        });
      }
      
      changes.lineup = { from: fixture.lineup.length, to: lineup.length };
      fixture.lineup = lineup;
    }

    await fixture.save();

    // Log the operation
    await SystemLog.create({
      action: 'UPDATE',
      performedBy: req.user.id,
      targetCollection: 'Fixture',
      targetId: fixture._id,
      changes
    });

    res.status(200).json({
      success: true,
      message: 'Fixture updated successfully',
      fixture: {
        id: fixture._id,
        opponent: fixture.opponent,
        date: fixture.date,
        location: fixture.location,
        matchType: fixture.matchType,
        lineup: fixture.lineup,
        createdBy: fixture.createdBy,
        createdAt: fixture.createdAt
      }
    });
  } catch (error) {
    console.error('Update fixture error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update fixture',
      error: error.message
    });
  }
};

/**
 * Delete fixture
 * DELETE /api/fixtures/:id
 * 
 * @access Manager, Admin
 */
const deleteFixture = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete fixture
    const fixture = await Fixture.findById(id);
    if (!fixture) {
      return res.status(404).json({
        success: false,
        message: 'Fixture not found'
      });
    }

    // Store fixture data for logging before deletion
    const fixtureData = {
      opponent: fixture.opponent,
      date: fixture.date,
      location: fixture.location,
      matchType: fixture.matchType
    };

    await Fixture.findByIdAndDelete(id);

    // Log the operation
    await SystemLog.create({
      action: 'DELETE',
      performedBy: req.user.id,
      targetCollection: 'Fixture',
      targetId: id,
      changes: fixtureData
    });

    res.status(200).json({
      success: true,
      message: 'Fixture deleted successfully'
    });
  } catch (error) {
    console.error('Delete fixture error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete fixture',
      error: error.message
    });
  }
};

module.exports = {
  createFixture,
  getAllFixtures,
  updateFixture,
  deleteFixture
};
