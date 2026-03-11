const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * Validates JWT tokens and attaches user information to request
 * 
 * Validates Requirements: 1.3, 2.1, 21.1
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authMiddleware = (req, res, next) => {
  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists
    if (!authHeader) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No authorization header provided'
      });
    }

    // Check if it's a Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Invalid authorization format. Expected: Bearer <token>'
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.substring(7);

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No token provided'
      });
    }

    // Verify JWT token using secret from environment
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user information to request object
    // Expected payload structure: {id, role, iat, exp}
    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    // Proceed to next middleware
    next();
  } catch (error) {
    // Handle JWT-specific errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Token has expired'
      });
    }

    // Handle other errors
    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Token verification failed'
    });
  }
};

module.exports = authMiddleware;
