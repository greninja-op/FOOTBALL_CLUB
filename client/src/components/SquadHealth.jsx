import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FloatingNotice from './FloatingNotice';
import UiButton from './ui/UiButton';
import UiSelect from './ui/UiSelect';
import UiCalendarInput from './ui/UiCalendarInput';

const getDisplayPosition = (player) => (
  player.playerDomain?.activeMembership?.primaryPosition
  || player.preferredPosition
  || player.position
  || 'N/A'
);

const SquadHealth = () => {
  const { token } = useAuth();
  const [players, setPlayers] = useState([]);
  const [injuries, setInjuries] = useState([]);
  const [expandedInjuryPlayerId, setExpandedInjuryPlayerId] = useState(null);
  const [updatingFitnessPlayerId, setUpdatingFitnessPlayerId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [injuryForm, setInjuryForm] = useState({
    injuryType: '',
    severity: 'Minor',
    expectedRecovery: '',
    notes: ''
  });

  const getUserId = (player) => player?.userId?._id || player?.userId;
  const fitnessStatuses = ['Green', 'Yellow', 'Red'];

  useEffect(() => {
    fetchPlayers();
    fetchInjuries();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profiles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setPlayers(
          data.profiles.filter((profile) => (profile.userId?.role || '').toLowerCase() === 'player')
        );
      }
    } catch (err) {
      setError('Failed to load players');
    }
  };

  const fetchInjuries = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/injuries?resolved=false`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setInjuries(data.injuries);
      }
    } catch (err) {
      console.error('Failed to load injuries');
    }
  };

  const handleLogInjury = async (e, playerId) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/injuries`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          playerId,
          ...injuryForm
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Injury logged successfully');
        setExpandedInjuryPlayerId(null);
        setInjuryForm({ injuryType: '', severity: 'Minor', expectedRecovery: '', notes: '' });
        fetchPlayers();
        fetchInjuries();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to log injury');
      }
    } catch (err) {
      setError('Failed to log injury');
    }
  };

  const updateFitnessInline = async (player, status) => {
    setUpdatingFitnessPlayerId(player._id);
    setError('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/profiles/${getUserId(player)}/fitness`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status, notes: 'Updated from squad health quick control' })
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccess('Fitness status updated successfully');
        fetchPlayers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update fitness status');
      }
    } catch (err) {
      setError('Failed to update fitness status');
    } finally {
      setUpdatingFitnessPlayerId(null);
    }
  };

  const handleMarkRecovered = async (injuryId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/injuries/${injuryId}/recover`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            recoveryDate: new Date().toISOString()
          })
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Injury marked as recovered');
        fetchPlayers();
        fetchInjuries();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to mark as recovered');
      }
    } catch (err) {
      setError('Failed to mark as recovered');
    }
  };

  return (
    <div className="p-4">
      <FloatingNotice message={error || success} type={error ? 'error' : 'success'} />
      <h2 className="mb-4 text-xl font-bold text-white">Squad Health</h2>

      {/* Fitness Status Grid */}
      <div className="mb-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Fitness Status</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {players.map((player) => {
            const isExpanded = expandedInjuryPlayerId === player._id;

            return (
              <div key={player._id} className="rounded-2xl border border-white/10 bg-gray-800/40 p-4 shadow backdrop-blur-sm">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium text-white">{player.fullName}</div>
                    <div className="text-sm text-gray-400">{getDisplayPosition(player)}</div>
                    <div className="mt-1">
                      <span className={`rounded-full border px-2 py-1 text-xs font-medium ${
                        player.availabilityStatus === 'manual-unavailable' || player.availabilityStatus === 'injured' || player.availabilityStatus === 'leave'
                          ? 'border-red-500/30 bg-red-900/40 text-red-200'
                          : player.availabilityStatus === 'listed' || player.availabilityStatus === 'suspended'
                            ? 'border-yellow-500/30 bg-yellow-900/40 text-yellow-200'
                            : 'border-green-500/30 bg-green-900/40 text-green-200'
                      }`}>
                        {player.availabilityStatus || 'available'}
                      </span>
                    </div>
                  </div>

                  <div className="w-[11.25rem] rounded-xl border border-white/15 bg-gray-900/50 p-1">
                    <div className="grid grid-cols-3 gap-1">
                      {fitnessStatuses.map((status) => {
                        const isActive = (player.fitnessStatus || 'Green') === status;

                        return (
                          <button
                            key={`${player._id}-${status}`}
                            type="button"
                            onClick={() => updateFitnessInline(player, status)}
                            disabled={updatingFitnessPlayerId === player._id}
                            className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition ${
                              isActive
                                ? status === 'Green'
                                  ? 'border border-green-500/35 bg-green-900/50 text-green-100'
                                  : status === 'Yellow'
                                    ? 'border border-yellow-500/35 bg-yellow-900/50 text-yellow-100'
                                    : 'border border-red-500/35 bg-red-900/50 text-red-100'
                                : 'border border-transparent bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/85'
                            }`}
                          >
                            {status}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <UiButton
                    onClick={() => {
                      setExpandedInjuryPlayerId(isExpanded ? null : player._id);
                      setInjuryForm({ injuryType: '', severity: 'Minor', expectedRecovery: '', notes: '' });
                    }}
                    variant={isExpanded ? 'secondary' : 'danger'}
                    className="flex-1"
                  >
                    {isExpanded ? 'Close Injury Form' : 'Log Injury'}
                  </UiButton>
                </div>

                <div className="ui-inline-expand mt-3" data-open={isExpanded}>
                  <div className="ui-expand-card p-4">
                    <form onSubmit={(event) => handleLogInjury(event, player._id)}>
                      <div className="mb-3">
                        <label className="mb-1 block text-sm font-medium text-gray-300">Injury Type</label>
                        <input
                          type="text"
                          value={injuryForm.injuryType}
                          onChange={(event) => setInjuryForm({ ...injuryForm, injuryType: event.target.value })}
                          className="ui-field"
                          placeholder="Hamstring strain"
                          required
                        />
                      </div>

                      <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-300">Severity</label>
                          <UiSelect
                            value={injuryForm.severity}
                            onChange={(event) => setInjuryForm({ ...injuryForm, severity: event.target.value })}
                          >
                            <option value="Minor">Minor</option>
                            <option value="Moderate">Moderate</option>
                            <option value="Severe">Severe</option>
                          </UiSelect>
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-300">Expected Recovery</label>
                          <UiCalendarInput
                            value={injuryForm.expectedRecovery}
                            onChange={(event) => setInjuryForm({ ...injuryForm, expectedRecovery: event.target.value })}
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="mb-1 block text-sm font-medium text-gray-300">Notes</label>
                        <textarea
                          value={injuryForm.notes}
                          onChange={(event) => setInjuryForm({ ...injuryForm, notes: event.target.value })}
                          className="ui-textarea"
                          rows="3"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <UiButton type="button" variant="secondary" onClick={() => setExpandedInjuryPlayerId(null)}>
                          Cancel
                        </UiButton>
                        <UiButton type="submit" variant="danger">
                          Save Injury
                        </UiButton>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Injuries List */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">Active Injuries</h3>
        {injuries.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-gray-800/40 p-8 text-center text-gray-500 shadow backdrop-blur-sm">
            No active injuries
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-white/10 bg-gray-800/40 shadow backdrop-blur-sm">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-gray-900/40">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-gray-300">Player</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-gray-300">Injury Type</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-gray-300">Severity</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-gray-300">Expected Recovery</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-gray-800/20">
                {injuries.map((injury) => (
                  <tr key={injury.id} className="hover:bg-gray-700/20">
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <div className="font-medium text-white">{injury.playerId?.fullName}</div>
                      <div className="text-sm text-gray-400">{injury.playerId?.position}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-gray-300">{injury.injuryType}</td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${
                        injury.severity === 'Minor'
                          ? 'border-yellow-500/30 bg-yellow-900/40 text-yellow-200'
                          : injury.severity === 'Moderate'
                            ? 'border-orange-500/30 bg-orange-900/40 text-orange-200'
                            : 'border-red-500/30 bg-red-900/40 text-red-200'
                      }`}>
                        {injury.severity}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-gray-300">
                      {injury.expectedRecovery
                        ? new Date(injury.expectedRecovery).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <UiButton onClick={() => handleMarkRecovered(injury.id)} size="sm" variant="success">
                        Mark Recovered
                      </UiButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SquadHealth;
