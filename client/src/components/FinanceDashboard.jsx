import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { downloadCsv, transactionsToCsv } from '../utils/financeCsv';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const initialDeal = {
  brandName: '',
  type: 'Shirt',
  annualValue: '',
  expiryDate: ''
};

const initialTransaction = {
  type: 'Expense',
  category: 'Operations',
  amount: '',
  date: new Date().toISOString().slice(0, 10),
  description: ''
};

const initialTicketPricing = {
  generalAdmission: 40,
  vipHospitality: 220
};

const chartBarColors = ['#c8102e', '#d43d53', '#e06174', '#ec8998', '#f8b4bd'];

const tabLabels = {
  overview: 'Overview',
  sponsorships: 'Sponsorships',
  ledger: 'Ledger',
  amortization: 'Amortization Ledger',
  commercial: 'Commercial Revenue',
  stadium: 'Stadium Operations'
};

const formatCurrency = (amount) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
}).format(Number(amount || 0));

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const percentOf = (value, max) => {
  if (!max) return 0;
  return Math.min(Math.round((Number(value || 0) / Number(max)) * 100), 999);
};

const barTone = (value) => {
  if (value >= 100) return 'bg-red-500';
  if (value >= 85) return 'bg-yellow-400';
  return 'bg-emerald-400';
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const inferOpponentRank = (fixture) => {
  const explicitRank = Number(fixture?.opponentRank);
  if (Number.isFinite(explicitRank) && explicitRank >= 1 && explicitRank <= 20) {
    return explicitRank;
  }

  const opponentName = String(fixture?.opponent || '').toLowerCase();
  const eliteKeywords = ['city', 'madrid', 'barcelona', 'bayern', 'liverpool', 'arsenal'];
  const strongKeywords = ['united', 'milan', 'inter', 'juventus', 'chelsea', 'psg', 'tottenham'];

  if (eliteKeywords.some((token) => opponentName.includes(token))) {
    return 3;
  }

  if (strongKeywords.some((token) => opponentName.includes(token))) {
    return 7;
  }

  return 14;
};

const calculateMatchdayProjection = (fixture, pricing) => {
  const rank = inferOpponentRank(fixture);
  const normalizedRankPressure = (20 - rank) / 19;

  const baseline = 30000 + Math.round(normalizedRankPressure * 18000);
  const noise = Math.floor(Math.random() * 4001) - 2000;
  const attendance = clamp(baseline + noise, 30000, 50000);

  const vipAttendance = 1200;
  const generalAttendance = Math.max(attendance - vipAttendance, 0);

  const generalPrice = Math.max(Number(pricing.generalAdmission || 0), 0);
  const vipPrice = Math.max(Number(pricing.vipHospitality || 0), 0);

  const totalRevenue = (generalAttendance * generalPrice) + (vipAttendance * vipPrice);

  return {
    attendance,
    vipAttendance,
    generalAttendance,
    totalRevenue,
    rank
  };
};

const FinanceDashboard = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [summary, setSummary] = useState(null);
  const [sponsorships, setSponsorships] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [amortizationLedger, setAmortizationLedger] = useState([]);
  const [amortizationTotal, setAmortizationTotal] = useState(0);
  const [commercialData, setCommercialData] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [ticketPricing, setTicketPricing] = useState(initialTicketPricing);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [showDealModal, setShowDealModal] = useState(false);
  const [dealForm, setDealForm] = useState(initialDeal);
  const [transactionForm, setTransactionForm] = useState(initialTransaction);
  const [submitting, setSubmitting] = useState(false);
  const [simulatingMerch, setSimulatingMerch] = useState(false);
  const [simulatingFixtureId, setSimulatingFixtureId] = useState('');

  const authHeaders = useMemo(() => ({
    Authorization: `Bearer ${token}`
  }), [token]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  };

  const fetchSummary = async () => {
    const response = await fetch(`${API_URL}/api/finance/summary`, { headers: authHeaders });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to load finance summary');
    setSummary(data.summary);
  };

  const fetchSponsorships = async () => {
    const response = await fetch(`${API_URL}/api/finance/sponsorships`, { headers: authHeaders });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to load sponsorships');
    setSponsorships(data.sponsorships || []);
  };

  const fetchTransactions = async () => {
    const response = await fetch(`${API_URL}/api/finance/transactions?limit=200`, { headers: authHeaders });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to load transactions');
    setTransactions(data.transactions || []);
  };

  const fetchAmortizationLedger = async () => {
    const response = await fetch(`${API_URL}/api/finance/amortization-ledger`, { headers: authHeaders });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to load amortization ledger');

    setAmortizationLedger(data.ledger || []);
    setAmortizationTotal(Number(data.totalYearlyFfpHit || 0));
  };

  const fetchCommercialInsights = async () => {
    const response = await fetch(`${API_URL}/api/finance/commercial-insights`, { headers: authHeaders });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to load commercial insights');

    setCommercialData((data.topPlayersByShirtSales || []).map((player) => ({
      playerName: player.playerName,
      shirtSales: Number(player.shirtSales || player.revenue || 0),
      marketabilityScore: Number(player.marketabilityScore || 50)
    })));
  };

  const fetchFixtures = async () => {
    const response = await fetch(`${API_URL}/api/fixtures?limit=200`, { headers: authHeaders });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to load fixtures');
    setFixtures(data.fixtures || []);
  };

  const refreshFinance = async () => {
    await Promise.all([
      fetchSummary(),
      fetchSponsorships(),
      fetchTransactions(),
      fetchAmortizationLedger(),
      fetchCommercialInsights(),
      fetchFixtures()
    ]);
  };

  useEffect(() => {
    const loadFinance = async () => {
      try {
        setLoading(true);
        await refreshFinance();
        setError('');
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadFinance();
    }
  }, [token]);

  const handleDealSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/finance/sponsorships`, {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...dealForm,
          annualValue: Number(dealForm.annualValue)
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create sponsorship');

      setDealForm(initialDeal);
      setShowDealModal(false);
      await refreshFinance();
      showToast('Sponsorship deal added');
    } catch (submitError) {
      showToast(submitError.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransactionSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/finance/transactions`, {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...transactionForm,
          amount: Number(transactionForm.amount)
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create transaction');

      setTransactionForm(initialTransaction);
      await refreshFinance();
      setActiveTab('overview');
      showToast('Ledger entry saved and command center refreshed');
    } catch (submitError) {
      showToast(submitError.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCsv = () => {
    if (!transactions.length) {
      showToast('No ledger rows to export yet', 'error');
      return;
    }

    const csv = transactionsToCsv(transactions);
    downloadCsv(csv, 'club_financial_ledger.csv');
    showToast('Ledger exported to CSV');
  };

  const handleSimulateMerch = async () => {
    setSimulatingMerch(true);

    try {
      const response = await fetch(`${API_URL}/api/finance/simulate-merch`, {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to simulate monthly sales');

      const simulatedTop = (data.topPlayersByShirtSales || []).map((entry) => ({
        playerName: entry.playerName,
        shirtSales: Number(entry.revenue || entry.shirtSales || 0),
        marketabilityScore: Number(entry.marketabilityScore || 50)
      }));

      if (simulatedTop.length > 0) {
        setCommercialData(simulatedTop);
      }

      await Promise.all([fetchSummary(), fetchTransactions(), fetchCommercialInsights()]);
      showToast(`Simulated shirt sales: ${formatCurrency(data.totalRevenue)}`);
    } catch (simulationError) {
      showToast(simulationError.message, 'error');
    } finally {
      setSimulatingMerch(false);
    }
  };

  const handleTicketPriceChange = (field, value) => {
    setTicketPricing((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleSimulateMatchday = async (fixture) => {
    setSimulatingFixtureId(fixture.id || fixture._id);

    try {
      const projection = calculateMatchdayProjection(fixture, ticketPricing);

      const response = await fetch(`${API_URL}/api/finance/simulate-matchday`, {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fixtureId: fixture.id || fixture._id,
          totalRevenue: projection.totalRevenue,
          attendance: projection.attendance,
          generalAdmissionPrice: Number(ticketPricing.generalAdmission || 0),
          vipHospitalityPrice: Number(ticketPricing.vipHospitality || 0)
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to simulate matchday revenue');

      await Promise.all([fetchSummary(), fetchTransactions(), fetchFixtures()]);
      showToast(`Matchday revenue logged: ${formatCurrency(projection.totalRevenue)}`);
    } catch (simulationError) {
      showToast(simulationError.message, 'error');
    } finally {
      setSimulatingFixtureId('');
    }
  };

  const transferUsage = percentOf(summary?.transferSpend, summary?.transferBudget);
  const wageUsage = percentOf(summary?.currentWageBill, summary?.wageBudget);
  const ffpHealth = Number(summary?.ffpHealth ?? summary?.profitLoss ?? 0);
  const ffpPositive = ffpHealth >= 0;
  const sponsorshipTotal = sponsorships.reduce((sum, deal) => sum + Number(deal.annualValue || 0), 0);

  const completedFixtures = useMemo(() => (
    fixtures
      .filter((fixture) => new Date(fixture.date) < new Date())
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  ), [fixtures]);

  return (
    <div className="p-4">
      {toast && (
        <div className={`mb-4 rounded-lg border px-4 py-3 ${
          toast.type === 'error'
            ? 'border-red-500/30 bg-red-900/40 text-red-200'
            : 'border-emerald-500/30 bg-emerald-900/30 text-emerald-200'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/45">Manager Financial Suite</p>
          <h2 className="mt-1 text-2xl font-bold text-white">FFP Command Center</h2>
          <p className="mt-1 text-sm text-gray-400">Track compliance, amortization, merchandising, ticketing, and ledger operations.</p>
        </div>
        <div className="flex flex-wrap rounded-lg border border-white/10 bg-gray-950/30 p-1">
          {Object.entries(tabLabels).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-3 py-2 text-sm transition ${
                activeTab === tab ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-gray-300">Loading financial data...</div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-900/40 p-4 text-red-200">{error}</div>
      ) : (
        <>
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <section className="rounded-lg border border-white/10 bg-gray-900/50 p-5 shadow-[0_0_40px_rgba(200,16,46,0.12)]">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-white/45">FFP Health Meter</p>
                    <h3 className={`mt-2 text-4xl font-black ${ffpPositive ? 'text-emerald-300' : 'text-red-300'}`}>
                      {formatCurrency(ffpHealth)}
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">
                      Includes annual amortization hit of {formatCurrency(summary?.amortizationExpenseTotal || 0)}
                    </p>
                  </div>
                  <div className={`flex h-28 w-28 items-center justify-center rounded-full border-8 text-center text-xs font-bold uppercase tracking-[0.2em] text-white ${
                    ffpPositive ? 'border-emerald-400/70 bg-emerald-900/20' : 'border-red-500/70 bg-red-900/30'
                  }`}>
                    {ffpPositive ? 'Healthy' : 'Risk'}
                  </div>
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-5">
                <MetricCard label="Total Income" value={formatCurrency(summary?.totalIncome)} tone="text-emerald-200" />
                <MetricCard label="Total Expenses" value={formatCurrency(summary?.totalExpenses)} tone="text-red-200" />
                <MetricCard label="Wage Bill" value={formatCurrency(summary?.currentWageBill)} tone="text-yellow-200" />
                <MetricCard label="Annual Sponsors" value={formatCurrency(sponsorshipTotal)} tone="text-blue-200" />
                <MetricCard label="Amortization Hit" value={formatCurrency(summary?.amortizationExpenseTotal || amortizationTotal)} tone="text-orange-200" />
              </section>

              <section className="rounded-lg border border-white/10 bg-gray-800/30 p-5">
                <h3 className="text-lg font-semibold text-white">Budget Progress</h3>
                <div className="mt-4 space-y-5">
                  <BudgetBar
                    label="Transfer Budget Usage"
                    value={summary?.transferSpend}
                    max={summary?.transferBudget}
                    percent={transferUsage}
                  />
                  <BudgetBar
                    label="Wage Budget Usage"
                    value={summary?.currentWageBill}
                    max={summary?.wageBudget}
                    percent={wageUsage}
                  />
                </div>
              </section>
            </div>
          )}

          {activeTab === 'sponsorships' && (
            <section>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-white">Sponsorships</h3>
                <button
                  onClick={() => setShowDealModal(true)}
                  className="rounded-lg border border-red-500/30 bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  New Deal
                </button>
              </div>
              {sponsorships.length === 0 ? (
                <div className="rounded-lg border border-dashed border-white/20 bg-gray-800/20 p-8 text-center text-gray-400">
                  No active brand deals yet.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {sponsorships.map((deal) => (
                    <article key={deal._id} className="rounded-lg border border-white/10 bg-gray-800/40 p-5 transition hover:border-red-500/30 hover:bg-gray-800/60">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-lg font-bold text-white">{deal.brandName}</h4>
                          <p className="mt-1 text-sm text-gray-400">{deal.type} partner</p>
                        </div>
                        <span className="rounded-full border border-emerald-500/30 bg-emerald-900/30 px-3 py-1 text-xs font-semibold text-emerald-200">
                          Active
                        </span>
                      </div>
                      <div className="mt-5 text-2xl font-black text-white">{formatCurrency(deal.annualValue)}</div>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/45">Expires {formatDate(deal.expiryDate)}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'ledger' && (
            <section className="space-y-5">
              <form onSubmit={handleTransactionSubmit} className="rounded-lg border border-white/10 bg-gray-800/30 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-white">Quick Ledger Entry</h3>
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    disabled={transactions.length === 0}
                    className="rounded-lg border border-blue-500/30 bg-blue-700/40 px-4 py-2 text-sm font-semibold text-blue-100 transition hover:bg-blue-700/60 disabled:opacity-50"
                  >
                    Export to CSV
                  </button>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-5">
                  <select
                    value={transactionForm.type}
                    onChange={(event) => setTransactionForm((current) => ({ ...current, type: event.target.value }))}
                    className="ui-select"
                  >
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                  <select
                    value={transactionForm.category}
                    onChange={(event) => setTransactionForm((current) => ({ ...current, category: event.target.value }))}
                    className="ui-select"
                  >
                    <option value="Matchday">Matchday</option>
                    <option value="Transfer">Transfer</option>
                    <option value="Wages">Wages</option>
                    <option value="Operations">Operations</option>
                    <option value="Sponsorship">Sponsorship</option>
                    <option value="Merchandising">Merchandising</option>
                    <option value="Travel">Travel</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Prize Money">Prize Money</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    value={transactionForm.amount}
                    onChange={(event) => setTransactionForm((current) => ({ ...current, amount: event.target.value }))}
                    className="ui-field"
                    placeholder="Amount"
                    required
                  />
                  <input
                    type="date"
                    value={transactionForm.date}
                    onChange={(event) => setTransactionForm((current) => ({ ...current, date: event.target.value }))}
                    className="ui-field"
                    required
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                  >
                    Log Entry
                  </button>
                </div>
                <input
                  type="text"
                  value={transactionForm.description}
                  onChange={(event) => setTransactionForm((current) => ({ ...current, description: event.target.value }))}
                  className="ui-field mt-3"
                  placeholder="Description"
                  required
                />
              </form>

              <div className="overflow-x-auto rounded-lg border border-white/10 bg-gray-800/30">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-950/40 text-left text-xs uppercase tracking-[0.2em] text-gray-400">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {transactions.map((transaction) => (
                      <tr key={transaction._id} className="hover:bg-white/5">
                        <td className="whitespace-nowrap px-4 py-3 text-gray-300">{formatDate(transaction.date)}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${
                            transaction.type === 'Income'
                              ? 'border-emerald-500/30 bg-emerald-900/30 text-emerald-200'
                              : 'border-red-500/30 bg-red-900/30 text-red-200'
                          }`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-300">{transaction.category}</td>
                        <td className="px-4 py-3 text-white">{transaction.description}</td>
                        <td className={`whitespace-nowrap px-4 py-3 text-right font-semibold ${
                          transaction.type === 'Income' ? 'text-emerald-300' : 'text-red-300'
                        }`}>
                          {formatCurrency(transaction.amount)}
                        </td>
                      </tr>
                    ))}
                    {transactions.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-gray-400">No transactions logged yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'amortization' && (
            <section className="space-y-4">
              <div className="rounded-lg border border-white/10 bg-gray-800/30 p-4">
                <h3 className="text-lg font-semibold text-white">Squad Amortization Ledger</h3>
                <p className="mt-1 text-sm text-gray-400">Yearly FFP hit from transfer fees distributed across active contracts.</p>
                <p className="mt-3 text-sm uppercase tracking-[0.2em] text-white/45">
                  Total Yearly FFP Hit: <span className="font-bold text-orange-300">{formatCurrency(amortizationTotal)}</span>
                </p>
              </div>

              <div className="overflow-x-auto rounded-lg border border-white/10 bg-gray-800/30">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-950/40 text-left text-xs uppercase tracking-[0.2em] text-gray-400">
                    <tr>
                      <th className="px-4 py-3">Player</th>
                      <th className="px-4 py-3">Total Fee</th>
                      <th className="px-4 py-3">Contract Length (Years)</th>
                      <th className="px-4 py-3 text-right">Yearly FFP Hit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {amortizationLedger.map((entry) => (
                      <tr key={entry.playerId} className="hover:bg-white/5">
                        <td className="px-4 py-3 text-white">{entry.playerName}</td>
                        <td className="px-4 py-3 text-gray-300">{formatCurrency(entry.transferFee)}</td>
                        <td className="px-4 py-3 text-gray-300">{entry.contractLengthYears}</td>
                        <td className="px-4 py-3 text-right font-semibold text-orange-200">{formatCurrency(entry.annualAmortization)}</td>
                      </tr>
                    ))}
                    {amortizationLedger.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-4 py-8 text-center text-gray-400">
                          No active player transfer records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'commercial' && (
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-gray-800/30 p-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Commercial Revenue</h3>
                  <p className="mt-1 text-sm text-gray-400">Top 5 players by shirt sales potential and monthly merch simulation.</p>
                </div>
                <button
                  onClick={handleSimulateMerch}
                  disabled={simulatingMerch}
                  className="rounded-lg border border-emerald-500/30 bg-emerald-700/40 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-700/60 disabled:opacity-50"
                >
                  {simulatingMerch ? 'Simulating...' : 'Simulate Monthly Sales'}
                </button>
              </div>

              <div className="rounded-lg border border-white/10 bg-gray-800/30 p-4">
                {commercialData.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">No players available for commercial ranking.</div>
                ) : (
                  <div className="h-[340px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={commercialData} margin={{ top: 20, right: 20, left: 0, bottom: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis
                          dataKey="playerName"
                          tick={{ fill: '#d1d5db', fontSize: 12 }}
                          angle={-18}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis tick={{ fill: '#d1d5db', fontSize: 12 }} tickFormatter={(value) => `$${Math.round(value / 1000)}k`} />
                        <Tooltip
                          formatter={(value) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: 'rgba(12, 12, 22, 0.95)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: 12,
                            color: '#fff'
                          }}
                        />
                        <Bar dataKey="shirtSales" radius={[8, 8, 0, 0]}>
                          {commercialData.map((entry, index) => (
                            <Cell key={`${entry.playerName}-${index}`} fill={chartBarColors[index % chartBarColors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === 'stadium' && (
            <section className="space-y-4">
              <div className="rounded-lg border border-white/10 bg-gray-800/30 p-4">
                <h3 className="text-lg font-semibold text-white">Stadium Operations</h3>
                <p className="mt-1 text-sm text-gray-400">Set ticket prices and simulate matchday revenue for completed fixtures.</p>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-gray-300">General Admission Price</label>
                    <input
                      type="number"
                      min="0"
                      className="ui-field"
                      value={ticketPricing.generalAdmission}
                      onChange={(event) => handleTicketPriceChange('generalAdmission', event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-gray-300">VIP Hospitality Price</label>
                    <input
                      type="number"
                      min="0"
                      className="ui-field"
                      value={ticketPricing.vipHospitality}
                      onChange={(event) => handleTicketPriceChange('vipHospitality', event.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-gray-800/30 p-4">
                <h4 className="text-base font-semibold text-white">Completed Fixtures</h4>
                {completedFixtures.length === 0 ? (
                  <div className="mt-4 rounded-lg border border-dashed border-white/15 bg-gray-900/30 p-6 text-center text-gray-400">
                    No completed fixtures available yet.
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {completedFixtures.map((fixture) => {
                      const fixtureId = fixture.id || fixture._id;
                      const alreadySimulated = Boolean(fixture.matchdaySimulated);
                      const isRunning = simulatingFixtureId === fixtureId;

                      return (
                        <div key={fixtureId} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-gray-900/30 p-3">
                          <div>
                            <p className="font-semibold text-white">{formatDate(fixture.date)} - vs {fixture.opponent}</p>
                            <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                              {fixture.matchType} {fixture.status ? `• ${fixture.status}` : ''}
                            </p>
                            {alreadySimulated && (
                              <p className="mt-1 text-sm text-emerald-300">
                                Simulated Revenue: {formatCurrency(fixture.matchdayRevenue)}
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => handleSimulateMatchday(fixture)}
                            disabled={alreadySimulated || Boolean(isRunning)}
                            className="rounded-lg border border-orange-500/30 bg-orange-700/40 px-4 py-2 text-sm font-semibold text-orange-100 transition hover:bg-orange-700/60 disabled:opacity-50"
                          >
                            {alreadySimulated
                              ? 'Already Simulated'
                              : isRunning
                                ? 'Simulating...'
                                : 'Simulate Matchday Revenue'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          )}
        </>
      )}

      {showDealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <form onSubmit={handleDealSubmit} className="w-full max-w-lg rounded-lg border border-white/10 bg-gray-950 p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">New Sponsorship Deal</h3>
              <button type="button" onClick={() => setShowDealModal(false)} className="text-gray-400 hover:text-white">X</button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={dealForm.brandName}
                onChange={(event) => setDealForm((current) => ({ ...current, brandName: event.target.value }))}
                className="ui-field"
                placeholder="Brand name"
                required
              />
              <select
                value={dealForm.type}
                onChange={(event) => setDealForm((current) => ({ ...current, type: event.target.value }))}
                className="ui-select"
              >
                <option value="Shirt">Shirt</option>
                <option value="Sleeve">Sleeve</option>
                <option value="Stadium">Stadium</option>
                <option value="Training Wear">Training Wear</option>
                <option value="Kit">Kit</option>
              </select>
              <input
                type="number"
                min="0"
                value={dealForm.annualValue}
                onChange={(event) => setDealForm((current) => ({ ...current, annualValue: event.target.value }))}
                className="ui-field"
                placeholder="Annual value"
                required
              />
              <input
                type="date"
                value={dealForm.expiryDate}
                onChange={(event) => setDealForm((current) => ({ ...current, expiryDate: event.target.value }))}
                className="ui-field"
                required
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowDealModal(false)} className="rounded-lg border border-white/15 px-4 py-2 text-gray-300 hover:bg-white/10">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                {submitting ? 'Saving...' : 'Save Deal'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ label, value, tone }) => (
  <div className="rounded-lg border border-white/10 bg-gray-800/30 p-4">
    <p className="text-xs uppercase tracking-[0.25em] text-white/45">{label}</p>
    <p className={`mt-2 text-2xl font-black ${tone}`}>{value}</p>
  </div>
);

const BudgetBar = ({ label, value, max, percent }) => (
  <div>
    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
      <span className="font-semibold text-white">{label}</span>
      <span className="text-gray-400">{formatCurrency(value)} / {formatCurrency(max)} ({percent}%)</span>
    </div>
    <div className="h-3 overflow-hidden rounded-full bg-gray-950/70">
      <div className={`h-full rounded-full ${barTone(percent)} transition-all`} style={{ width: `${Math.min(percent, 100)}%` }} />
    </div>
  </div>
);

export default FinanceDashboard;
