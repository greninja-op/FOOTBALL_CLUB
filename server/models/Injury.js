const mongoose = require('mongoose');

/**
 * Injury Schema
 * Represents player injury records with severity tracking, recovery dates, and resolution status
 * 
 * Validates Requirements: 14.1, 22.1
 */
const InjurySchema = new mongoose.Schema({
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: [true, 'Player ID is required']
  },
  injuryType: {
    type: String,
    required: [true, 'Injury type is required'],
    trim: true,
    minlength: [3, 'Injury type must be at least 3 characters'],
    maxlength: [100, 'Injury type cannot exceed 100 characters']
  },
  severity: {
    type: String,
    enum: {
      values: ['Minor', 'Moderate', 'Severe'],
      message: '{VALUE} is not a valid severity. Must be one of: Minor, Moderate, Severe'
    },
    required: [true, 'Severity is required']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  dateLogged: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  expectedRecovery: {
    type: Date,
    required: [true, 'Expected recovery date is required']
  },
  actualRecovery: {
    type: Date,
    default: null
  },
  resolved: {
    type: Boolean,
    default: false
  },
  loggedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Logger user ID is required']
  }
});

// Indexes for performance optimization
InjurySchema.index({ playerId: 1 }); // Index for player-based queries
InjurySchema.index({ resolved: 1 }); // Index for filtering active/resolved injuries
InjurySchema.index({ dateLogged: -1 }); // Index for date-based sorting (descending)

const Injury = mongoose.model('Injury', InjurySchema);

module.exports = Injury;
