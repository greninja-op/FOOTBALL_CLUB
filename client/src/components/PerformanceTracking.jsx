import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FloatingNotice from './FloatingNotice';

const PerformanceTracking = () => {
  const { token } = useAuth();
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [statsForm, setStatsForm] = useState({
    goals: 0,
    assists: 0,
    appearances: 0,
    minutes: 0,
    yellowCards: 0,
    redCards: 0,
    rating: 0
  });

  const [noteForm, setNoteForm] = useState('');

  const getUserId = (player) => player?.userId?._id || player?.userId;

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profiles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        const nextPlayers = data.profiles.filter(p => p.position !== 'Staff');
        setPlayers(nextPlayers);
        if (selectedPlayer) {
          const refreshedSelectedPlayer = nextPlayers.find((player) => player._id === selectedPlayer._id);
          if (refreshedSelectedPlayer) {
            setSelectedPlayer(refreshedSelectedPlayer);
          }
        }
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to load players');
      setLoading(false);
    }
  };

  const handlePlayerSelect = (player) => {
    setSelectedPlayer(player);
    setStatsForm({
      goals: player.stats?.goals || 0,
      assists: player.stats?.assists || 0,
      appearances: player.stats?.appearances || 0,
      minutes: player.stats?.minutes || 0,
      yellowCards: player.stats?.yellowCards || 0,
      redCards: player.stats?.redCards || 0,
      rating: player.stats?.rating || 0
    });
    setNoteForm('');
    setError('');
  };

  const handleUpdateStats = async (e) => {
    e.preventDefault();
    setError('');

    if (statsForm.rating < 0 || statsForm.rating > 10) {
      setError('Rating must be between 0 and 10');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/profiles/${getUserId(selectedPlayer)}/stats`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(statsForm)
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Stats updated successfully');
        fetchPlayers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update stats');
      }
    } catch (err) {
      setError('Failed to update stats');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    setError('');

    if (!noteForm.trim()) {
      setError('Please enter a note');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/profiles/${getUserId(selectedPlayer)}/notes`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            note: noteForm
          })
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Note added successfully');
        setNoteForm('');
        await fetchPlayers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to add note');
      }
    } catch (err) {
      setError('Failed to add note');
    }
  };

  if (loading) {
    return <div className="p-4 text-gray-300">Loading...</div>;
  }

  return (
    <div className="p-4">
      <FloatingNotice message={error || success} type={error ? 'error' : 'success'} />
      <h2 className="text-xl font-bold mb-4 text-white">Performance Tracking</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Player List */}
        <div className="bg-gray-800/40 backdrop-blur-sm border border-white/10 rounded-lg p-4">
          <h3 className="font-semibold mb-3 text-white text-sm">Select Player</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {players.map(player => (
              <button
                key={player._id}
                onClick={() => handlePlayerSelect(player)}
                className={`w-full text-left p-2.5 rounded transition ${
                  selectedPlayer?._id === player._id
                    ? 'bg-red-900/40 border-2 border-red-500/50'
                    : 'bg-gray-700/20 hover:bg-gray-700/40 border-2 border-transparent'
                }`}
              >
                <div className="font-medium text-white text-sm">{player.fullName}</div>
                <div className="text-xs text-gray-400">
                  {(player.displayPosition || player.position)
                    + (player.playerDomain?.activeMembership?.squadRole ? ` - ${player.playerDomain.activeMembership.squadRole}` : '')}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Stats Form */}
        <div className="bg-gray-800/40 backdrop-blur-sm border border-white/10 rounded-lg p-4">
          <h3 className="font-semibold mb-3 text-white text-sm">Update Statistics</h3>
          {selectedPlayer ? (
            <form onSubmit={handleUpdateStats}>
              <div className="mb-3 rounded-lg bg-gray-700/20 p-2.5 text-xs text-gray-300">
                <div><span className="font-medium text-white">Position:</span> {selectedPlayer.displayPosition || selectedPlayer.position}</div>
                <div><span className="font-medium text-white">Availability:</span> {selectedPlayer.availabilityStatus || 'available'}</div>
                <div><span className="font-medium text-white">Status:</span> {selectedPlayer.playerDomain?.status || selectedPlayer.playerStatus || 'active'}</div>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Goals
                </label>
                <input
                  type="number"
                  value={statsForm.goals}
                  onChange={(e) => setStatsForm({ ...statsForm, goals: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 bg-gray-800/40 border border-white/20 rounded-md text-white text-sm focus:border-red-500 focus:outline-none"
                  min="0"
                />
              </div>

              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Assists
                </label>
                <input
                  type="number"
                  value={statsForm.assists}
                  onChange={(e) => setStatsForm({ ...statsForm, assists: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 bg-gray-800/40 border border-white/20 rounded-md text-white text-sm focus:border-red-500 focus:outline-none"
                  min="0"
                />
              </div>

              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Appearances
                </label>
                <input
                  type="number"
                  value={statsForm.appearances}
                  onChange={(e) => setStatsForm({ ...statsForm, appearances: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 bg-gray-800/40 border border-white/20 rounded-md text-white text-sm focus:border-red-500 focus:outline-none"
                  min="0"
                />
              </div>

              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Rating (0-10)
                </label>
                <input
                  type="range"
                  value={statsForm.rating}
                  onChange={(e) => setStatsForm({ ...statsForm, rating: parseFloat(e.target.value) || 0 })}
                  className="mb-2 w-full accent-red-500"
                  min="0"
                  max="10"
                  step="0.1"
                />
                <input
                  type="number"
                  value={statsForm.rating}
                  onChange={(e) => setStatsForm({ ...statsForm, rating: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 bg-gray-800/40 border border-white/20 rounded-md text-white text-sm focus:border-red-500 focus:outline-none"
                  min="0"
                  max="10"
                  step="0.1"
                />
              </div>

              <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Minutes</label>
                  <input
                    type="number"
                    value={statsForm.minutes}
                    onChange={(e) => setStatsForm({ ...statsForm, minutes: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-gray-800/40 border border-white/20 rounded-md text-white text-sm focus:border-red-500 focus:outline-none"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Yellow</label>
                  <input
                    type="number"
                    value={statsForm.yellowCards}
                    onChange={(e) => setStatsForm({ ...statsForm, yellowCards: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-gray-800/40 border border-white/20 rounded-md text-white text-sm focus:border-red-500 focus:outline-none"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Red</label>
                  <input
                    type="number"
                    value={statsForm.redCards}
                    onChange={(e) => setStatsForm({ ...statsForm, redCards: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-gray-800/40 border border-white/20 rounded-md text-white text-sm focus:border-red-500 focus:outline-none"
                    min="0"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 text-white py-1.5 px-3 rounded hover:bg-red-700 text-sm transition"
              >
                Update Stats
              </button>
            </form>
          ) : (
            <p className="text-gray-400 text-center py-8 text-sm">
              Select a player to update their statistics
            </p>
          )}
        </div>

        {/* Private Notes */}
        <div className="bg-gray-800/40 backdrop-blur-sm border border-white/10 rounded-lg p-4">
          <h3 className="font-semibold mb-3 text-white text-sm">Private Notes</h3>
          {selectedPlayer ? (
            <>
              <form onSubmit={handleAddNote} className="mb-3">
                <textarea
                  value={noteForm}
                  onChange={(e) => setNoteForm(e.target.value)}
                  className="w-full px-3 py-1.5 bg-gray-800/40 border border-white/20 rounded-md mb-2 text-white text-sm focus:border-red-500 focus:outline-none"
                  rows="3"
                  placeholder="Add a private note about this player's performance..."
                />
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-1.5 px-3 rounded hover:bg-green-700 text-sm transition"
                >
                  Add Note
                </button>
              </form>

              <div className="border-t border-white/10 pt-3">
                <h4 className="text-xs font-medium text-gray-300 mb-2">Notes History</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedPlayer.performanceNotes && selectedPlayer.performanceNotes.length > 0 ? (
                    selectedPlayer.performanceNotes
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .map((note, index) => (
                        <div key={index} className="bg-gray-700/20 p-2.5 rounded">
                          <p className="text-xs text-gray-300 mb-1">{note.note}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(note.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-4">
                      No notes yet
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-center py-8 text-sm">
              Select a player to view and add notes
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceTracking;
