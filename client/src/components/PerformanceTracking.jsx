import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

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
    rating: 0
  });

  const [noteForm, setNoteForm] = useState('');

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
        setPlayers(data.profiles.filter(p => p.position !== 'Staff'));
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
        `${import.meta.env.VITE_API_URL}/api/profiles/${selectedPlayer.userId}/stats`,
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
        `${import.meta.env.VITE_API_URL}/api/profiles/${selectedPlayer.userId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            performanceNotes: [
              ...(selectedPlayer.performanceNotes || []),
              {
                note: noteForm,
                createdAt: new Date().toISOString()
              }
            ]
          })
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Note added successfully');
        setNoteForm('');
        fetchPlayers();
        // Update selected player with new notes
        const updatedPlayer = players.find(p => p._id === selectedPlayer._id);
        if (updatedPlayer) {
          setSelectedPlayer(updatedPlayer);
        }
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to add note');
      }
    } catch (err) {
      setError('Failed to add note');
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Performance Tracking</h2>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player List */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-4">Select Player</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {players.map(player => (
              <button
                key={player._id}
                onClick={() => handlePlayerSelect(player)}
                className={`w-full text-left p-3 rounded transition ${
                  selectedPlayer?._id === player._id
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                <div className="font-medium">{player.fullName}</div>
                <div className="text-sm text-gray-600">{player.position}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Stats Form */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-4">Update Statistics</h3>
          {selectedPlayer ? (
            <form onSubmit={handleUpdateStats}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goals
                </label>
                <input
                  type="number"
                  value={statsForm.goals}
                  onChange={(e) => setStatsForm({ ...statsForm, goals: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="0"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assists
                </label>
                <input
                  type="number"
                  value={statsForm.assists}
                  onChange={(e) => setStatsForm({ ...statsForm, assists: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="0"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appearances
                </label>
                <input
                  type="number"
                  value={statsForm.appearances}
                  onChange={(e) => setStatsForm({ ...statsForm, appearances: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="0"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating (0-10)
                </label>
                <input
                  type="number"
                  value={statsForm.rating}
                  onChange={(e) => setStatsForm({ ...statsForm, rating: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="0"
                  max="10"
                  step="0.1"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Update Stats
              </button>
            </form>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Select a player to update their statistics
            </p>
          )}
        </div>

        {/* Private Notes */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-4">Private Notes</h3>
          {selectedPlayer ? (
            <>
              <form onSubmit={handleAddNote} className="mb-4">
                <textarea
                  value={noteForm}
                  onChange={(e) => setNoteForm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
                  rows="3"
                  placeholder="Add a private note about this player's performance..."
                />
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                >
                  Add Note
                </button>
              </form>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Notes History</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedPlayer.performanceNotes && selectedPlayer.performanceNotes.length > 0 ? (
                    selectedPlayer.performanceNotes
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .map((note, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded">
                          <p className="text-sm text-gray-800 mb-1">{note.note}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(note.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No notes yet
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Select a player to view and add notes
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceTracking;
