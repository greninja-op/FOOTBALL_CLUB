const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const validator = require('validator');
const User = require('../models/User');
const Profile = require('../models/Profile');

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const normalizeWhitespace = (value) => String(value || '').trim().replace(/\s+/g, ' ');

/**
 * Authentication Controller
 * Handles user authentication operations
 * 
 * Validates Requirements: 1.1, 1.2, 1.3, 1.4
 */

/**
 * Login function
 * Validates credentials and generates JWT token with 8-hour expiry
 * Supports login by email OR fullName (case-insensitive)
 * 
 * @param {string} identifier - User email or fullName
 * @param {string} password - Plain text password
 * @returns {Object} {token, role, userId, fullName} on success
 * @throws {Error} Authentication error without revealing email existence
 * 
 * Validates Requirements: 1.1, 1.2, 1.4
 */
const login = async (identifier, password) => {
  try {
    // Validate input
    if (!identifier || !password) {
      throw new Error('Email/name and password are required');
    }

    let user = null;
    let passwordAlreadyValidated = false;
    const normalizedIdentifier = normalizeWhitespace(identifier);
    const normalizedEmailIdentifier = normalizedIdentifier.toLowerCase();

    // Try to find by email first
    if (validator.isEmail(normalizedEmailIdentifier)) {
      user = await User.findOne({ email: normalizedEmailIdentifier }).select('+passwordHash');
    }

    // If not found by email, try to find by fullName (case-insensitive with flexible spacing)
    if (!user) {
      const normalizedNameIdentifier = normalizedEmailIdentifier;
      const namePattern = normalizedNameIdentifier
        .split(' ')
        .map((part) => escapeRegExp(part))
        .join('\\s+');

      const matchingProfiles = await Profile.find({
        fullName: { $regex: new RegExp(`^${namePattern}$`, 'i') }
      }).select('userId');

      if (matchingProfiles.length > 0) {
        const candidateUserIds = [...new Set(matchingProfiles.map((profile) => String(profile.userId)))];
        const candidateUsers = await User.find({ _id: { $in: candidateUserIds } }).select('+passwordHash');

        for (const candidateUser of candidateUsers) {
          const isCandidatePasswordValid = await bcrypt.compare(password, candidateUser.passwordHash);

          if (isCandidatePasswordValid) {
            user = candidateUser;
            passwordAlreadyValidated = true;
            break;
          }
        }
      }
    }

    // Generic error message to prevent email enumeration (Requirement 1.2)
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password using bcrypt.compare() (Requirement 1.4)
    const isPasswordValid = passwordAlreadyValidated
      ? true
      : await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      // Generic error message to prevent email enumeration (Requirement 1.2)
      throw new Error('Invalid credentials');
    }

    // Get profile for fullName
    const profile = await Profile.findOne({ userId: user._id });

    // Generate JWT token with 8-hour expiry (Requirement 1.1)
    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '8h' // 8 hours as specified in requirements
      }
    );

    // Return token, role, userId, and fullName (Requirement 1.1)
    return {
      token,
      role: user.role,
      userId: user._id.toString(),
      fullName: profile?.fullName || null,
      email: user.email
    };

  } catch (error) {
    // Re-throw validation and credential errors as-is
    if (error.message === 'Invalid credentials' ||
        error.message === 'Invalid email format' ||
        error.message === 'Email/name and password are required') {
      throw error;
    }
    // For unexpected errors, throw generic authentication error
    throw new Error('Authentication failed');
  }
};

/**
 * Logout function
 * Clears client-side token (handled by client)
 * Server-side logout is stateless with JWT
 * 
 * @returns {Object} Success message
 */
const logout = () => {
  // With JWT, logout is handled client-side by removing the token
  // This function exists for API consistency and future enhancements
  return {
    message: 'Logged out successfully'
  };
};

/**
 * Verify Token function
 * Validates JWT and returns user data
 * 
 * @param {string} token - JWT token to verify
 * @returns {Object} {valid: true, user: {id, role}} on success
 * @throws {Error} If token is invalid or expired
 * 
 * Validates Requirements: 1.3
 */
const verifyToken = (token) => {
  try {
    // Validate input
    if (!token) {
      throw new Error('Token is required');
    }

    // Verify JWT using secret from environment (Requirement 1.3)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Return validation result with user data
    return {
      valid: true,
      user: {
        id: decoded.id,
        role: decoded.role
      }
    };

  } catch (error) {
    // Handle JWT-specific errors
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }

    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }

    // Handle other errors
    throw new Error('Token verification failed');
  }
};

module.exports = {
  login,
  logout,
  verifyToken
};
