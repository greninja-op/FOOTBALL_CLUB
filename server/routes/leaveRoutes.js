const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleGuard');
const loggerMiddleware = require('../middleware/loggerMiddleware');
const {
  submitRequest,
  approveRequest,
  denyRequest,
  getPlayerRequests,
  getPendingRequests
} = require('../controllers/leaveController');

// POST /api/leave - Submit leave request (Player only)
router.post(
  '/',
  authMiddleware,
  requireRole(['player']),
  submitRequest
);

// GET /api/leave - Get leave requests (Coach/Admin see all pending, Player sees own only)
router.get(
  '/',
  authMiddleware,
  async (req, res, next) => {
    // If player role, redirect to their own requests
    if (req.user.role === 'player') {
      // Get player profile
      const Profile = require('../models/Profile');
      const profile = await Profile.findOne({ userId: req.user.id });
      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Player profile not found'
        });
      }
      req.params.playerId = profile._id.toString();
      return getPlayerRequests(req, res);
    }
    // For coach/admin, show pending requests
    return getPendingRequests(req, res);
  }
);

// GET /api/leave/pending - Get pending requests (Coach, Admin)
router.get(
  '/pending',
  authMiddleware,
  requireRole(['coach', 'admin']),
  getPendingRequests
);

// GET /api/leave/player/:playerId - Get player's leave history (Coach, Admin, Player own only)
router.get(
  '/player/:playerId',
  authMiddleware,
  getPlayerRequests
);

// PUT /api/leave/:id/approve - Approve leave request (Coach, Admin only)
router.put(
  '/:id/approve',
  authMiddleware,
  requireRole(['coach', 'admin']),
  loggerMiddleware,
  approveRequest
);

// PUT /api/leave/:id/deny - Deny leave request (Coach, Admin only)
router.put(
  '/:id/deny',
  authMiddleware,
  requireRole(['coach', 'admin']),
  loggerMiddleware,
  denyRequest
);

module.exports = router;
