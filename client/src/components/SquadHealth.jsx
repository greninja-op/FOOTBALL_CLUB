import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const SquadHealth = () => {
  const { token } = useAuth();
  const [players, setPlayers] = useState([]);
  const [injuries, setInjuries] = useState([]);
  const [showInjuryModal, setShowInjuryModal] = useState(false);
  const [showFitnessModal, setShowFitnessModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
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
        setPlayers(data.profiles);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to load players');
      setLoading(false);
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
        `${import.meta.env.VITE_API_URL}/api/profiles/${selectedPlayer.userId}/fitness`,
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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Squad Health</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Fitness Status Grid */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Fitness Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map(player => (
            <div key={player._id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium">{player.fullName}</div>
                  <div className="text-sm text-gray-600">{player.position}</div>
                </div>
                <span className={`px-3 py-1 rounded text-sm font-semibold ${
                  player.fitnessStatus === 'Green' ? 'bg-green-100 text-green-800' :
                  player.fitnessStatus === 'Yellow' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {player.fitnessStatus}
                </span>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    setSelectedPlayer(player);
                    setFitnessForm({ status: player.fitnessStatus, notes: '' });
                    setShowFitnessModal(true);
                  }}
                  className="flex-1 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                >
                  Update Fitness
                </button>
                <button
                  onClick={() => {
                    setSelectedPlayer(player);
                    setShowInjuryModal(true);
                  }}
                  className="flex-1 text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
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
        <h3 className="text-lg font-semibold mb-4">Active Injuries</h3>
        {injuries.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
            No active injuries
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Injury Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected Recovery</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {injuries.map(injury => (
                  <tr key={injury.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{injury.playerId?.fullName}</div>
                      <div className="text-sm text-gray-500">{injury.playerId?.position}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{injury.injuryType}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        injury.severity === 'Minor' ? 'bg-yellow-100 text-yellow-800' :
                        injury.severity === 'Moderate' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {injury.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {injury.expectedRecovery 
                        ? new Date(injury.expectedRecovery).toLocaleDateString()
                        : 'N/A'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleMarkRecovered(injury.id)}
                        className="text-green-600 hover:text-green-800 font-medium"
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              Log Injury - {selectedPlayer?.fullName}
            </h3>
            <form onSubmit={handleLogInjury}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Injury Type
                </label>
                <input
                  type="text"
                  value={injuryForm.injuryType}
                  onChange={(e) => setInjuryForm({ ...injuryForm, injuryType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Hamstring strain"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity
                </label>
                <select
                  value={injuryForm.severity}
                  onChange={(e) => setInjuryForm({ ...injuryForm, severity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Minor">Minor</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Recovery Date
                </label>
                <input
                  type="date"
                  value={injuryForm.expectedRecovery}
                  onChange={(e) => setInjuryForm({ ...injuryForm, expectedRecovery: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={injuryForm.notes}
                  onChange={(e) => setInjuryForm({ ...injuryForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="3"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
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
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              Update Fitness - {selectedPlayer?.fullName}
            </h3>
            <form onSubmit={handleUpdateFitness}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fitness Status
                </label>
                <select
                  value={fitnessForm.status}
                  onChange={(e) => setFitnessForm({ ...fitnessForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Green">Green</option>
                  <option value="Yellow">Yellow</option>
                  <option value="Red">Red</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={fitnessForm.notes}
                  onChange={(e) => setFitnessForm({ ...fitnessForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="3"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
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
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
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
