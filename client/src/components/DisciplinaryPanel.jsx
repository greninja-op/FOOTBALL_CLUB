import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const DisciplinaryPanel = () => {
  const { token } = useAuth();
  const [players, setPlayers] = useState([]);
  const [actions, setActions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [fineForm, setFineForm] = useState({
    playerId: '',
    offense: '',
    fineAmount: '',
    dateIssued: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchPlayers();
    fetchActions();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profiles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setPlayers(data.profiles.filter(p => p.position !== 'Staff'));
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to load players');
      setLoading(false);
    }
  };

  const fetchActions = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/disciplinary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setActions(data.actions);
      }
    } catch (err) {
      console.error('Failed to load disciplinary actions');
    }
  };

  const handleLogFine = async (e) => {
    e.preventDefault();
    setError('');

    if (!fineForm.playerId || !fineForm.offense || !fineForm.fineAmount) {
      setError('Please fill in all required fields');
      return;
    }

    if (fineForm.fineAmount < 0 || fineForm.fineAmount > 100000) {
      setError('Fine amount must be between 0 and 100,000');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/disciplinary`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...fineForm,
          fineAmount: parseFloat(fineForm.fineAmount)
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Fine logged successfully');
        setShowModal(false);
        setFineForm({
          playerId: '',
          offense: '',
          fineAmount: '',
          dateIssued: new Date().toISOString().split('T')[0]
        });
        fetchActions();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to log fine');
      }
    } catch (err) {
      setError('Failed to log fine');
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Disciplinary Actions</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Log Fine
        </button>
      </div>

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

      {/* Action History Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {actions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No disciplinary actions recorded
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Offense</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {actions.map(action => (
                <tr key={action._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{action.playerId?.fullName}</div>
                    <div className="text-sm text-gray-500">{action.playerId?.position}</div>
                  </td>
                  <td className="px-6 py-4">{action.offense}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${action.fineAmount?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(action.dateIssued).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      action.isPaid 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {action.isPaid ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Log Fine Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Log Fine</h3>
            <form onSubmit={handleLogFine}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Player *
                </label>
                <select
                  value={fineForm.playerId}
                  onChange={(e) => setFineForm({ ...fineForm, playerId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select a player</option>
                  {players.map(player => (
                    <option key={player._id} value={player._id}>
                      {player.fullName} - {player.position}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Offense *
                </label>
                <input
                  type="text"
                  value={fineForm.offense}
                  onChange={(e) => setFineForm({ ...fineForm, offense: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Late to training"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fine Amount ($) *
                </label>
                <input
                  type="number"
                  value={fineForm.fineAmount}
                  onChange={(e) => setFineForm({ ...fineForm, fineAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="0 - 100,000"
                  min="0"
                  max="100000"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Issued
                </label>
                <input
                  type="date"
                  value={fineForm.dateIssued}
                  onChange={(e) => setFineForm({ ...fineForm, dateIssued: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                >
                  Log Fine
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFineForm({
                      playerId: '',
                      offense: '',
                      fineAmount: '',
                      dateIssued: new Date().toISOString().split('T')[0]
                    });
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

export default DisciplinaryPanel;
