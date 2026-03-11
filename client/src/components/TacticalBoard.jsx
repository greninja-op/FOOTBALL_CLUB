import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const TacticalBoard = () => {
  const { token } = useAuth();
  const [players, setPlayers] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [selectedFixture, setSelectedFixture] = useState('');
  const [formation, setFormation] = useState('4-4-2');
  const [lineup, setLineup] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const formations = {
    '4-4-2': { defenders: 4, midfielders: 4, forwards: 2 },
    '4-3-3': { defenders: 4, midfielders: 3, forwards: 3 },
    '3-5-2': { defenders: 3, midfielders: 5, forwards: 2 }
  };

  useEffect(() => {
    fetchPlayers();
    fetchFixtures();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profiles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        // Filter out Red fitness status players
        const availablePlayers = data.profiles.filter(p => p.fitnessStatus !== 'Red');
        setPlayers(availablePlayers);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to load players');
      setLoading(false);
    }
  };

  const fetchFixtures = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/fixtures`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        // Only show future fixtures without lineups
        const upcomingFixtures = data.fixtures.filter(f => 
          new Date(f.date) > new Date() && (!f.lineup || f.lineup.length === 0)
        );
        setFixtures(upcomingFixtures);
      }
    } catch (err) {
      setError('Failed to load fixtures');
    }
  };

  const handleDragStart = (e, player) => {
    e.dataTransfer.setData('player', JSON.stringify(player));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const player = JSON.parse(e.dataTransfer.getData('player'));
    
    // Check if player already in lineup
    if (lineup.find(p => p._id === player._id)) {
      setError('Player already in lineup');
      return;
    }

    // Check lineup size (max 18: 11 starters + 7 subs)
    if (lineup.length >= 18) {
      setError('Lineup is full (maximum 18 players: 11 starters + 7 substitutes)');
      return;
    }

    setLineup([...lineup, player]);
    setError('');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeFromLineup = (playerId) => {
    setLineup(lineup.filter(p => p._id !== playerId));
  };

  const saveLineup = async () => {
    if (!selectedFixture) {
      setError('Please select a fixture');
      return;
    }

    if (lineup.length === 0) {
      setError('Please add at least one player to the lineup');
      return;
    }

    if (lineup.length > 18) {
      setError('Lineup cannot exceed 18 players');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/fixtures/${selectedFixture}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lineup: lineup.map(p => p._id)
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Lineup saved successfully');
        setLineup([]);
        setSelectedFixture('');
        fetchFixtures(); // Refresh fixtures list
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to save lineup');
      }
    } catch (err) {
      setError('Failed to save lineup');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="text-gray-600">Loading players...</div>
    </div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Tactical Board</h2>

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

      {/* Fixture Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Fixture
        </label>
        <select
          value={selectedFixture}
          onChange={(e) => setSelectedFixture(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">-- Select a fixture --</option>
          {fixtures.map(fixture => (
            <option key={fixture.id} value={fixture.id}>
              {new Date(fixture.date).toLocaleDateString()} - vs {fixture.opponent} ({fixture.location})
            </option>
          ))}
        </select>
      </div>

      {/* Formation Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Formation
        </label>
        <div className="flex gap-2">
          {Object.keys(formations).map(f => (
            <button
              key={f}
              onClick={() => setFormation(f)}
              className={`px-4 py-2 rounded ${
                formation === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Available Players */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Available Players</h3>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 min-h-96">
            {players.map(player => (
              <div
                key={player._id}
                draggable
                onDragStart={(e) => handleDragStart(e, player)}
                className="bg-white p-3 mb-2 rounded shadow cursor-move hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{player.fullName}</div>
                    <div className="text-sm text-gray-600">{player.position}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      player.fitnessStatus === 'Green' ? 'bg-green-100 text-green-800' :
                      player.fitnessStatus === 'Yellow' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {player.fitnessStatus}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lineup Builder */}
        <div>
          <h3 className="text-lg font-semibold mb-3">
            Lineup ({lineup.length}/18)
          </h3>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="bg-green-50 p-4 rounded-lg border-2 border-dashed border-green-300 min-h-96"
          >
            {lineup.length === 0 ? (
              <div className="text-center text-gray-500 mt-20">
                Drag players here to build lineup
              </div>
            ) : (
              lineup.map(player => (
                <div
                  key={player._id}
                  className="bg-white p-3 mb-2 rounded shadow flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">{player.fullName}</div>
                    <div className="text-sm text-gray-600">{player.position}</div>
                  </div>
                  <button
                    onClick={() => removeFromLineup(player._id)}
                    className="text-red-600 hover:text-red-800 font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>

          <button
            onClick={saveLineup}
            disabled={!selectedFixture || lineup.length === 0}
            className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Save Lineup
          </button>
        </div>
      </div>
    </div>
  );
};

export default TacticalBoard;
