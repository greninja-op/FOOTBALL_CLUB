const express = require('express');
const router = express.Router();
const { getAllLogs } = require('../controllers/systemLogController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleGuard');

/**
 * System Log Routes
 * Read-only routes for audit trail viewing
 * 
 * All routes require authentication and admin role
 * Validates Requirements: 5.2, 5.5
 */

// GET /api/logs - Get all system logs with pagination and filtering
// Query params: page, limit, startDate, endDate
router.get('/', authMiddleware, requireRole(['admin']), getAllLogs);

module.exports = router;
