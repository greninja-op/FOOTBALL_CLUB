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

const DisciplinaryPanel = () => {
  const { token } = useAuth();
  const [players, setPlayers] = useState([]);
  const [actions, setActions] = useState([]);
  const [showFineForm, setShowFineForm] = useState(false);
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
        setShowFineForm(false);
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
    return <div className="p-4 text-gray-400">Loading...</div>;
  }

  return (
    <div className="p-4">
      <FloatingNotice message={error || success} type={error ? 'error' : 'success'} />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Disciplinary Actions</h2>
        <UiButton
          onClick={() => setShowFineForm((current) => !current)}
          variant={showFineForm ? 'secondary' : 'primary'}
        >
          {showFineForm ? 'Close Form' : 'Log Fine'}
        </UiButton>
      </div>

      <div className="ui-inline-expand mb-4" data-open={showFineForm}>
        <div className="ui-expand-card p-4">
          <h3 className="mb-3 text-lg font-semibold text-white">Log Fine</h3>
          <form onSubmit={handleLogFine}>
            <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Player *</label>
                <UiSelect
                  value={fineForm.playerId}
                  onChange={(event) => setFineForm({ ...fineForm, playerId: event.target.value })}
                  required
                >
                  <option value="">Select a player</option>
                  {players.map((player) => (
                    <option key={player._id} value={player._id}>
                      {player.fullName} - {getDisplayPosition(player)}
                    </option>
                  ))}
                </UiSelect>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Date Issued</label>
                <UiCalendarInput
                  value={fineForm.dateIssued}
                  onChange={(event) => setFineForm({ ...fineForm, dateIssued: event.target.value })}
                />
              </div>
            </div>

            <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-[1.3fr_0.7fr]">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Offense *</label>
                <input
                  type="text"
                  value={fineForm.offense}
                  onChange={(event) => setFineForm({ ...fineForm, offense: event.target.value })}
                  className="ui-field"
                  placeholder="Late to training"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Fine Amount ($) *</label>
                <input
                  type="number"
                  value={fineForm.fineAmount}
                  onChange={(event) => setFineForm({ ...fineForm, fineAmount: event.target.value })}
                  className="ui-field"
                  placeholder="0 - 100000"
                  min="0"
                  max="100000"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <UiButton
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowFineForm(false);
                  setFineForm({
                    playerId: '',
                    offense: '',
                    fineAmount: '',
                    dateIssued: new Date().toISOString().split('T')[0]
                  });
                  setError('');
                }}
              >
                Cancel
              </UiButton>
              <UiButton type="submit" variant="primary">
                Save Fine
              </UiButton>
            </div>
          </form>
        </div>
      </div>

      {/* Action History Table */}
      <div className="bg-gray-800/40 backdrop-blur-sm border border-white/10 rounded-lg shadow overflow-hidden">
        {actions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No disciplinary actions recorded
          </div>
        ) : (
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-gray-900/40">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase">Player</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase">Offense</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase">Amount</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase">Date</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800/20 divide-y divide-white/10">
              {actions.map(action => (
                <tr key={action._id} className="hover:bg-gray-700/20">
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <div className="font-medium text-white">{action.playerId?.fullName}</div>
                    <div className="text-sm text-gray-400">{getDisplayPosition(action.playerId || {})}</div>
                  </td>
                  <td className="px-4 py-2.5 text-gray-300">{action.offense}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-gray-300">
                    ${action.fineAmount?.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-gray-300">
                    {new Date(action.dateIssued).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${
                      action.isPaid 
                        ? 'bg-green-900/40 text-green-200 border-green-500/30' 
                        : 'bg-yellow-900/40 text-yellow-200 border-yellow-500/30'
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

    </div>
  );
};

export default DisciplinaryPanel;
