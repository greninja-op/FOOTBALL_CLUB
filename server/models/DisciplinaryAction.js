const mongoose = require('mongoose');

/**
 * DisciplinaryAction Schema
 * Represents fines and offenses logged against players with payment tracking
 * 
 * Validates Requirements: 15.1, 22.1
 */
const DisciplinaryActionSchema = new mongoose.Schema({
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: [true, 'Player ID is required']
  },
  offense: {
    type: String,
    required: [true, 'Offense description is required'],
    trim: true,
    minlength: [5, 'Offense description must be at least 5 characters'],
    maxlength: [200, 'Offense description cannot exceed 200 characters']
  },
  fineAmount: {
    type: Number,
    required: [true, 'Fine amount is required'],
    min: [0, 'Fine amount cannot be negative'],
    max: [100000, 'Fine amount cannot exceed 100,000']
  },
  dateIssued: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paymentDate: {
    type: Date,
    default: null
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Issuer user ID is required']
  }
});

// Indexes for performance optimization
DisciplinaryActionSchema.index({ playerId: 1 }); // Index for player-based queries
DisciplinaryActionSchema.index({ isPaid: 1 }); // Index for filtering paid/unpaid fines
DisciplinaryActionSchema.index({ dateIssued: -1 }); // Index for date-based sorting (descending)

const DisciplinaryAction = mongoose.model('DisciplinaryAction', DisciplinaryActionSchema);

module.exports = DisciplinaryAction;
