import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

const PlayerDashboard = () => {
  const { token, user } = useAuth();
  const { socket } = useSocket();
  const [profile, setProfile] = useState(null);
  const [equipment, setEquipment] = useState([]);
  const [injuries, setInjuries] = useState([]);
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchPlayerData();
    }
  }, [user]);

  // Listen for player-specific events
  useEffect(() => {
    if (!socket || !profile) return;

    const handleFineIssued = (data) => {
      console.log('Fine issued event received:', data);
      if (data.playerId === profile._id) {
        showToast('A fine has been issued to you', 'warning');
        fetchPlayerData();
      }
    };

    const handleInjuryLogged = (data) => {
      console.log('Injury logged event received:', data);
      if (data.playerId === profile._id) {
        showToast('An injury has been logged', 'warning');
        fetchPlayerData();
      }
    };

    const handleStatsUpdated = (data) => {
      console.log('Stats updated event received:', data);
      if (data.playerId === profile._id) {
        showToast('Your stats have been updated', 'success');
        fetchPlayerData();
      }
    };

    const handleInventoryAssigned = (data) => {
      console.log('Inventory assigned event received:', data);
      if (data.playerId === profile._id) {
        showToast('New equipment has been assigned to you', 'success');
        fetchPlayerData();
      }
    };

    socket.on('fine:issued', handleFineIssued);
    socket.on('injury:logged', handleInjuryLogged);
    socket.on('stats:updated', handleStatsUpdated);
    socket.on('inventory:assigned', handleInventoryAssigned);

    return () => {
      socket.off('fine:issued', handleFineIssued);
      socket.off('injury:logged', handleInjuryLogged);
      socket.off('stats:updated', handleStatsUpdated);
      socket.off('inventory:assigned', handleInventoryAssigned);
    };
  }, [socket, profile]);

  const fetchPlayerData = async () => {
    try {
      // Fetch profile
      const profileRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/profiles/${user.id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const profileData = await profileRes.json();
      if (profileData.success) {
        setProfile(profileData.profile);
      }

      // Fetch equipment
      const equipmentRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/inventory`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const equipmentData = await equipmentRes.json();
      if (equipmentData.success) {
        // Filter equipment assigned to this player
        const myEquipment = equipmentData.items.filter(
          item => item.assignedTo?._id === profileData.profile?._id
        );
        setEquipment(myEquipment);
      }

      // Fetch injuries
      const injuriesRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/injuries?resolved=false`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const injuriesData = await injuriesRes.json();
      if (injuriesData.success) {
        // Filter injuries for this player
        const myInjuries = injuriesData.injuries.filter(
          injury => injury.playerId?._id === profileData.profile?._id
        );
        setInjuries(myInjuries);
      }

      // Fetch fines
      const finesRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/disciplinary?isPaid=false`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const finesData = await finesRes.json();
      if (finesData.success) {
        // Filter fines for this player
        const myFines = finesData.actions.filter(
          action => action.playerId?._id === profileData.profile?._id
        );
        setFines(myFines);
      }

      setLoading(false);
    } catch (err) {
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
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
      <h2 className="text-2xl font-bold mb-6">My Dashboard</h2>

      {/* Toast Notification */}
      {toast && (
        <div className={`mb-4 p-4 rounded ${
          toast.type === 'error' ? 'bg-red-100 text-red-700' :
          toast.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
          'bg-green-100 text-green-700'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Profile</h3>
          {profile && (
            <div>
              <div className="mb-4">
                <div className="text-2xl font-bold">{profile.fullName}</div>
                <div className="text-gray-600">{profile.position}</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Fitness Status:</span>
                  <span className={`px-3 py-1 rounded text-sm font-semibold ${
                    profile.fitnessStatus === 'Green' ? 'bg-green-100 text-green-800' :
                    profile.fitnessStatus === 'Yellow' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {profile.fitnessStatus}
                  </span>
                </div>

                {profile.weight && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weight:</span>
                    <span>{profile.weight} kg</span>
                  </div>
                )}

                {profile.height && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Height:</span>
                    <span>{profile.height} cm</span>
                  </div>
                )}

                {profile.contractType && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contract Type:</span>
                    <span>{profile.contractType}</span>
                  </div>
                )}

                {profile.contractStart && profile.contractEnd && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contract Period:</span>
                    <span>
                      {new Date(profile.contractStart).toLocaleDateString()} - {new Date(profile.contractEnd).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Performance Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Statistics</h3>
          {profile?.stats && (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded">
                <div className="text-3xl font-bold text-blue-600">{profile.stats.goals || 0}</div>
                <div className="text-sm text-gray-600">Goals</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded">
                <div className="text-3xl font-bold text-green-600">{profile.stats.assists || 0}</div>
                <div className="text-sm text-gray-600">Assists</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded">
                <div className="text-3xl font-bold text-purple-600">{profile.stats.appearances || 0}</div>
                <div className="text-sm text-gray-600">Appearances</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded">
                <div className="text-3xl font-bold text-yellow-600">{profile.stats.rating?.toFixed(1) || '0.0'}</div>
                <div className="text-sm text-gray-600">Rating</div>
              </div>
            </div>
          )}
        </div>

        {/* Assigned Equipment */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">My Equipment</h3>
          {equipment.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No equipment assigned</p>
          ) : (
            <div className="space-y-2">
              {equipment.map(item => (
                <div key={item._id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{item.itemName}</div>
                    <div className="text-sm text-gray-600">{item.itemType}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Assigned: {new Date(item.assignedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Injuries */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Active Injuries</h3>
          {injuries.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No active injuries</p>
          ) : (
            <div className="space-y-3">
              {injuries.map(injury => (
                <div key={injury._id} className="p-3 bg-red-50 border border-red-200 rounded">
                  <div className="font-medium text-red-800">{injury.injuryType}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Severity: <span className={`font-semibold ${
                      injury.severity === 'Minor' ? 'text-yellow-600' :
                      injury.severity === 'Moderate' ? 'text-orange-600' :
                      'text-red-600'
                    }`}>{injury.severity}</span>
                  </div>
                  {injury.expectedRecovery && (
                    <div className="text-sm text-gray-600">
                      Expected Recovery: {new Date(injury.expectedRecovery).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Fines */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Pending Fines</h3>
          {fines.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No pending fines</p>
          ) : (
            <div className="space-y-3">
              {fines.map(fine => (
                <div key={fine._id} className="flex justify-between items-center p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <div>
                    <div className="font-medium">{fine.offense}</div>
                    <div className="text-sm text-gray-600">
                      Issued: {new Date(fine.dateIssued).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-xl font-bold text-yellow-700">
                    ${fine.fineAmount?.toLocaleString()}
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center p-4 bg-gray-100 rounded font-bold">
                <span>Total Pending:</span>
                <span className="text-xl text-red-600">
                  ${fines.reduce((sum, fine) => sum + (fine.fineAmount || 0), 0).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerDashboard;
