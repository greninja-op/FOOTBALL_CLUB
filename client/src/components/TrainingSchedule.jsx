import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import FloatingNotice from './FloatingNotice';
import UiButton from './ui/UiButton';
import UiCalendarInput from './ui/UiCalendarInput';

const getDisplayPosition = (player) => (
  player.playerDomain?.activeMembership?.primaryPosition
  || player.preferredPosition
  || player.position
  || 'N/A'
);

const TrainingSchedule = () => {
  const { token } = useAuth();
  const { socket } = useSocket();
  const [sessions, setSessions] = useState([]);
  const [players, setPlayers] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    date: '',
    drillDescription: '',
    duration: 90
  });

  useEffect(() => {
    fetchSessions();
    fetchPlayers();
    fetchLeaveRequests();
  }, []);

  // Listen for leave:approved events to update calendar
  useEffect(() => {
    if (!socket) return;

    const handleLeaveApproved = (data) => {
      console.log('Leave approved event received:', data);
      // Refetch leave requests to show new approved leave as "Excused" marker
      fetchLeaveRequests();
    };

    socket.on('leave:approved', handleLeaveApproved);

    return () => {
      socket.off('leave:approved', handleLeaveApproved);
    };
  }, [socket]);

  const fetchSessions = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/training`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setSessions(data.sessions);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to load training sessions');
      setLoading(false);
    }
  };

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
      console.error('Failed to load players');
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/leave/approved`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setLeaveRequests(data.requests);
      }
    } catch (err) {
      console.error('Failed to load leave requests');
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setError('');

    // Validate date is not in the past
    const sessionDate = new Date(formData.date);
    if (sessionDate < new Date()) {
      setError('Training date cannot be in the past');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/training`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Training session created successfully');
        setShowCreateForm(false);
        setFormData({ date: '', drillDescription: '', duration: 90 });
        fetchSessions();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to create training session');
      }
    } catch (err) {
      setError('Failed to create training session');
    }
  };

  const markAttendance = async (sessionId, playerId, status) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/training/${sessionId}/attendance`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ playerId, status })
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Attendance marked successfully');
        fetchSessions();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to mark attendance');
      }
    } catch (err) {
      setError('Failed to mark attendance');
    }
  };

  const isPlayerOnLeave = (playerId, sessionDate) => {
    return leaveRequests.some(leave => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const session = new Date(sessionDate);
      return leave.playerId._id === playerId && session >= start && session <= end;
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="text-gray-400">Loading...</div>
    </div>;
  }

  return (
    <div className="p-4">
      <FloatingNotice message={error || success} type={error ? 'error' : 'success'} />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Training Schedule</h2>
        <UiButton
          onClick={() => setShowCreateForm((current) => !current)}
          variant={showCreateForm ? 'secondary' : 'primary'}
        >
          {showCreateForm ? 'Close Form' : 'Create Session'}
        </UiButton>
      </div>

      <div className="ui-inline-expand mb-4" data-open={showCreateForm}>
        <div className="ui-expand-card p-4">
          <h3 className="mb-3 text-lg font-semibold text-white">Create Training Session</h3>
          <form onSubmit={handleCreateSession}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date & Time
              </label>
              <UiCalendarInput
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Drill Description
              </label>
              <textarea
                value={formData.drillDescription}
                onChange={(e) => setFormData({ ...formData, drillDescription: e.target.value })}
                className="ui-textarea"
                rows="3"
                minLength="10"
                maxLength="500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                className="ui-field"
                min="30"
                max="300"
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <UiButton type="submit" variant="primary">
                Create
              </UiButton>
              <UiButton
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setFormData({ date: '', drillDescription: '', duration: 90 });
                  setError('');
                }}
                variant="secondary"
              >
                Cancel
              </UiButton>
            </div>
          </form>
        </div>
      </div>

      {/* Training Sessions Calendar */}
      <div className="bg-gray-800/40 backdrop-blur-sm border border-white/10 rounded-lg shadow">
        {sessions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No training sessions scheduled
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {sessions.map(session => (
              <div key={session.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-lg text-white">
                      {new Date(session.date).toLocaleDateString()} at {new Date(session.date).toLocaleTimeString()}
                    </div>
                    <div className="text-gray-400 mt-1">{session.drillDescription}</div>
                    <div className="text-sm text-gray-500 mt-1">Duration: {session.duration} minutes</div>
                  </div>
                  <UiButton
                    onClick={() => setSelectedSession(selectedSession === session.id ? null : session.id)}
                    variant="ghost"
                    size="sm"
                  >
                    {selectedSession === session.id ? 'Hide' : 'Mark'} Attendance
                  </UiButton>
                </div>

                {/* Attendance Tracker */}
                {selectedSession === session.id && (
                  <div className="mt-4 bg-gray-700/20 border border-white/10 p-4 rounded">
                    <h4 className="font-medium mb-3 text-white">Attendance</h4>
                    <div className="space-y-2">
                      {players.map(player => {
                        const attendance = session.attendees?.find(a => a.playerId === player._id);
                        const onLeave = isPlayerOnLeave(player._id, session.date);
                        
                        return (
                          <div key={player._id} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div>
                                <div className="text-white">{player.fullName}</div>
                                <div className="text-xs text-gray-500">
                                  {getDisplayPosition(player)}
                                </div>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded border ${
                                player.availabilityStatus === 'manual-unavailable' || player.availabilityStatus === 'injured' || player.availabilityStatus === 'leave'
                                  ? 'bg-red-900/40 text-red-200 border-red-500/30'
                                  : player.availabilityStatus === 'listed' || player.availabilityStatus === 'suspended'
                                  ? 'bg-yellow-900/40 text-yellow-200 border-yellow-500/30'
                                  : 'bg-green-900/40 text-green-200 border-green-500/30'
                              }`}>
                                {player.availabilityStatus || 'available'}
                              </span>
                              {onLeave && (
                                <span className="text-xs bg-blue-900/40 text-blue-200 border border-blue-500/30 px-2 py-1 rounded">
                                  On Leave (Excused)
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {['Present', 'Absent', 'Excused'].map(status => (
                                <UiButton
                                  key={status}
                                  onClick={() => markAttendance(session.id, player._id, status)}
                                  variant={attendance?.status === status ? 'primary' : 'secondary'}
                                  size="sm"
                                >
                                  {status}
                                </UiButton>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default TrainingSchedule;
