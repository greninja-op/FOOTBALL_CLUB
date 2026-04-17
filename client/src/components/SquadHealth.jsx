import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FloatingNotice from './FloatingNotice';

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
  const [showInjuryModal, setShowInjuryModal] = useState(false);
  const [showFitnessModal, setShowFitnessModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [injuryForm, setInjuryForm] = useState({
    injuryType: '',
    severity: 'Minor',
    expectedRecovery: '',
    notes: ''
  });

  const [fitnessForm, setFitnessForm] = useState({
    status: 'Green',
    notes: ''
  });

  const getUserId = (player) => player?.userId?._id || player?.userId;

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

  const handleLogInjury = async (e) => {
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
          playerId: selectedPlayer._id,
          ...injuryForm
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Injury logged successfully');
        setShowInjuryModal(false);
        setInjuryForm({ injuryType: '', severity: 'Minor', expectedRecovery: '', notes: '' });
        setSelectedPlayer(null);
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

  const handleUpdateFitness = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/profiles/${getUserId(selectedPlayer)}/fitness`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(fitnessForm)
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Fitness status updated successfully');
        setShowFitnessModal(false);
        setFitnessForm({ status: 'Green', notes: '' });
        setSelectedPlayer(null);
        fetchPlayers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update fitness status');
      }
    } catch (err) {
      setError('Failed to update fitness status');
    }
  };

  const updateFitnessInline = async (player, status) => {
    setSelectedPlayer(player);
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
      setSelectedPlayer(null);
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
      <h2 className="text-xl font-bold mb-4 text-white">Squad Health</h2>

      {/* Fitness Status Grid */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-white">Fitness Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map(player => (
            <div key={player._id} className="bg-gray-800/40 backdrop-blur-sm border border-white/10 p-4 rounded-lg shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium text-white">{player.fullName}</div>
                  <div className="text-sm text-gray-400">{getDisplayPosition(player)}</div>
                  <div className="mt-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${
                      player.availabilityStatus === 'manual-unavailable' || player.availabilityStatus === 'injured' || player.availabilityStatus === 'leave'
                        ? 'bg-red-900/40 text-red-200 border-red-500/30'
                        : player.availabilityStatus === 'listed' || player.availabilityStatus === 'suspended'
                        ? 'bg-yellow-900/40 text-yellow-200 border-yellow-500/30'
                        : 'bg-green-900/40 text-green-200 border-green-500/30'
                    }`}>
                      {player.availabilityStatus || 'available'}
                    </span>
                  </div>
                </div>
                <select
                  value={player.fitnessStatus || 'Green'}
                  onChange={(event) => updateFitnessInline(player, event.target.value)}
                  className={`rounded border px-2 py-1 text-sm font-semibold ${
                    player.fitnessStatus === 'Green' ? 'bg-green-900/40 text-green-200 border-green-500/30' :
                    player.fitnessStatus === 'Yellow' ? 'bg-yellow-900/40 text-yellow-200 border-yellow-500/30' :
                    'bg-red-900/40 text-red-200 border-red-500/30'
                  }`}
                >
                  <option value="Green">Green</option>
                  <option value="Yellow">Yellow</option>
                  <option value="Red">Red</option>
                </select>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    setSelectedPlayer(player);
                    setFitnessForm({ status: player.fitnessStatus, notes: '' });
                    setShowFitnessModal(true);
                  }}
                  className="flex-1 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Update Fitness
                </button>
                <button
                  onClick={() => {
                    setSelectedPlayer(player);
                    setShowInjuryModal(true);
                  }}
                  className="flex-1 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Log Injury
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Injuries List */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-white">Active Injuries</h3>
        {injuries.length === 0 ? (
          <div className="bg-gray-800/40 backdrop-blur-sm border border-white/10 p-8 rounded-lg shadow text-center text-gray-500">
            No active injuries
          </div>
        ) : (
          <div className="bg-gray-800/40 backdrop-blur-sm border border-white/10 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-gray-900/40">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase">Player</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase">Injury Type</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase">Severity</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase">Expected Recovery</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800/20 divide-y divide-white/10">
                {injuries.map(injury => (
                  <tr key={injury.id} className="hover:bg-gray-700/20">
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="font-medium text-white">{injury.playerId?.fullName}</div>
                      <div className="text-sm text-gray-400">{injury.playerId?.position}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-gray-300">{injury.injuryType}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-semibold border ${
                        injury.severity === 'Minor' ? 'bg-yellow-900/40 text-yellow-200 border-yellow-500/30' :
                        injury.severity === 'Moderate' ? 'bg-orange-900/40 text-orange-200 border-orange-500/30' :
                        'bg-red-900/40 text-red-200 border-red-500/30'
                      }`}>
                        {injury.severity}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-gray-300">
                      {injury.expectedRecovery 
                        ? new Date(injury.expectedRecovery).toLocaleDateString()
                        : 'N/A'
                      }
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <button
                        onClick={() => handleMarkRecovered(injury.id)}
                        className="text-green-400 hover:text-green-300 font-medium"
                      >
                        Mark Recovered
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Injury Modal */}
      {showInjuryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-lg p-4 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-white">
              Log Injury - {selectedPlayer?.fullName}
            </h3>
            <form onSubmit={handleLogInjury}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Injury Type
                </label>
                <input
                  type="text"
                  value={injuryForm.injuryType}
                  onChange={(e) => setInjuryForm({ ...injuryForm, injuryType: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800/40 border border-white/20 text-white rounded-md placeholder-gray-500"
                  placeholder="e.g., Hamstring strain"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Severity
                </label>
                <select
                  value={injuryForm.severity}
                  onChange={(e) => setInjuryForm({ ...injuryForm, severity: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800/40 border border-white/20 text-white rounded-md"
                >
                  <option value="Minor">Minor</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Expected Recovery Date
                </label>
                <input
                  type="date"
                  value={injuryForm.expectedRecovery}
                  onChange={(e) => setInjuryForm({ ...injuryForm, expectedRecovery: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800/40 border border-white/20 text-white rounded-md"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={injuryForm.notes}
                  onChange={(e) => setInjuryForm({ ...injuryForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800/40 border border-white/20 text-white rounded-md placeholder-gray-500"
                  rows="3"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white py-2 px-3 rounded hover:bg-red-700"
                >
                  Log Injury
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowInjuryModal(false);
                    setInjuryForm({ injuryType: '', severity: 'Minor', expectedRecovery: '', notes: '' });
                    setSelectedPlayer(null);
                    setError('');
                  }}
                  className="flex-1 bg-gray-700/40 border border-white/10 text-white py-2 px-3 rounded hover:bg-gray-700/60"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Fitness Modal */}
      {showFitnessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-lg p-4 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-white">
              Update Fitness - {selectedPlayer?.fullName}
            </h3>
            <form onSubmit={handleUpdateFitness}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fitness Status
                </label>
                <select
                  value={fitnessForm.status}
                  onChange={(e) => setFitnessForm({ ...fitnessForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800/40 border border-white/20 text-white rounded-md"
                >
                  <option value="Green">Green</option>
                  <option value="Yellow">Yellow</option>
                  <option value="Red">Red</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={fitnessForm.notes}
                  onChange={(e) => setFitnessForm({ ...fitnessForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800/40 border border-white/20 text-white rounded-md placeholder-gray-500"
                  rows="3"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowFitnessModal(false);
                    setFitnessForm({ status: 'Green', notes: '' });
                    setSelectedPlayer(null);
                    setError('');
                  }}
                  className="flex-1 bg-gray-700/40 border border-white/10 text-white py-2 px-3 rounded hover:bg-gray-700/60"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SquadHealth;
