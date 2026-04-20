import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import UiButton from './ui/UiButton';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getDisplayPosition = (profile) => (
  profile.playerDomain?.activeMembership?.primaryPosition
  || profile.preferredPosition
  || profile.position
  || 'N/A'
);

const getPlayerPhotoUrl = (profile) => {
  if (!profile?.photo) {
    return null;
  }

  return profile.photo.startsWith('http') ? profile.photo : `${API_URL}${profile.photo}`;
};

const ContractManagement = () => {
  const { token } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchContracts = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/profiles`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contracts');
      }

      const data = await response.json();
      const profilesWithContracts = (data.profiles || []).filter((profile) => (
        profile.contract?.contractEnd
      ));

      setContracts(profilesWithContracts);
      setError(null);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [token]);

  const calculateDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getWarningLevel = (daysRemaining) => {
    if (daysRemaining < 0) return 'expired';
    if (daysRemaining < 90) return 'critical';
    if (daysRemaining < 180) return 'warning';
    return 'normal';
  };

  const getContractProgress = (contract) => {
    if (!contract?.contractStart || !contract?.contractEnd) return 0;
    const start = new Date(contract.contractStart).getTime();
    const end = new Date(contract.contractEnd).getTime();
    const now = Date.now();

    if (end <= start) return 100;
    return Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
  };

  const contractsWithMeta = useMemo(() => (
    contracts.map((profile) => {
      const daysRemaining = calculateDaysRemaining(profile.contract.contractEnd);
      return {
        ...profile,
        daysRemaining,
        warningLevel: getWarningLevel(daysRemaining)
      };
    })
  ), [contracts]);

  const filteredContracts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return contractsWithMeta
      .filter((profile) => {
        const matchesSearch = !normalizedSearch || `${profile.fullName || ''} ${getDisplayPosition(profile)} ${profile.contract?.contractType || ''}`
          .toLowerCase()
          .includes(normalizedSearch);

        if (!matchesSearch) {
          return false;
        }

        if (statusFilter === 'all') return true;
        if (statusFilter === 'expired') return profile.warningLevel === 'expired';
        if (statusFilter === 'critical') return profile.warningLevel === 'critical';
        if (statusFilter === 'warning') return profile.warningLevel === 'warning';
        if (statusFilter === 'normal') return profile.warningLevel === 'normal';

        return true;
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [contractsWithMeta, searchTerm, statusFilter]);

  const summary = useMemo(() => ({
    total: contractsWithMeta.length,
    expiringSoon: contractsWithMeta.filter((profile) => profile.daysRemaining >= 0 && profile.daysRemaining < 90).length,
    expired: contractsWithMeta.filter((profile) => profile.daysRemaining < 0).length
  }), [contractsWithMeta]);

  const exportContractsCsv = () => {
    const header = ['Player', 'Position', 'Contract Type', 'Start Date', 'End Date', 'Days Remaining', 'Availability'];
    const rows = contractsWithMeta.map((profile) => ([
      profile.fullName || 'N/A',
      getDisplayPosition(profile),
      profile.contract.contractType || 'N/A',
      formatDate(profile.contract.contractStart),
      formatDate(profile.contract.contractEnd),
      profile.daysRemaining < 0 ? `${Math.abs(profile.daysRemaining)} days ago` : `${profile.daysRemaining} days`,
      profile.availabilityStatus || 'available'
    ]));

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'player-contracts.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-gray-800/40 p-4 shadow backdrop-blur-sm">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Contract Management</h2>
          <p className="mt-1 text-xs text-gray-400">Monitor player contracts and expiry dates</p>
        </div>

        <UiButton
          onClick={exportContractsCsv}
          disabled={contracts.length === 0}
          variant="secondary"
        >
          Export CSV
        </UiButton>
      </div>

      {loading && (
        <div className="py-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-red-600" />
          <p className="mt-2 text-gray-400">Loading contracts...</p>
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl border border-red-500/30 bg-red-900/40 p-3 text-red-200">{error}</div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-blue-500/30 bg-blue-900/35 p-4">
              <p className="text-sm font-medium text-blue-300">Total Contracts</p>
              <p className="text-2xl font-bold text-blue-100">{summary.total}</p>
            </div>
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-900/35 p-4">
              <p className="text-sm font-medium text-yellow-300">Expiring Soon (&lt;90 days)</p>
              <p className="text-2xl font-bold text-yellow-100">{summary.expiringSoon}</p>
            </div>
            <div className="rounded-xl border border-red-500/30 bg-red-900/35 p-4">
              <p className="text-sm font-medium text-red-300">Expired</p>
              <p className="text-2xl font-bold text-red-100">{summary.expired}</p>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="ui-field"
              placeholder="Search by player, position, or contract type"
            />

            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All' },
                { id: 'critical', label: 'Critical <90d' },
                { id: 'warning', label: 'Warning <180d' },
                { id: 'expired', label: 'Expired' },
                { id: 'normal', label: 'Active' }
              ].map((filter) => (
                <UiButton
                  key={filter.id}
                  onClick={() => setStatusFilter(filter.id)}
                  variant={statusFilter === filter.id ? 'primary' : 'secondary'}
                  size="sm"
                >
                  {filter.label}
                </UiButton>
              ))}
            </div>
          </div>

          {filteredContracts.length === 0 ? (
            <p className="py-8 text-center text-gray-500">No contracts match the selected filters.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
              {filteredContracts.map((profile) => {
                const photoUrl = getPlayerPhotoUrl(profile);

                return (
                  <div key={profile._id} className="rounded-2xl border border-white/10 bg-gray-800/20 p-4">
                    <div className="mb-3 flex items-center gap-3">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={profile.fullName}
                          className="h-12 w-12 rounded-full border border-white/20 object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-gray-700/40 text-sm font-semibold text-white">
                          {(profile.fullName || 'P').slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{profile.fullName || 'N/A'}</p>
                        <p className="text-xs text-gray-400">{getDisplayPosition(profile)}</p>
                      </div>
                    </div>

                    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full border border-white/15 bg-gray-700/30 px-2 py-1 text-gray-200">
                        {profile.contract.contractType || 'N/A'}
                      </span>

                      <span className={`rounded-full border px-2 py-1 ${
                        profile.warningLevel === 'expired' || profile.warningLevel === 'critical'
                          ? 'border-red-500/30 bg-red-900/35 text-red-200'
                          : profile.warningLevel === 'warning'
                            ? 'border-yellow-500/30 bg-yellow-900/35 text-yellow-200'
                            : 'border-green-500/30 bg-green-900/35 text-green-200'
                      }`}>
                        {profile.warningLevel === 'expired'
                          ? 'Expired'
                          : profile.warningLevel === 'critical'
                            ? 'Critical'
                            : profile.warningLevel === 'warning'
                              ? 'Warning'
                              : 'Active'}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-gray-300">
                      <p>Start: <span className="text-white">{formatDate(profile.contract.contractStart)}</span></p>
                      <p>End: <span className="text-white">{formatDate(profile.contract.contractEnd)}</span></p>
                      <p>
                        Remaining:
                        <span className={`ml-1 font-semibold ${
                          profile.warningLevel === 'expired' || profile.warningLevel === 'critical'
                            ? 'text-red-300'
                            : profile.warningLevel === 'warning'
                              ? 'text-yellow-300'
                              : 'text-green-300'
                        }`}>
                          {profile.daysRemaining < 0 ? `${Math.abs(profile.daysRemaining)} days ago` : `${profile.daysRemaining} days`}
                        </span>
                      </p>
                    </div>

                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full ${
                          profile.warningLevel === 'expired' || profile.warningLevel === 'critical'
                            ? 'bg-red-500'
                            : profile.warningLevel === 'warning'
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${getContractProgress(profile.contract)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContractManagement;
