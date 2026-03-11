const mongoose = require('mongoose');

/**
 * LeaveRequest Schema
 * Represents player leave requests with approval workflow and date range validation
 * 
 * Validates Requirements: 12.1, 12.2, 12.7, 22.1
 */
const LeaveRequestSchema = new mongoose.Schema({
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: [true, 'Player ID is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(v) {
        // Validate that end date is not before start date
        return v >= this.startDate;
      },
      message: 'End date must be on or after start date'
    }
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true,
    minlength: [10, 'Reason must be at least 10 characters'],
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['Pending', 'Approved', 'Denied'],
      message: '{VALUE} is not a valid status. Must be one of: Pending, Approved, Denied'
    },
    default: 'Pending'
  },
  dateRequested: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  }
});

// Indexes for performance optimization
LeaveRequestSchema.index({ playerId: 1 }); // Index for player-based queries
LeaveRequestSchema.index({ status: 1 }); // Index for filtering by status
LeaveRequestSchema.index({ startDate: 1 }); // Index for date-based queries

const LeaveRequest = mongoose.model('LeaveRequest', LeaveRequestSchema);

module.exports = LeaveRequest;
