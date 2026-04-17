const mongoose = require('mongoose');

/**
 * Player Schema
 * Permanent identity record for a football person.
 *
 * Phase 1 note:
 * This model is introduced alongside the legacy Profile model so the app can
 * migrate gradually without breaking current flows.
 */
const PlayerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters'],
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  nationality: {
    type: String,
    default: null,
    trim: true,
    maxlength: [60, 'Nationality cannot exceed 60 characters']
  },
  photo: {
    type: String,
    default: null
  },
  contactEmail: {
    type: String,
    default: null,
    lowercase: true,
    trim: true
  },
  contactPhone: {
    type: String,
    default: null,
    trim: true,
    maxlength: [30, 'Contact phone cannot exceed 30 characters']
  },
  emergencyContact: {
    name: {
      type: String,
      default: null,
      trim: true,
      maxlength: [100, 'Emergency contact name cannot exceed 100 characters']
    },
    phone: {
      type: String,
      default: null,
      trim: true,
      maxlength: [30, 'Emergency contact phone cannot exceed 30 characters']
    },
    relationship: {
      type: String,
      default: null,
      trim: true,
      maxlength: [50, 'Emergency contact relationship cannot exceed 50 characters']
    }
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'archived', 'transferred', 'retired'],
      message: '{VALUE} is not a valid player status'
    },
    default: 'active'
  },
  currentUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  legacyProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
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

PlayerSchema.index({ fullName: 1 });
PlayerSchema.index({ status: 1 });
PlayerSchema.index({ currentUserId: 1 }, { sparse: true });
PlayerSchema.index({ legacyProfileId: 1 }, { sparse: true });

PlayerSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Player = mongoose.model('Player', PlayerSchema);

module.exports = Player;
