const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const SystemLog = require('../models/SystemLog');

/**
 * Authentication Routes
 * Handles login, logout, and token verification
 * 
 * Validates Requirements: 1.1, 1.2, 23.4
 */

/**
 * POST /api/auth/login
 * Authenticates user and returns JWT token
 * No authentication required
 * 
 * Request body:
 * {
 *   email: string,
 *   password: string
 * }
 * 
 * Response:
 * {
 *   token: string,
 *   role: string,
 *   userId: string
 * }
 * 
 * Status codes:
 * - 200: Success
 * - 400: Invalid input
 * - 401: Invalid credentials
 * 
 * Validates Requirements: 1.1, 1.2
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email and password are required'
      });
    }

    // Call controller login function
    const result = await authController.login(email, password);

    await SystemLog.create({
      action: 'LOGIN',
      performedBy: result.userId,
      targetCollection: 'User',
      targetId: result.userId,
      changes: {
        path: req.originalUrl,
        ipAddress: req.ip,
        userAgent: req.get('user-agent') || null
      }
    });

    // Return success response (Requirement 23.4)
    return res.status(200).json(result);

  } catch (error) {
    // Return 401 for authentication errors (Requirement 23.4)
    if (error.message === 'Invalid credentials' || error.message === 'Authentication failed') {
      return res.status(401).json({
        error: 'Authentication failed',
        message: error.message
      });
    }

    // Return 400 for validation errors
    return res.status(400).json({
      error: 'Bad request',
      message: error.message
    });
  }
});

/**
 * POST /api/auth/logout
 * Logs out user (client-side token removal)
 * No authentication required (stateless JWT)
 * 
 * Response:
 * {
 *   message: string
 * }
 * 
 * Status codes:
 * - 200: Success
 * 
 * Validates Requirements: 1.1
 */
router.post('/logout', (req, res) => {
  try {
    const result = authController.logout();
    
    // Return success response (Requirement 23.4)
    return res.status(200).json(result);

  } catch (error) {
    return res.status(400).json({
      error: 'Bad request',
      message: error.message
    });
  }
});

/**
 * GET /api/auth/verify
 * Verifies JWT token and returns user data
 * Requires authMiddleware
 * 
 * Headers:
 * Authorization: Bearer <token>
 * 
 * Response:
 * {
 *   valid: boolean,
 *   user: {
 *     id: string,
 *     role: string
 *   }
 * }
 * 
 * Status codes:
 * - 200: Valid token
 * - 401: Invalid or expired token
 * 
 * Validates Requirements: 1.3, 23.4
 */
router.get('/verify', authMiddleware, (req, res) => {
  try {
    // If authMiddleware passes, token is valid
    // req.user is already populated by authMiddleware
    return res.status(200).json({
      valid: true,
      user: {
        id: req.user.id,
        role: req.user.role
      }
    });

  } catch (error) {
    // This should rarely be reached since authMiddleware handles most errors
    return res.status(401).json({
      error: 'Authentication failed',
      message: error.message
    });
  }
});

module.exports = router;
