const mongoose = require('mongoose');

/**
 * Fixture Schema
 * Represents scheduled matches with opponent, date, location, match type, lineup, and creator tracking
 * 
 * Validates Requirements: 6.1, 6.4, 10.6, 22.1, 22.3
 */
const FixtureSchema = new mongoose.Schema({
  opponent: {
    type: String,
    required: [true, 'Opponent name is required'],
    trim: true,
    minlength: [2, 'Opponent name must be at least 2 characters'],
    maxlength: [100, 'Opponent name cannot exceed 100 characters']
  },
  date: {
    type: Date,
    required: [true, 'Fixture date is required'],
    validate: {
      validator: function(v) {
        // Validate that fixture date is not in the past
        // Allow dates from today onwards
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day for fair comparison
        return v >= today;
      },
      message: 'Fixture date cannot be in the past'
    }
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  matchType: {
    type: String,
    enum: {
      values: ['League', 'Cup', 'Friendly', 'Tournament'],
      message: '{VALUE} is not a valid match type. Must be one of: League, Cup, Friendly, Tournament'
    },
    default: 'League'
  },
  lineup: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile'
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
FixtureSchema.index({ date: 1 }); // Index for date-based queries and sorting
FixtureSchema.index({ createdBy: 1 }); // Index for creator-based queries

// Pre-save validation to enforce lineup size limit (max 18 players: 11 starters + 7 subs)
FixtureSchema.pre('save', function(next) {
  if (this.lineup && this.lineup.length > 18) {
    const error = new Error('Lineup cannot exceed 18 players (11 starters + 7 substitutes)');
    error.name = 'ValidationError';
    return next(error);
  }
  next();
});

// Pre-update validation to enforce lineup size limit on updates
FixtureSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  const lineup = update.lineup || (update.$set && update.$set.lineup);
  
  if (lineup && lineup.length > 18) {
    const error = new Error('Lineup cannot exceed 18 players (11 starters + 7 substitutes)');
    error.name = 'ValidationError';
    return next(error);
  }
  next();
});

const Fixture = mongoose.model('Fixture', FixtureSchema);

module.exports = Fixture;
