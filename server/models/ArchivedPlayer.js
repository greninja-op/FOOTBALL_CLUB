const mongoose = require('mongoose');

/**
 * ArchivedPlayer Schema
 * Frozen departure snapshot for a player stint.
 */
const ArchivedPlayerSchema = new mongoose.Schema({
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
  archivedAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Archived by user ID is required']
  },
  reason: {
    type: String,
    required: [true, 'Archive reason is required'],
    enum: {
      values: ['transferred', 'released', 'retired', 'loan_ended', 'academy_exit', 'other'],
      message: '{VALUE} is not a valid archive reason'
    }
  },
  notes: {
    type: String,
    default: null,
    maxlength: [1000, 'Archive notes cannot exceed 1000 characters']
  },
  careerSummaryAtClub: {
    totalGoals: {
      type: Number,
      default: 0,
      min: [0, 'Total goals cannot be negative']
    },
    totalAssists: {
      type: Number,
      default: 0,
      min: [0, 'Total assists cannot be negative']
    },
    totalAppearances: {
      type: Number,
      default: 0,
      min: [0, 'Total appearances cannot be negative']
    },
    totalMinutes: {
      type: Number,
      default: 0,
      min: [0, 'Total minutes cannot be negative']
    },
    seasonsPlayed: {
      type: Number,
      default: 0,
      min: [0, 'Seasons played cannot be negative']
    },
    trophiesWon: [{
      type: String,
      trim: true,
      maxlength: [100, 'Trophy name cannot exceed 100 characters']
    }]
  },
  snapshot: {
    fullName: {
      type: String,
      required: [true, 'Snapshot full name is required'],
      trim: true
    },
    photo: {
      type: String,
      default: null
    },
    jerseyNumber: {
      type: Number,
      default: null
    },
    primaryPosition: {
      type: String,
      default: null
    },
    contractType: {
      type: String,
      default: null
    },
    joinedAt: {
      type: Date,
      default: null
    },
    leftAt: {
      type: Date,
      default: null
    }
  }
});

ArchivedPlayerSchema.index({ playerId: 1, archivedAt: -1 });
ArchivedPlayerSchema.index({ membershipId: 1 }, { unique: true });
ArchivedPlayerSchema.index({ reason: 1, archivedAt: -1 });

const ArchivedPlayer = mongoose.model('ArchivedPlayer', ArchivedPlayerSchema);

module.exports = ArchivedPlayer;
