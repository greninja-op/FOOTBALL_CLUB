const mongoose = require('mongoose');

/**
 * SeasonStats Schema
 * Immutable season-level performance snapshot for a player membership.
 */
const MatchRatingSchema = new mongoose.Schema({
  fixtureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fixture',
    required: [true, 'Fixture ID is required']
  },
  rating: {
    type: Number,
    required: [true, 'Match rating is required'],
    min: [0, 'Rating must be between 0 and 10'],
    max: [10, 'Rating must be between 0 and 10']
  },
  coachNotes: {
    type: String,
    default: null,
    maxlength: [1000, 'Coach notes cannot exceed 1000 characters']
  }
}, { _id: false });

const SeasonStatsSchema = new mongoose.Schema({
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: [true, 'Player ID is required']
  },
  membershipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClubMembership',
    required: [true, 'Membership ID is required']
  },
  season: {
    type: String,
    required: [true, 'Season is required'],
    match: [/^\d{4}\/\d{2}$/, 'Season must be in YYYY/YY format']
  },
  goals: {
    type: Number,
    default: 0,
    min: [0, 'Goals cannot be negative']
  },
  assists: {
    type: Number,
    default: 0,
    min: [0, 'Assists cannot be negative']
  },
  yellowCards: {
    type: Number,
    default: 0,
    min: [0, 'Yellow cards cannot be negative']
  },
  redCards: {
    type: Number,
    default: 0,
    min: [0, 'Red cards cannot be negative']
  },
  minutesPlayed: {
    type: Number,
    default: 0,
    min: [0, 'Minutes played cannot be negative']
  },
  appearances: {
    type: Number,
    default: 0,
    min: [0, 'Appearances cannot be negative']
  },
  offsides: {
    type: Number,
    default: 0,
    min: [0, 'Offsides cannot be negative']
  },
  matchRatings: [MatchRatingSchema],
  archivedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

SeasonStatsSchema.index({ playerId: 1, season: 1 });
SeasonStatsSchema.index({ membershipId: 1, season: 1 }, { unique: true });

SeasonStatsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

SeasonStatsSchema.virtual('averageRating').get(function() {
  if (!this.matchRatings || this.matchRatings.length === 0) {
    return 0;
  }

  const total = this.matchRatings.reduce((sum, entry) => sum + entry.rating, 0);
  return Number((total / this.matchRatings.length).toFixed(2));
});

SeasonStatsSchema.set('toJSON', { virtuals: true });
SeasonStatsSchema.set('toObject', { virtuals: true });

const SeasonStats = mongoose.model('SeasonStats', SeasonStatsSchema);

module.exports = SeasonStats;
