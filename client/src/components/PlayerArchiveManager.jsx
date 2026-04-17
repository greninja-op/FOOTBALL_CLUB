import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PlayerArchiveManager = () => {
  const [records, setRecords] = useState([]);
  const [archivedPlayers, setArchivedPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedArchive, setSelectedArchive] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const headers = {
        Authorization: `Bearer ${token}`
      };

      const [recordsResponse, archiveResponse] = await Promise.all([
        fetch(`${API_URL}/api/player-domain/players`, { headers }),
        fetch(`${API_URL}/api/player-domain/archive`, { headers })
      ]);

      if (!recordsResponse.ok || !archiveResponse.ok) {
        throw new Error('Failed to fetch player archive data');
      }

      const recordsData = await recordsResponse.json();
      const archiveData = await archiveResponse.json();

      setRecords(recordsData.records || []);
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

  const handleArchive = async (payload) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/player-domain/profiles/${payload.profileId}/archive`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: payload.reason,
          notes: payload.notes
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to archive player');
      }

      setSelectedRecord(null);
      showToast('Player archived successfully');
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
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

  if (loading) {
    return <div className="p-4 text-center text-white">Loading player archive manager...</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Player Archive Manager</h2>
          <p className="mt-0.5 text-xs text-gray-300">
            Manage active player identities, archive departures, and reinstate returning players.
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

      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">Active / Legacy Player Records</h3>
          <span className="text-xs text-gray-400">{records.length} records</span>
        </div>
        <div className="overflow-hidden rounded-lg border border-white/10 bg-gray-800/40 backdrop-blur-sm shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-900/40 text-left text-xs uppercase tracking-wide text-gray-300">
              <tr>
                <th className="px-3 py-2">Player</th>
                <th className="px-3 py-2">Migration</th>
                <th className="px-3 py-2">Position</th>
                <th className="px-3 py-2">Membership</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {records.map((record) => (
                <tr key={record.profileId} className="hover:bg-gray-700/20">
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-white text-sm">{record.fullName}</div>
                    <div className="text-xs text-gray-400">{record.email || 'No linked email'}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${record.migrated ? 'bg-green-900/40 text-green-200 border border-green-500/30' : 'bg-yellow-900/40 text-yellow-200 border border-yellow-500/30'}`}>
                      {record.migrated ? 'Mapped' : 'Legacy only'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-300">
                    <div>{record.position}</div>
                    <div className="text-xs text-gray-400">{record.preferredPosition}</div>
                  </td>
                  <td className="px-4 py-4 text-gray-300">
                    {record.activeMembership ? (
                      <>
                        <div>{record.activeMembership.primaryPosition}</div>
                        <div className="text-xs text-gray-400">
                          #{record.activeMembership.jerseyNumber || '--'} - {record.activeMembership.contractType}
                        </div>
                      </>
                    ) : (
                      <span className="text-gray-500">No active membership</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      record.playerStatus === 'active'
                        ? 'bg-green-900/40 text-green-200 border border-green-500/30'
                        : record.playerStatus === 'archived' || record.playerStatus === 'transferred'
                          ? 'bg-red-900/40 text-red-200 border border-red-500/30'
                          : 'bg-gray-700/40 text-gray-300 border border-white/10'
                    }`}>
                      {record.playerStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => setSelectedRecord(record)}
                      disabled={record.playerStatus !== 'active'}
                      className="rounded bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-600/40"
                    >
                      Archive
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Archived Players</h3>
          <span className="text-sm text-gray-400">{archivedPlayers.length} archived</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {archivedPlayers.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/20 bg-gray-800/20 p-8 text-center text-gray-400">
              No archived players yet.
            </div>
          ) : (
            archivedPlayers.map((entry) => (
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

      {selectedRecord && (
        <ArchiveModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onSubmit={handleArchive}
        />
      )}

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

const ArchiveModal = ({ record, onClose, onSubmit }) => {
  const [reason, setReason] = useState('transferred');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    await onSubmit({
      profileId: record.profileId,
      reason,
      notes
    });
    setSubmitting(false);
  };

  return (
    <ModalShell title={`Archive ${record.fullName}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Reason</label>
          <select
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="w-full rounded border border-white/20 px-3 py-2 bg-gray-800/40 text-white"
          >
            <option value="transferred">Transferred</option>
            <option value="released">Released</option>
            <option value="retired">Retired</option>
            <option value="loan_ended">Loan Ended</option>
            <option value="academy_exit">Academy Exit</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Notes</label>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows="4"
            className="w-full rounded border border-white/20 px-3 py-2 bg-gray-800/40 text-white placeholder-gray-500"
            placeholder="Optional departure notes"
          />
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded border border-white/20 px-4 py-2 text-gray-300 hover:bg-gray-700/40">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="rounded bg-red-600 px-4 py-2 text-white disabled:opacity-50 hover:bg-red-700">
            {submitting ? 'Archiving...' : 'Archive Player'}
          </button>
        </div>
      </form>
    </ModalShell>
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
            <label className="mb-1 block text-sm font-medium text-gray-700">Jersey Number</label>
            <input
              type="number"
              min="1"
              max="99"
              value={formData.jerseyNumber}
              onChange={(event) => setFormData((current) => ({ ...current, jerseyNumber: event.target.value }))}
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Primary Position</label>
            <input
              type="text"
              value={formData.primaryPosition}
              onChange={(event) => setFormData((current) => ({ ...current, primaryPosition: event.target.value.toUpperCase() }))}
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Contract Type</label>
          <select
            value={formData.contractType}
            onChange={(event) => setFormData((current) => ({ ...current, contractType: event.target.value }))}
            className="w-full rounded border border-gray-300 px-3 py-2"
          >
            <option value="Owned">Owned</option>
            <option value="On Loan">On Loan</option>
            <option value="Academy">Academy</option>
            <option value="Trial">Trial</option>
            <option value="Staff">Staff</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Optional Linked User ID</label>
          <input
            type="text"
            value={formData.userId}
            onChange={(event) => setFormData((current) => ({ ...current, userId: event.target.value }))}
            className="w-full rounded border border-gray-300 px-3 py-2"
            placeholder="Leave empty if the player has no login yet"
          />
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded border border-gray-300 px-4 py-2 text-gray-700">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
            {submitting ? 'Reinstating...' : 'Reinstate Player'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

const ModalShell = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
    <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <button onClick={onClose} className="text-gray-400 transition hover:text-gray-600">
          X
        </button>
      </div>
      {children}
    </div>
  </div>
);

export default PlayerArchiveManager;
