const Sponsorship = require('../models/Sponsorship');
const Transaction = require('../models/Transaction');
const Profile = require('../models/Profile');
const Fixture = require('../models/Fixture');

const TRANSFER_BUDGET = Number(process.env.TRANSFER_BUDGET || 100000000);
const WAGE_BUDGET = Number(process.env.WAGE_BUDGET || 5000000);

const parsePagination = (req) => ({
  page: Math.max(Number(req.query.page || 1), 1),
  limit: Math.min(Math.max(Number(req.query.limit || 50), 1), 100)
});

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const clampMarketability = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 50;
  return Math.min(100, Math.max(1, numeric));
};

const calculateAnnualAmortization = (transferFee, contractLengthYears) => {
  const normalizedFee = Number(transferFee || 0);
  const normalizedYears = Number(contractLengthYears || 0);

  // Division by zero is guarded by returning 0 if contract years are invalid.
  if (normalizedYears <= 0) {
    return 0;
  }

  return normalizedFee / normalizedYears;
};

const buildAmortizationLedger = async () => {
  const players = await Profile.find({
    position: { $ne: 'Staff' },
    playerStatus: { $in: ['active', 'listed'] }
  }).select('fullName transferFee contractLengthYears');

  const ledger = players.map((player) => {
    const transferFee = Number(player.transferFee || 0);
    const contractLengthYears = Number(player.contractLengthYears || 0);
    const annualAmortization = calculateAnnualAmortization(transferFee, contractLengthYears);

    return {
      playerId: player._id,
      playerName: player.fullName,
      transferFee,
      contractLengthYears,
      annualAmortization
    };
  });

  const totalYearlyFfpHit = ledger.reduce((sum, row) => sum + row.annualAmortization, 0);
  return {
    ledger,
    totalYearlyFfpHit
  };
};

const getSponsorships = async (req, res) => {
  try {
    const sponsorships = await Sponsorship.find().sort({ expiryDate: 1 });
    res.status(200).json({ success: true, sponsorships });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch sponsorships', error: error.message });
  }
};

const createSponsorship = async (req, res) => {
  try {
    const sponsorship = await Sponsorship.create(req.body);
    res.status(201).json({ success: true, message: 'Sponsorship created successfully', sponsorship });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create sponsorship', error: error.message });
  }
};

const updateSponsorship = async (req, res) => {
  try {
    const sponsorship = await Sponsorship.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!sponsorship) {
      return res.status(404).json({ success: false, message: 'Sponsorship not found' });
    }

    res.status(200).json({ success: true, message: 'Sponsorship updated successfully', sponsorship });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update sponsorship', error: error.message });
  }
};

const deleteSponsorship = async (req, res) => {
  try {
    const sponsorship = await Sponsorship.findByIdAndDelete(req.params.id);

    if (!sponsorship) {
      return res.status(404).json({ success: false, message: 'Sponsorship not found' });
    }

    res.status(200).json({ success: true, message: 'Sponsorship deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete sponsorship', error: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const { page, limit } = parsePagination(req);
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      Transaction.find().sort({ date: -1, createdAt: -1 }).skip(skip).limit(limit),
      Transaction.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      transactions,
      pagination: {
        page,
        pages: Math.ceil(total / limit) || 1,
        total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch transactions', error: error.message });
  }
};

const createTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.create(req.body);
    res.status(201).json({ success: true, message: 'Transaction created successfully', transaction });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create transaction', error: error.message });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.status(200).json({ success: true, message: 'Transaction updated successfully', transaction });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update transaction', error: error.message });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.status(200).json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete transaction', error: error.message });
  }
};

const getAmortizationLedger = async (req, res) => {
  try {
    const { ledger, totalYearlyFfpHit } = await buildAmortizationLedger();

    res.status(200).json({
      success: true,
      ledger,
      totalYearlyFfpHit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch amortization ledger',
      error: error.message
    });
  }
};

const getCommercialInsights = async (req, res) => {
  try {
    const players = await Profile.find({
      position: { $ne: 'Staff' },
      playerStatus: { $in: ['active', 'listed'] }
    }).select('fullName marketabilityScore');

    const rankedPlayers = players
      .map((player) => {
        const marketabilityScore = clampMarketability(player.marketabilityScore);
        return {
          playerId: player._id,
          playerName: player.fullName,
          marketabilityScore,
          shirtSales: Math.round(marketabilityScore * 300)
        };
      })
      .sort((a, b) => b.shirtSales - a.shirtSales);

    res.status(200).json({
      success: true,
      topPlayersByShirtSales: rankedPlayers.slice(0, 5),
      playersCount: rankedPlayers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch commercial insights',
      error: error.message
    });
  }
};

const simulateMerchandiseSales = async (req, res) => {
  try {
    const players = await Profile.find({
      position: { $ne: 'Staff' },
      playerStatus: { $in: ['active', 'listed'] }
    }).select('fullName marketabilityScore');

    if (players.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active players available for merchandising simulation'
      });
    }

    const revenueByPlayer = players.map((player) => {
      const marketabilityScore = clampMarketability(player.marketabilityScore);
      const multiplier = randomInt(100, 500);
      const revenue = marketabilityScore * multiplier;

      return {
        playerId: player._id,
        playerName: player.fullName,
        marketabilityScore,
        multiplier,
        revenue
      };
    });

    const totalRevenue = revenueByPlayer.reduce((sum, row) => sum + row.revenue, 0);

    const transaction = await Transaction.create({
      type: 'Income',
      category: 'Merchandising',
      amount: totalRevenue,
      date: new Date(),
      description: 'Monthly shirt sales simulation'
    });

    res.status(201).json({
      success: true,
      message: 'Monthly merchandise sales simulated successfully',
      totalRevenue,
      transaction,
      topPlayersByShirtSales: revenueByPlayer.sort((a, b) => b.revenue - a.revenue).slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to simulate merchandise sales',
      error: error.message
    });
  }
};

const simulateMatchdayRevenue = async (req, res) => {
  try {
    const {
      fixtureId,
      totalRevenue,
      attendance,
      generalAdmissionPrice,
      vipHospitalityPrice
    } = req.body;

    if (!fixtureId) {
      return res.status(400).json({
        success: false,
        message: 'fixtureId is required'
      });
    }

    const numericRevenue = Number(totalRevenue || 0);
    if (numericRevenue <= 0) {
      return res.status(400).json({
        success: false,
        message: 'totalRevenue must be greater than zero'
      });
    }

    const fixture = await Fixture.findById(fixtureId);
    if (!fixture) {
      return res.status(404).json({
        success: false,
        message: 'Fixture not found'
      });
    }

    if (fixture.matchdaySimulated) {
      return res.status(409).json({
        success: false,
        message: 'This fixture has already been simulated'
      });
    }

    if (new Date(fixture.date) > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Matchday simulation is only available for past fixtures'
      });
    }

    const transaction = await Transaction.create({
      type: 'Income',
      category: 'Matchday',
      amount: numericRevenue,
      date: new Date(),
      description: `Match vs ${fixture.opponent}`
    });

    fixture.matchdaySimulated = true;
    fixture.matchdayRevenue = numericRevenue;
    fixture.matchdayAttendance = Math.max(Number(attendance || 0), 0);
    fixture.status = 'completed';

    if (generalAdmissionPrice !== undefined) {
      fixture.ticketPricing.generalAdmission = Math.max(Number(generalAdmissionPrice || 0), 0);
    }

    if (vipHospitalityPrice !== undefined) {
      fixture.ticketPricing.vipHospitality = Math.max(Number(vipHospitalityPrice || 0), 0);
    }

    await fixture.save();

    res.status(201).json({
      success: true,
      message: 'Matchday revenue simulated successfully',
      transaction,
      fixture: {
        id: fixture._id,
        opponent: fixture.opponent,
        date: fixture.date,
        matchdaySimulated: fixture.matchdaySimulated,
        matchdayRevenue: fixture.matchdayRevenue,
        matchdayAttendance: fixture.matchdayAttendance
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to simulate matchday revenue',
      error: error.message
    });
  }
};

const getFinanceSummary = async (req, res) => {
  try {
    const [totals, wageRows, transferSpendRows, amortization] = await Promise.all([
      Transaction.aggregate([
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' }
          }
        }
      ]),
      Profile.aggregate([
        {
          $match: {
            position: { $ne: 'Staff' },
            playerStatus: { $in: ['active', 'listed'] }
          }
        },
        {
          $group: {
            _id: null,
            wageBill: {
              $sum: {
                $ifNull: [
                  '$weeklySalary',
                  {
                    $ifNull: [
                      '$salary',
                      {
                        $ifNull: ['$contract.salary', 0]
                      }
                    ]
                  }
                ]
              }
            }
          }
        }
      ]),
      Transaction.aggregate([
        { $match: { type: 'Expense', category: 'Transfer' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      buildAmortizationLedger()
    ]);

    const totalIncome = totals.find((row) => row._id === 'Income')?.total || 0;
    const totalExpenses = totals.find((row) => row._id === 'Expense')?.total || 0;
    const currentWageBill = wageRows[0]?.wageBill || 0;
    const transferSpend = transferSpendRows[0]?.total || 0;
    const amortizationExpenseTotal = amortization.totalYearlyFfpHit;
    const profitLoss = totalIncome - totalExpenses;
    const ffpHealth = profitLoss - amortizationExpenseTotal;

    res.status(200).json({
      success: true,
      summary: {
        totalIncome,
        totalExpenses,
        profitLoss,
        ffpHealth,
        amortizationExpenseTotal,
        currentWageBill,
        transferSpend,
        transferBudget: TRANSFER_BUDGET,
        wageBudget: WAGE_BUDGET
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch finance summary', error: error.message });
  }
};

module.exports = {
  getSponsorships,
  createSponsorship,
  updateSponsorship,
  deleteSponsorship,
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getAmortizationLedger,
  getCommercialInsights,
  simulateMerchandiseSales,
  simulateMatchdayRevenue,
  getFinanceSummary
};
