const mongoose = require('mongoose');

/**
 * User Schema
 * Represents system users with role-based access control
 * 
 * Validates Requirements: 3.1, 3.2, 3.5, 22.1
 */
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        // RFC 5322 compliant email regex (simplified but robust version)
        return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  passwordHash: {
    type: String,
    required: [true, 'Password hash is required'],
    select: false // Don't include in queries by default for security
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: {
      values: ['admin', 'manager', 'coach', 'player'],
      message: '{VALUE} is not a valid role. Must be one of: admin, manager, coach, player'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  }
});

// Indexes for performance optimization
UserSchema.index({ role: 1 }); // Index for role-based queries

// Prevent password hash from being returned in JSON responses
UserSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.passwordHash;
    return ret;
  }
});

// Prevent password hash from being returned in object responses
UserSchema.set('toObject', {
  transform: function(doc, ret) {
    delete ret.passwordHash;
    return ret;
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
