const Inventory = require('../models/Inventory');
const SystemLog = require('../models/SystemLog');

/**
 * Inventory Controller
 * Handles inventory management with CRUD operations, assignment tracking, and Socket.io events
 * 
 * Validates Requirements: 9.1, 9.2, 9.4, 9.5
 */

/**
 * Create a new inventory item
 * POST /api/inventory
 * 
 * @access Manager, Admin
 */
const createItem = async (req, res) => {
  try {
    const { itemName, itemType } = req.body;

    // Validate required fields
    if (!itemName || !itemType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: itemName and itemType are required'
      });
    }

    // Create inventory item
    const item = new Inventory({
      itemName,
      itemType
    });

    await item.save();

    // Log the operation
    await SystemLog.create({
      action: 'CREATE',
      performedBy: req.user.id,
      targetCollection: 'Inventory',
      targetId: item._id,
      changes: {
        itemName: item.itemName,
        itemType: item.itemType
      }
    });

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      item: {
        id: item._id,
        itemName: item.itemName,
        itemType: item.itemType,
        assignedTo: item.assignedTo,
        assignedAt: item.assignedAt,
        returnedAt: item.returnedAt,
        isAssigned: item.isAssigned,
        createdAt: item.createdAt
      }
    });
  } catch (error) {
    console.error('Create inventory item error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create inventory item',
      error: error.message
    });
  }
};

/**
 * Assign inventory item to a player
 * PUT /api/inventory/:id/assign
 * 
 * @access Manager, Admin
 */
const assignItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { playerId } = req.body;

    // Validate required fields
    if (!playerId) {
      return res.status(400).json({
        success: false,
        message: 'Player ID is required'
      });
    }

    // Find inventory item
    const item = await Inventory.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Check if item is already assigned
    if (item.isAssigned) {
      return res.status(400).json({
        success: false,
        message: 'Item is already assigned. Please return it first.'
      });
    }

    // Assign item to player
    item.assignedTo = playerId;
    item.assignedAt = new Date();
    item.returnedAt = null; // Clear any previous return date

    await item.save();

    // Populate player details for response
    await item.populate('assignedTo', 'fullName position');

    // Log the operation
    await SystemLog.create({
      action: 'UPDATE',
      performedBy: req.user.id,
      targetCollection: 'Inventory',
      targetId: item._id,
      changes: {
        assignedTo: playerId,
        assignedAt: item.assignedAt
      }
    });

    // Emit Socket.io event for real-time updates
    const { getIO } = require('../utils/socketIO');
    const io = getIO();
    io.emit('inventory:assigned', {
      itemId: item._id,
      itemName: item.itemName,
      itemType: item.itemType,
      playerId: playerId,
      playerName: item.assignedTo?.fullName,
      assignedAt: item.assignedAt
    });

    res.status(200).json({
      success: true,
      message: 'Item assigned successfully',
      item: {
        id: item._id,
        itemName: item.itemName,
        itemType: item.itemType,
        assignedTo: item.assignedTo,
        assignedAt: item.assignedAt,
        returnedAt: item.returnedAt,
        isAssigned: item.isAssigned,
        createdAt: item.createdAt
      }
    });
  } catch (error) {
    console.error('Assign inventory item error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to assign inventory item',
      error: error.message
    });
  }
};

/**
 * Unassign inventory item (record return)
 * PUT /api/inventory/:id/return
 * 
 * @access Manager, Admin
 */
const unassignItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { returnDate } = req.body;

    // Find inventory item
    const item = await Inventory.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Check if item is assigned
    if (!item.isAssigned) {
      return res.status(400).json({
        success: false,
        message: 'Item is not currently assigned'
      });
    }

    // Store previous assignment info for logging
    const previousAssignedTo = item.assignedTo;

    // Record return
    item.returnedAt = returnDate ? new Date(returnDate) : new Date();

    await item.save();

    // Log the operation
    await SystemLog.create({
      action: 'UPDATE',
      performedBy: req.user.id,
      targetCollection: 'Inventory',
      targetId: item._id,
      changes: {
        returnedAt: item.returnedAt,
        previouslyAssignedTo: previousAssignedTo
      }
    });

    res.status(200).json({
      success: true,
      message: 'Item return recorded successfully',
      item: {
        id: item._id,
        itemName: item.itemName,
        itemType: item.itemType,
        assignedTo: item.assignedTo,
        assignedAt: item.assignedAt,
        returnedAt: item.returnedAt,
        isAssigned: item.isAssigned,
        createdAt: item.createdAt
      }
    });
  } catch (error) {
    console.error('Unassign inventory item error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to record item return',
      error: error.message
    });
  }
};

/**
 * Get all inventory items with pagination and filtering
 * GET /api/inventory
 * 
 * @access All authenticated users
 */
const getAllItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Build query filter
    const filter = {};

    // Filter by assignment status
    if (req.query.assigned !== undefined) {
      const isAssigned = req.query.assigned === 'true';
      if (isAssigned) {
        // Currently assigned: has assignedTo and no returnedAt
        filter.assignedTo = { $ne: null };
        filter.returnedAt = null;
      } else {
        // Not assigned: either no assignedTo or has returnedAt
        filter.$or = [
          { assignedTo: null },
          { returnedAt: { $ne: null } }
        ];
      }
    }

    // Get inventory items with pagination
    const items = await Inventory.find(filter)
      .populate('assignedTo', 'fullName position')
      .sort({ createdAt: -1 }) // Sort by creation date descending (newest first)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Inventory.countDocuments(filter);

    res.status(200).json({
      success: true,
      items: items.map(item => ({
        id: item._id,
        itemName: item.itemName,
        itemType: item.itemType,
        assignedTo: item.assignedTo,
        assignedAt: item.assignedAt,
        returnedAt: item.returnedAt,
        isAssigned: item.isAssigned,
        createdAt: item.createdAt
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get inventory items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory items',
      error: error.message
    });
  }
};

module.exports = {
  createItem,
  assignItem,
  unassignItem,
  getAllItems
};
