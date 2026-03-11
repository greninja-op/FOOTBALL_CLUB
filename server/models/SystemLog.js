const mongoose = require('mongoose');

/**
 * SystemLog Schema
 * Represents immutable audit trail entries for all database write operations
 * 
 * Validates Requirements: 5.1, 5.3, 22.1
 */
const SystemLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: {
      values: ['CREATE', 'UPDATE', 'DELETE'],
      message: '{VALUE} is not a valid action. Must be one of: CREATE, UPDATE, DELETE'
    }
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Performer user ID is required']
  },
  targetCollection: {
    type: String,
    required: [true, 'Target collection is required']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Target document ID is required']
  },
  changes: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now,
    immutable: true
  }
});

// Indexes for performance optimization
SystemLogSchema.index({ timestamp: -1 }); // Index for chronological sorting (descending)
SystemLogSchema.index({ performedBy: 1 }); // Index for user-based queries
SystemLogSchema.index({ targetCollection: 1 }); // Index for collection-based filtering

// Prevent updates to system logs (immutability enforcement)
SystemLogSchema.pre('updateOne', function(next) {
  const error = new Error('System logs cannot be modified');
  error.name = 'ImmutabilityError';
  next(error);
});

SystemLogSchema.pre('findOneAndUpdate', function(next) {
  const error = new Error('System logs cannot be modified');
  error.name = 'ImmutabilityError';
  next(error);
});

SystemLogSchema.pre('update', function(next) {
  const error = new Error('System logs cannot be modified');
  error.name = 'ImmutabilityError';
  next(error);
});

// Prevent deletion of system logs (immutability enforcement)
SystemLogSchema.pre('deleteOne', function(next) {
  const error = new Error('System logs cannot be deleted');
  error.name = 'ImmutabilityError';
  next(error);
});

SystemLogSchema.pre('findOneAndDelete', function(next) {
  const error = new Error('System logs cannot be deleted');
  error.name = 'ImmutabilityError';
  next(error);
});

SystemLogSchema.pre('remove', function(next) {
  const error = new Error('System logs cannot be deleted');
  error.name = 'ImmutabilityError';
  next(error);
});

const SystemLog = mongoose.model('SystemLog', SystemLogSchema);

module.exports = SystemLog;
