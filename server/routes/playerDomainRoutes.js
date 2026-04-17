const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleGuard');
const {
  listPlayerDomainRecords,
  getAvailabilityBoard,
  updateAvailabilityOverride,
  listArchivedPlayers,
  archiveLegacyProfile,
  reinstateArchivedPlayer
} = require('../controllers/playerDomainController');

router.use(authMiddleware);

// GET /api/player-domain/archive - list archived players
router.get('/archive', requireRole(['admin']), listArchivedPlayers);

// GET /api/player-domain/players - list active player-domain records
router.get('/players', requireRole(['admin']), listPlayerDomainRecords);

// GET /api/player-domain/availability - coach/admin availability board
router.get('/availability', requireRole(['coach', 'admin']), getAvailabilityBoard);
router.patch('/availability/:profileId', requireRole(['coach', 'admin']), updateAvailabilityOverride);

// POST /api/player-domain/profiles/:profileId/archive - archive a legacy profile
router.post('/profiles/:profileId/archive', requireRole(['admin']), archiveLegacyProfile);

// POST /api/player-domain/archive/:archiveId/reinstate - create a new active membership
router.post('/archive/:archiveId/reinstate', requireRole(['admin']), reinstateArchivedPlayer);

module.exports = router;
