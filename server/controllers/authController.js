const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const validator = require('validator');
const User = require('../models/User');

/**
 * Authentication Controller
 * Handles user authentication operations
 * 
 * Validates Requirements: 1.1, 1.2, 1.3, 1.4
 */

/**
 * Login function
 * Validates credentials and generates JWT token with 8-hour expiry
 * 
 * @param {string} email - User email
 * @param {string} password - Plain text password
 * @returns {Object} {token, role, userId} on success
 * @throws {Error} Authentication error without revealing email existence
 * 
 * Validates Requirements: 1.1, 1.2, 1.4
 */
const login = async (email, password) => {
  try {
    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Validate email format using RFC 5322 standard (Requirement 20.2)
    if (!validator.isEmail(email)) {
      throw new Error('Invalid email format');
    }

    // Find user by email and explicitly select passwordHash
    // (it's excluded by default in the schema)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

    // Generic error message to prevent email enumeration (Requirement 1.2)
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password using bcrypt.compare() (Requirement 1.4)
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      // Generic error message to prevent email enumeration (Requirement 1.2)
      throw new Error('Invalid credentials');
    }

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

    // Return token, role, and userId (Requirement 1.1)
    return {
      token,
      role: user.role,
      userId: user._id.toString()
    };

  } catch (error) {
    // Re-throw validation and credential errors as-is
    if (error.message === 'Invalid credentials' ||
        error.message === 'Invalid email format' ||
        error.message === 'Email and password are required') {
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
