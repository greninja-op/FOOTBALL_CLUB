const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleGuard');
const loggerMiddleware = require('../middleware/loggerMiddleware');

/**
 * Training Session Routes
 * Handles training session management with role-based access control
 * 
 * Validates Requirements: 11.1, 11.2, 11.3
 */

/**
 * POST /api/training
 * Create a new training session
 * 
 * @access Coach, Admin
 */
router.post('/', authMiddleware, requireRole(['coach', 'admin']), loggerMiddleware, trainingController.createSession);

/**
 * GET /api/training
 * Get all training sessions with pagination and filtering
 * 
 * @access All authenticated users
 */
router.get('/', authMiddleware, trainingController.getAllSessions);

/**
 * PUT /api/training/:id/attendance
 * Mark attendance for a training session
 * 
 * @access Coach, Admin
 */
router.put('/:id/attendance', authMiddleware, requireRole(['coach', 'admin']), loggerMiddleware, trainingController.markAttendance);

module.exports = router;
