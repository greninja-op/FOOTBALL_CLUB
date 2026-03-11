const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, uploadLogo, upload } = require('../controllers/settingsController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleGuard');
const loggerMiddleware = require('../middleware/loggerMiddleware');

/**
 * Settings Routes
 * 
 * All routes require authentication
 * Update routes require admin role
 * 
 * Validates Requirements: 4.1, 4.2, 4.4, 23.3
 */

// GET /api/settings - Get club settings (all authenticated users)
router.get('/', authMiddleware, getSettings);

// PUT /api/settings - Update club settings (admin only)
router.put('/', authMiddleware, requireRole(['admin']), loggerMiddleware, updateSettings);

// POST /api/settings/logo - Upload club logo (admin only)
router.post('/logo', 
  authMiddleware, 
  requireRole(['admin']), 
  upload.single('logo'), 
  uploadLogo
);

module.exports = router;
