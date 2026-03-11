const mongoose = require('mongoose');

/**
 * Inventory Schema
 * Represents equipment items with assignment tracking and virtual assignment status
 * 
 * Validates Requirements: 9.1, 22.1
 */
const InventorySchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    minlength: [2, 'Item name must be at least 2 characters'],
    maxlength: [100, 'Item name cannot exceed 100 characters']
  },
  itemType: {
    type: String,
    enum: {
      values: ['Jersey', 'Boots', 'Training Equipment', 'Medical', 'Other'],
      message: '{VALUE} is not a valid item type. Must be one of: Jersey, Boots, Training Equipment, Medical, Other'
    },
    required: [true, 'Item type is required']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    default: null
  },
  assignedAt: {
    type: Date,
    default: null
  },
  returnedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  }
});

// Indexes for performance optimization
InventorySchema.index({ assignedTo: 1 }); // Index for assignment-based queries
InventorySchema.index({ itemType: 1 }); // Index for item type filtering

// Virtual property to check if item is currently assigned
InventorySchema.virtual('isAssigned').get(function() {
  return this.assignedTo !== null && this.returnedAt === null;
});

// Ensure virtuals are included in JSON and object responses
InventorySchema.set('toJSON', { virtuals: true });
InventorySchema.set('toObject', { virtuals: true });

const Inventory = mongoose.model('Inventory', InventorySchema);

module.exports = Inventory;
