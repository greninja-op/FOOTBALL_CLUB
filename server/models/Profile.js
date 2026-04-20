const mongoose = require('mongoose');

/**
 * Profile Schema
 * Represents player and staff profiles with fitness tracking, statistics, and contract information
 * 
 * Validates Requirements: 3.6, 7.1, 13.1, 16.5, 22.1
 */
const ProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters'],
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  photo: {
    type: String,
    default: null
  },
  position: {
    type: String,
    enum: {
      values: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Staff'],
      message: '{VALUE} is not a valid position. Must be one of: Goalkeeper, Defender, Midfielder, Forward, Staff'
    },
    default: 'Staff'
  },
  preferredPosition: {
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
      message: '{VALUE} is not a valid preferred position'
    },
    default: 'STAFF'
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
  playerStatus: {
    type: String,
    enum: {
      values: ['active', 'inactive', 'listed', 'archived', 'transferred', 'retired'],
      message: '{VALUE} is not a valid player status'
    },
    default: 'active'
  },
  availabilityNotes: {
    type: String,
    default: null,
    maxlength: [500, 'Availability notes cannot exceed 500 characters']
  },
  availabilityOverrideStatus: {
    type: String,
    enum: {
      values: ['auto', 'available', 'unavailable'],
      message: '{VALUE} is not a valid availability override status'
    },
    default: 'auto'
  },
  availabilityOverrideReason: {
    type: String,
    default: null,
    maxlength: [250, 'Availability override reason cannot exceed 250 characters']
  },
  weight: {
    type: Number,
    min: [40, 'Weight must be at least 40 kg'],
    max: [150, 'Weight cannot exceed 150 kg']
  },
  height: {
    type: Number,
    min: [150, 'Height must be at least 150 cm'],
    max: [220, 'Height cannot exceed 220 cm']
  },
  jerseyNumber: {
    type: Number,
    default: null,
    min: [1, 'Jersey number must be at least 1'],
    max: [99, 'Jersey number cannot exceed 99']
  },
  fitnessStatus: {
    type: String,
    enum: {
      values: ['Green', 'Yellow', 'Red'],
      message: '{VALUE} is not a valid fitness status. Must be one of: Green, Yellow, Red'
    },
    default: 'Green'
  },
  contractType: {
    type: String,
    enum: {
      values: ['Full-Time', 'Part-Time', 'Loan', 'Trial'],
      message: '{VALUE} is not a valid contract type. Must be one of: Full-Time, Part-Time, Loan, Trial'
    },
    default: 'Full-Time'
  },
  weeklySalary: {
    type: Number,
    default: 0,
    min: [0, 'Weekly salary cannot be negative']
  },
  transferFee: {
    type: Number,
    default: 0,
    min: [0, 'Transfer fee cannot be negative']
  },
  contractLengthYears: {
    type: Number,
    default: 1,
    min: [0, 'Contract length years cannot be negative']
  },
  marketabilityScore: {
    type: Number,
    default: 50,
    min: [1, 'Marketability score must be at least 1'],
    max: [100, 'Marketability score cannot exceed 100']
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
        // Only validate if both contractStart and contractEnd are set
        if (this.contractStart && v) {
          return v >= this.contractStart;
        }
        return true;
      },
      message: 'Contract end date must be after contract start date'
    }
  },
  stats: {
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
    appearances: {
      type: Number,
      default: 0,
      min: [0, 'Appearances cannot be negative']
    },
    minutes: {
      type: Number,
      default: 0,
      min: [0, 'Minutes cannot be negative']
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
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be between 0 and 10'],
      max: [10, 'Rating must be between 0 and 10']
    }
  },
  performanceNotes: [{
    note: {
      type: String,
      required: [true, 'Performance note text is required'],
      maxlength: [1000, 'Performance note cannot exceed 1000 characters']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Performance note must have a creator']
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true
    }
  }]
});

// Indexes for performance optimization
ProfileSchema.index({ fitnessStatus: 1 }); // Index for fitness status queries
ProfileSchema.index({ contractEnd: 1 }); // Index for contract expiry tracking

// Virtual property to calculate days remaining until contract expiry
ProfileSchema.virtual('contractDaysRemaining').get(function() {
  if (!this.contractEnd) {
    return null;
  }
  const today = new Date();
  const endDate = new Date(this.contractEnd);
  const diffTime = endDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// Virtual property to check if contract is expiring soon (less than 90 days)
ProfileSchema.virtual('contractExpiringSoon').get(function() {
  const daysRemaining = this.contractDaysRemaining;
  return daysRemaining !== null && daysRemaining > 0 && daysRemaining < 90;
});

// Ensure virtuals are included in JSON and object responses
ProfileSchema.set('toJSON', { virtuals: true });
ProfileSchema.set('toObject', { virtuals: true });

const Profile = mongoose.model('Profile', ProfileSchema);

module.exports = Profile;
