const express = require('express');
const router = express.Router();
const {
  getPublicHome,
  getPublicPlayers,
  getPublicPlayerDetail,
  getPublicMatchDetail
} = require('../controllers/publicController');

router.get('/home', getPublicHome);
router.get('/players', getPublicPlayers);
router.get('/players/:id', getPublicPlayerDetail);
router.get('/matches/:id', getPublicMatchDetail);

module.exports = router;
