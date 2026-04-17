import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import FloatingNotice from './FloatingNotice';

const FixtureCalendar = () => {
  const { token } = useAuth();
  const { socket } = useSocket();
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFixture, setEditingFixture] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchFixtures = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/fixtures`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch fixtures');
      }

      const data = await response.json();
      setFixtures(data.fixtures);
      setError(null);
    } catch (err) {
      setError(err.message);
      showToast('Error fetching fixtures', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFixtures();
  }, [token]);

  useEffect(() => {
    if (!socket) return;

    const handleFixtureCreated = () => {
      showToast('New fixture created');
      fetchFixtures();
    };

    socket.on('fixture:created', handleFixtureCreated);

    return () => {
      socket.off('fixture:created', handleFixtureCreated);
    };
  }, [socket]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDeleteFixture = async (fixtureId) => {
    if (!confirm('Delete this fixture?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/fixtures/${fixtureId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete fixture');

      showToast('Fixture deleted successfully');
      fetchFixtures();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="p-4">
      <FloatingNotice message={toast?.message || error} type={toast?.type || 'error'} />

      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/45">Match Operations</p>
          <h2 className="mt-1 text-xl font-bold text-white">Fixture Calendar</h2>
          <p className="mt-1 text-sm text-gray-400">Create fixtures with an inline expanding form instead of a clipped overlay.</p>
        </div>
        <button
          onClick={() => setShowCreateForm((current) => !current)}
          className="rounded-full border border-red-500/30 bg-red-600/90 px-4 py-2 text-sm text-white transition hover:bg-red-700"
        >
          {showCreateForm ? 'Close Form' : 'Create Fixture'}
        </button>
      </div>

      <div className="ui-inline-expand mb-4" data-open={showCreateForm}>
        <div className="ui-expand-card p-5">
          <CreateFixturePanel
            fixture={editingFixture}
            onClose={() => {
              setShowCreateForm(false);
              setEditingFixture(null);
            }}
            onSuccess={(message) => {
              setShowCreateForm(false);
              setEditingFixture(null);
              fetchFixtures();
              showToast(message);
            }}
            onError={(message) => showToast(message, 'error')}
          />
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-red-600"></div>
          <p className="mt-2 text-gray-400">Loading fixtures...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-900/30 p-4 text-red-200">{error}</div>
      ) : (
        <div className="space-y-4">
          {fixtures.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-gray-800/30 py-8 text-center text-gray-500">
              No fixtures scheduled. Create your first fixture to get started.
            </div>
          ) : (
            fixtures.map((fixture) => (
              <div key={fixture.id} className="rounded-2xl border border-white/10 bg-gray-800/30 p-4 transition hover:bg-gray-700/20">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">vs {fixture.opponent}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        fixture.matchType === 'League' ? 'bg-blue-900/40 text-blue-200 border border-blue-500/30' :
                        fixture.matchType === 'Cup' ? 'bg-purple-900/40 text-purple-200 border border-purple-500/30' :
                        fixture.matchType === 'Friendly' ? 'bg-green-900/40 text-green-200 border border-green-500/30' :
                        'bg-orange-900/40 text-orange-200 border border-orange-500/30'
                      }`}>
                        {fixture.matchType}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-400">
                      <div>{formatDate(fixture.date)} at {formatTime(fixture.date)}</div>
                      <div>{fixture.location}</div>
                    </div>
                  </div>
                  {fixture.lineup && fixture.lineup.length > 0 && (
                    <div className="text-sm text-gray-500">
                      <span className="font-medium text-white">{fixture.lineup.length}</span> players
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingFixture(fixture);
                        setShowCreateForm(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="rounded-full border border-blue-500/30 px-3 py-1 text-xs text-blue-200 transition hover:bg-blue-900/30"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteFixture(fixture.id || fixture._id)}
                      className="rounded-full border border-red-500/30 px-3 py-1 text-xs text-red-200 transition hover:bg-red-900/30"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const CreateFixturePanel = ({ onClose, onSuccess, onError, fixture = null }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    opponent: fixture?.opponent || '',
    date: fixture?.date ? new Date(fixture.date).toISOString().slice(0, 16) : '',
    location: fixture?.location || '',
    matchType: fixture?.matchType || 'League',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.opponent.trim()) {
      nextErrors.opponent = 'Opponent is required';
    }

    if (!formData.date) {
      nextErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        nextErrors.date = 'Fixture date cannot be in the past';
      }
    }

    if (!formData.location.trim()) {
      nextErrors.location = 'Location is required';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        fixture
          ? `${import.meta.env.VITE_API_URL}/api/fixtures/${fixture.id || fixture._id}`
          : `${import.meta.env.VITE_API_URL}/api/fixtures`,
        {
        method: fixture ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create fixture');
      }

      onSuccess(fixture ? 'Fixture updated successfully' : 'Fixture created successfully');
    } catch (err) {
      onError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Opponent</label>
        <input
          type="text"
          name="opponent"
          value={formData.opponent}
          onChange={handleChange}
          className="ui-field"
          placeholder="Enter opponent name"
        />
        {errors.opponent && <p className="mt-1 text-sm text-red-400">{errors.opponent}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Date</label>
        <input
          type="datetime-local"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="ui-field"
        />
        {errors.date && <p className="mt-1 text-sm text-red-400">{errors.date}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="ui-field"
          placeholder="Enter location"
        />
        {errors.location && <p className="mt-1 text-sm text-red-400">{errors.location}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Match Type</label>
        <select
          name="matchType"
          value={formData.matchType}
          onChange={handleChange}
          className="ui-select"
        >
          <option value="League">League</option>
          <option value="Cup">Cup</option>
          <option value="Friendly">Friendly</option>
          <option value="Tournament">Tournament</option>
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-full border border-white/15 bg-gray-700/40 px-4 py-2 text-gray-200 transition hover:bg-gray-700/60"
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 rounded-full bg-red-600 px-4 py-2 text-white transition hover:bg-red-700 disabled:opacity-50"
          disabled={submitting}
        >
          {submitting ? 'Saving...' : fixture ? 'Update Fixture' : 'Create Fixture'}
        </button>
      </div>
    </form>
  );
};

export default FixtureCalendar;
