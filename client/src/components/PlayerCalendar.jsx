import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const PlayerCalendar = () => {
  const { token, user } = useAuth();
  const [fixtures, setFixtures] = useState([]);
  const [trainingSessions, setTrainingSessions] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('fixtures');

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    try {
      // Fetch fixtures
      const fixturesRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/fixtures`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const fixturesData = await fixturesRes.json();
      if (fixturesData.success) {
        setFixtures(fixturesData.fixtures);
      }

      // Fetch training sessions
      const trainingRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/training`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const trainingData = await trainingRes.json();
      if (trainingData.success) {
        setTrainingSessions(trainingData.sessions);
      }

      // Fetch leave requests
      const leaveRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/leave`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const leaveData = await leaveRes.json();
      if (leaveData.success) {
        // Filter approved leave requests
        const approvedLeave = leaveData.requests.filter(
          req => req.status === 'Approved'
        );
        setLeaveRequests(approvedLeave);
      }

      setLoading(false);
    } catch (err) {
      setError('Failed to load calendar data');
      setLoading(false);
    }
  };

  const isDateInLeave = (date) => {
    return leaveRequests.some(leave => {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      const checkDate = new Date(date);
      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">My Calendar</h2>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('fixtures')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
              activeTab === 'fixtures'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Fixtures ({fixtures.length})
          </button>
          <button
            onClick={() => setActiveTab('training')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
              activeTab === 'training'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Training ({trainingSessions.length})
          </button>
        </nav>
      </div>

      {/* Fixtures Tab */}
      {activeTab === 'fixtures' && (
        <div className="space-y-4">
          {fixtures.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No upcoming fixtures
            </div>
          ) : (
            fixtures
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map(fixture => {
                const fixtureDate = new Date(fixture.date);
                const isExcused = isDateInLeave(fixture.date);
                
                return (
                  <div
                    key={fixture._id}
                    className={`bg-white rounded-lg shadow p-6 ${
                      isExcused ? 'border-l-4 border-yellow-500' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold">vs {fixture.opponent}</h3>
                          {isExcused && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                              EXCUSED
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 text-gray-600">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{fixtureDate.toLocaleDateString()} at {fixtureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{fixture.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded">
                          {fixture.matchType}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}

      {/* Training Tab */}
      {activeTab === 'training' && (
        <div className="space-y-4">
          {trainingSessions.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No upcoming training sessions
            </div>
          ) : (
            trainingSessions
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map(session => {
                const sessionDate = new Date(session.date);
                const isExcused = isDateInLeave(session.date);
                
                return (
                  <div
                    key={session._id}
                    className={`bg-white rounded-lg shadow p-6 ${
                      isExcused ? 'border-l-4 border-yellow-500' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold">Training Session</h3>
                          {isExcused && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                              EXCUSED
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 text-gray-600">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{sessionDate.toLocaleDateString()} at {sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{session.duration} minutes</span>
                          </div>
                        </div>
                        <div className="mt-3 text-sm text-gray-700">
                          <strong>Drills:</strong> {session.drillDescription}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}
    </div>
  );
};

export default PlayerCalendar;
