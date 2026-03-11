const express = require('express');
const router = express.Router();
const disciplinaryController = require('../controllers/disciplinaryController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleGuard');
const loggerMiddleware = require('../middleware/loggerMiddleware');

/**
 * Disciplinary Action Routes
 * Handles disciplinary action management with role-based access control
 * 
 * Validates Requirements: 15.1, 15.2, 15.3
 */

/**
 * POST /api/disciplinary
 * Log a disciplinary action
 * 
 * @access Coach, Admin
 */
router.post('/', authMiddleware, requireRole(['coach', 'admin']), loggerMiddleware, disciplinaryController.logAction);

/**
 * GET /api/disciplinary
 * Get all disciplinary actions with pagination and filtering
 * 
 * @access Coach, Manager, Admin
 */
router.get('/', authMiddleware, requireRole(['coach', 'manager', 'admin']), disciplinaryController.getAllActions);

/**
 * GET /api/disciplinary/pending
 * Get pending fines with totals
 * 
 * @access Coach, Manager, Admin
 */
router.get('/pending', authMiddleware, requireRole(['coach', 'manager', 'admin']), disciplinaryController.getPendingFines);

/**
 * PUT /api/disciplinary/:id/pay
 * Mark disciplinary action as paid
 * 
 * @access Manager, Admin
 */
router.put('/:id/pay', authMiddleware, requireRole(['manager', 'admin']), loggerMiddleware, disciplinaryController.markPaid);

module.exports = router;
