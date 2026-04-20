const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleGuard');
const loggerMiddleware = require('../middleware/loggerMiddleware');
const financeController = require('../controllers/financeController');

router.use(authMiddleware);
router.use(requireRole(['admin', 'manager']));

router.get('/summary', financeController.getFinanceSummary);
router.get('/amortization-ledger', financeController.getAmortizationLedger);
router.get('/commercial-insights', financeController.getCommercialInsights);
router.post('/simulate-merch', loggerMiddleware, financeController.simulateMerchandiseSales);
router.post('/simulate-matchday', loggerMiddleware, financeController.simulateMatchdayRevenue);

router.get('/sponsorships', financeController.getSponsorships);
router.post('/sponsorships', loggerMiddleware, financeController.createSponsorship);
router.put('/sponsorships/:id', loggerMiddleware, financeController.updateSponsorship);
router.delete('/sponsorships/:id', loggerMiddleware, financeController.deleteSponsorship);

router.get('/transactions', financeController.getTransactions);
router.post('/transactions', loggerMiddleware, financeController.createTransaction);
router.put('/transactions/:id', loggerMiddleware, financeController.updateTransaction);
router.delete('/transactions/:id', loggerMiddleware, financeController.deleteTransaction);

module.exports = router;
