const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleGuard');

/**
 * Settings Routes
 * 
 * All routes require authentication
 * Update routes require admin role
 */

// GET /api/settings - Get club settings (all authenticated users)
router.get('/', authMiddleware, getSettings);

// PUT /api/settings - Update club settings (admin only)
router.put('/', authMiddleware, requireRole(['admin']), updateSettings);

module.exports = router;
