const express = require('express');
const router = express.Router();
const injuryController = require('../controllers/injuryController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleGuard');
const loggerMiddleware = require('../middleware/loggerMiddleware');

/**
 * Injury Routes
 * Handles injury tracking with role-based access control
 * 
 * Validates Requirements: 14.1, 14.2, 14.3, 14.4
 */

/**
 * POST /api/injuries
 * Log a new injury
 * 
 * @access Coach, Admin
 */
router.post('/', authMiddleware, requireRole(['coach', 'admin']), loggerMiddleware, injuryController.logInjury);

/**
 * GET /api/injuries
 * Get all injuries with pagination and filtering
 * 
 * @access Coach, Manager, Admin
 */
router.get('/', authMiddleware, requireRole(['coach', 'manager', 'admin']), injuryController.getAllInjuries);

/**
 * GET /api/injuries/active
 * Get active (unresolved) injuries
 * 
 * @access Coach, Manager, Admin
 */
router.get('/active', authMiddleware, requireRole(['coach', 'manager', 'admin']), injuryController.getActiveInjuries);

/**
 * PUT /api/injuries/:id/recover
 * Mark injury as recovered
 * 
 * @access Coach, Admin
 */
router.put('/:id/recover', authMiddleware, requireRole(['coach', 'admin']), loggerMiddleware, injuryController.markRecovered);

module.exports = router;
