const mongoose = require('mongoose');

/**
 * TrainingSession Schema
 * Represents scheduled training sessions with date, drill descriptions, duration, attendance tracking, and creator tracking
 * 
 * Validates Requirements: 11.1, 11.2, 11.5, 22.1
 */
const TrainingSessionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Training session date is required'],
    validate: {
      validator: function(v) {
        // Validate that training date is not in the past
        // Allow dates from today onwards
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day for fair comparison
        return v >= today;
      },
      message: 'Training date cannot be in the past'
    }
  },
  drillDescription: {
    type: String,
    required: [true, 'Drill description is required'],
    trim: true,
    minlength: [10, 'Drill description must be at least 10 characters'],
    maxlength: [500, 'Drill description cannot exceed 500 characters']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [30, 'Duration must be at least 30 minutes'],
    max: [300, 'Duration cannot exceed 300 minutes']
  },
  attendees: [{
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      required: [true, 'Player ID is required for attendee']
    },
    status: {
      type: String,
      enum: {
        values: ['Present', 'Absent', 'Excused'],
        message: '{VALUE} is not a valid attendance status. Must be one of: Present, Absent, Excused'
      },
      default: 'Absent'
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator user ID is required']
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  }
});

// Indexes for performance optimization
TrainingSessionSchema.index({ date: 1 }); // Index for date-based queries and sorting
TrainingSessionSchema.index({ createdBy: 1 }); // Index for creator-based queries

const TrainingSession = mongoose.model('TrainingSession', TrainingSessionSchema);

module.exports = TrainingSession;
