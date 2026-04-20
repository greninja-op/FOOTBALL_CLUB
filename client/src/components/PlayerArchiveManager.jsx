import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PlayerArchiveManager = () => {
  const [archivedPlayers, setArchivedPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [selectedArchive, setSelectedArchive] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const headers = {
        Authorization: `Bearer ${token}`
      };

      const archiveResponse = await fetch(`${API_URL}/api/player-domain/archive`, { headers });

      if (!archiveResponse.ok) {
        throw new Error('Failed to fetch player archive data');
      }

      const archiveData = await archiveResponse.json();

      setArchivedPlayers(archiveData.archivedPlayers || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch player archive data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleReinstate = async (payload) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/player-domain/archive/${payload.archiveId}/reinstate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jerseyNumber: payload.jerseyNumber ? Number(payload.jerseyNumber) : null,
          primaryPosition: payload.primaryPosition,
          contractType: payload.contractType,
          userId: payload.userId || null
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reinstate player');
      }

      setSelectedArchive(null);
      showToast('Player reinstated successfully');
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredArchivedPlayers = archivedPlayers.filter((entry) =>
    entry.fullName?.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  if (loading) {
    return <div className="p-4 text-center text-white">Loading player archive manager...</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Player Archive Manager</h2>
          <p className="mt-0.5 text-xs text-gray-300">
            Search archived departures and reinstate returning players.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="rounded bg-red-600 px-3 py-1.5 text-sm text-white transition hover:bg-red-700"
        >
          Refresh
        </button>
      </div>

      {toast && (
        <div className={`mb-4 rounded p-4 backdrop-blur-sm ${toast.type === 'error' ? 'bg-red-900/40 text-red-200 border border-red-500/30' : 'bg-green-900/40 text-green-200 border border-green-500/30'}`}>
          {toast.message}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded border border-red-500/30 bg-red-900/40 px-4 py-3 text-red-200">
          {error}
        </div>
      )}

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">Archived Players</h3>
            <span className="text-sm text-gray-400">{filteredArchivedPlayers.length} archived shown</span>
          </div>
          <div className="min-w-[240px]">
            <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/40">Search player</label>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="ui-field"
              placeholder="Type a player name"
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {filteredArchivedPlayers.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/20 bg-gray-800/20 p-8 text-center text-gray-400">
              No archived players match your search.
            </div>
          ) : (
            filteredArchivedPlayers.map((entry) => (
              <div key={entry.id} className="rounded-lg border border-white/10 bg-gray-800/40 backdrop-blur-sm p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-white">{entry.fullName}</h4>
                    <p className="text-sm text-gray-400">
                      Archived on {new Date(entry.archivedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="rounded-full bg-gray-700/40 px-2 py-1 text-xs font-semibold text-gray-300 border border-white/10">
                    {entry.reason}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-300">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-gray-500">Goals</div>
                    <div className="font-semibold">{entry.summary?.totalGoals || 0}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-gray-500">Assists</div>
                    <div className="font-semibold">{entry.summary?.totalAssists || 0}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-gray-500">Appearances</div>
                    <div className="font-semibold">{entry.summary?.totalAppearances || 0}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-gray-500">Seasons</div>
                    <div className="font-semibold">{entry.summary?.seasonsPlayed || 0}</div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedArchive(entry)}
                  className="mt-4 rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Reinstate
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {selectedArchive && (
        <ReinstateModal
          archiveEntry={selectedArchive}
          onClose={() => setSelectedArchive(null)}
          onSubmit={handleReinstate}
        />
      )}
    </div>
  );
};

const ReinstateModal = ({ archiveEntry, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    jerseyNumber: archiveEntry.snapshot?.jerseyNumber || '',
    primaryPosition: archiveEntry.snapshot?.primaryPosition || 'CM',
    contractType: archiveEntry.snapshot?.contractType || 'Owned',
    userId: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    await onSubmit({
      archiveId: archiveEntry.id,
      ...formData
    });
    setSubmitting(false);
  };

  return (
    <ModalShell title={`Reinstate ${archiveEntry.fullName}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Jersey Number</label>
            <input
              type="number"
              min="1"
              max="99"
              value={formData.jerseyNumber}
              onChange={(event) => setFormData((current) => ({ ...current, jerseyNumber: event.target.value }))}
              className="ui-field"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Primary Position</label>
            <input
              type="text"
              value={formData.primaryPosition}
              onChange={(event) => setFormData((current) => ({ ...current, primaryPosition: event.target.value.toUpperCase() }))}
              className="ui-field"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Contract Type</label>
          <select
            value={formData.contractType}
            onChange={(event) => setFormData((current) => ({ ...current, contractType: event.target.value }))}
            className="ui-select"
          >
            <option value="Owned">Owned</option>
            <option value="On Loan">On Loan</option>
            <option value="Academy">Academy</option>
            <option value="Trial">Trial</option>
            <option value="Staff">Staff</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Optional Linked User ID</label>
          <input
            type="text"
            value={formData.userId}
            onChange={(event) => setFormData((current) => ({ ...current, userId: event.target.value }))}
            className="ui-field"
            placeholder="Leave empty if the player has no login yet"
          />
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded border border-white/20 px-4 py-2 text-gray-300 hover:bg-gray-700/40">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="rounded bg-red-600 px-4 py-2 text-white disabled:opacity-50 hover:bg-red-700">
            {submitting ? 'Reinstating...' : 'Reinstate Player'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

const ModalShell = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
    <div className="w-full max-w-lg rounded-lg border border-white/10 bg-gray-950 p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <button onClick={onClose} className="text-gray-400 transition hover:text-white">
          X
        </button>
      </div>
      {children}
    </div>
  </div>
);

export default PlayerArchiveManager;
