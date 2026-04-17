import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const PlayerCalendar = () => {
  const { token } = useAuth();
  const [fixtures, setFixtures] = useState([]);
  const [trainingSessions, setTrainingSessions] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [equipment, setEquipment] = useState([]);
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

      const profileRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/profiles/me`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const profileData = await profileRes.json();

      const equipmentRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/inventory`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const equipmentData = await equipmentRes.json();
      if (profileData.success && equipmentData.success) {
        setEquipment(
          equipmentData.items.filter(
            (item) => String(item.assignedTo?._id || item.assignedTo) === String(profileData.profile?._id)
          )
        );
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
    return <div className="p-4 text-gray-300">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-900/40 border border-red-500/30 text-red-200 px-3 py-2 rounded text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-white">My Calendar</h2>

      {/* Tab Navigation */}
      <div className="mb-4 border-b border-white/10">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('fixtures')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              activeTab === 'fixtures'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
            }`}
          >
            Fixtures ({fixtures.length})
          </button>
          <button
            onClick={() => setActiveTab('training')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              activeTab === 'training'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
            }`}
          >
            Training ({trainingSessions.length})
          </button>
          <button
            onClick={() => setActiveTab('gear')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              activeTab === 'gear'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
            }`}
          >
            My Gear ({equipment.length})
          </button>
        </nav>
      </div>

      {/* Fixtures Tab */}
      {activeTab === 'fixtures' && (
        <div className="space-y-3">
          {fixtures.length === 0 ? (
            <div className="bg-gray-800/40 backdrop-blur-sm border border-white/10 rounded-lg p-6 text-center text-gray-400 text-sm">
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
                    className={`bg-gray-800/40 backdrop-blur-sm border border-white/10 rounded-lg p-4 ${
                      isExcused ? 'border-l-4 border-yellow-500' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-white">vs {fixture.opponent}</h3>
                          {isExcused && (
                            <span className="px-2 py-0.5 bg-yellow-900/40 border border-yellow-500/30 text-yellow-200 text-xs font-semibold rounded">
                              EXCUSED
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 text-gray-400 text-sm">
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
                        <span className="inline-block px-2 py-1 bg-blue-900/40 border border-blue-500/30 text-blue-200 text-xs font-semibold rounded">
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
        <div className="space-y-3">
          {trainingSessions.length === 0 ? (
            <div className="bg-gray-800/40 backdrop-blur-sm border border-white/10 rounded-lg p-6 text-center text-gray-400 text-sm">
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
                    className={`bg-gray-800/40 backdrop-blur-sm border border-white/10 rounded-lg p-4 ${
                      isExcused ? 'border-l-4 border-yellow-500' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-base font-bold text-white">Training Session</h3>
                          {isExcused && (
                            <span className="px-2 py-0.5 bg-yellow-900/40 border border-yellow-500/30 text-yellow-200 text-xs font-semibold rounded">
                              EXCUSED
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 text-gray-400 text-sm">
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
                        <div className="mt-2 text-xs text-gray-300">
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

      {/* Gear Tab */}
      {activeTab === 'gear' && (
        <div className="space-y-3">
          {equipment.length === 0 ? (
            <div className="bg-gray-800/40 backdrop-blur-sm border border-white/10 rounded-lg p-6 text-center text-gray-400 text-sm">
              No equipment assigned
            </div>
          ) : (
            equipment.map((item) => (
              <div key={item._id} className="bg-gray-800/40 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white">{item.itemName}</h3>
                    <p className="text-sm text-gray-400">{item.itemType}</p>
                  </div>
                  <div className="rounded-full border border-emerald-500/30 bg-emerald-900/30 px-3 py-1 text-xs font-semibold text-emerald-200">
                    Assigned {item.assignedAt ? new Date(item.assignedAt).toLocaleDateString() : 'recently'}
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

export default PlayerCalendar;
