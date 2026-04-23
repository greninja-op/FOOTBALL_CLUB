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
  (req, res, next) => {
    console.log('📥 Logo upload route hit');
    console.log('📥 Request method:', req.method);
    console.log('📥 Request URL:', req.originalUrl);
    console.log('📥 Request path:', req.path);
    console.log('📥 Content-Type:', req.get('Content-Type'));
    console.log('📥 Headers:', Object.keys(req.headers));
    next();
  },
  authMiddleware,
  (req, res, next) => {
    console.log('✅ Auth middleware passed');
    console.log('👤 User:', req.user);
    next();
  },
  requireRole(['admin']),
  (req, res, next) => {
    console.log('✅ Role check passed');
    next();
  },
  upload.single('logo'),
  (req, res, next) => {
    console.log('✅ Multer middleware passed');
    console.log('📦 File:', req.file ? 'Present' : 'Missing');
    console.log('📦 File details:', req.file);
    next();
  },
  uploadLogo
);

// GET /api/settings/logo - Test route to verify endpoint exists
router.get('/logo', (req, res) => {
  console.log('📥 GET /logo route hit');
  res.json({ message: 'Logo upload endpoint exists' });
});

module.exports = router;
