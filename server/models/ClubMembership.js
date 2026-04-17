const mongoose = require('mongoose');

/**
 * ClubMembership Schema
 * Represents one stint a player has with the club.
 */
const ClubMembershipSchema = new mongoose.Schema({
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: [true, 'Player ID is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  legacyProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    default: null
  },
  jerseyNumber: {
    type: Number,
    min: [1, 'Jersey number must be at least 1'],
    max: [99, 'Jersey number cannot exceed 99'],
    default: null
  },
  primaryPosition: {
    type: String,
    enum: {
      values: [
        'GK',
        'CB',
        'LB',
        'RB',
        'LWB',
        'RWB',
        'DM',
        'CM',
        'AM',
        'CAM',
        'LM',
        'RM',
        'LW',
        'RW',
        'CF',
        'ST',
        'SS',
        'UTILITY',
        'STAFF'
      ],
      message: '{VALUE} is not a valid primary position'
    },
    required: [true, 'Primary position is required']
  },
  secondaryPositions: [{
    type: String,
    enum: {
      values: [
        'GK',
        'CB',
        'LB',
        'RB',
        'LWB',
        'RWB',
        'DM',
        'CM',
        'AM',
        'CAM',
        'LM',
        'RM',
        'LW',
        'RW',
        'CF',
        'ST',
        'SS',
        'UTILITY',
        'STAFF'
      ],
      message: '{VALUE} is not a valid secondary position'
    }
  }],
  contractType: {
    type: String,
    enum: {
      values: ['Owned', 'On Loan', 'Academy', 'Trial', 'Staff'],
      message: '{VALUE} is not a valid contract type'
    },
    default: 'Owned'
  },
  squadRole: {
    type: String,
    enum: {
      values: ['starter', 'rotation', 'prospect', 'captain', 'staff'],
      message: '{VALUE} is not a valid squad role'
    },
    default: 'rotation'
  },
  contractStart: {
    type: Date,
    default: null
  },
  contractEnd: {
    type: Date,
    default: null,
    validate: {
      validator: function(v) {
        if (this.contractStart && v) {
          return v >= this.contractStart;
        }
        return true;
      },
      message: 'Contract end date must be on or after contract start date'
    }
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  leftAt: {
    type: Date,
    default: null
  },
  leftReason: {
    type: String,
    enum: {
      values: ['transferred', 'released', 'retired', 'loan_ended', 'academy_exit'],
      message: '{VALUE} is not a valid departure reason'
    },
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  availabilityStatus: {
    type: String,
    enum: {
      values: ['available', 'injured', 'suspended', 'leave', 'illness', 'personal', 'listed'],
      message: '{VALUE} is not a valid availability status'
    },
    default: 'available'
  },
  availabilityDetails: {
    reason: {
      type: String,
      default: null,
      maxlength: [200, 'Availability reason cannot exceed 200 characters']
    },
    expectedReturnDate: {
      type: Date,
      default: null
    },
    source: {
      type: String,
      enum: {
        values: ['manual', 'injury', 'disciplinary', 'leave', 'system'],
        message: '{VALUE} is not a valid availability source'
      },
      default: 'system'
    }
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

ClubMembershipSchema.index({ playerId: 1, isActive: 1 });
ClubMembershipSchema.index({ userId: 1 }, { sparse: true });
ClubMembershipSchema.index({ legacyProfileId: 1 }, { sparse: true });
ClubMembershipSchema.index({ jerseyNumber: 1, isActive: 1 });
ClubMembershipSchema.index({ joinedAt: -1 });

ClubMembershipSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (this.leftAt) {
    this.isActive = false;
  }
  next();
});

const ClubMembership = mongoose.model('ClubMembership', ClubMembershipSchema);

module.exports = ClubMembership;
