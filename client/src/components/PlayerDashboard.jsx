import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import PlayerSpotlightCard from './PlayerSpotlightCard';

const matchesAnyId = (candidate, ids) => {
  if (!candidate) return false;
  return ids.some((id) => id && String(id) === String(candidate));
};

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

    const profileIds = [
      profile._id,
      profile.id,
      profile.userId?._id,
      profile.userId,
      profile.playerDomain?.playerId,
      user?.id
    ];

    const handleFineIssued = (data) => {
      console.log('Fine issued event received:', data);
      if (matchesAnyId(data.playerId, profileIds)) {
        showToast('A fine has been issued to you', 'warning');
        fetchPlayerData();
      }
    };

    const handleInjuryLogged = (data) => {
      console.log('Injury logged event received:', data);
      if (matchesAnyId(data.playerId, profileIds)) {
        showToast('An injury has been logged', 'warning');
        fetchPlayerData();
      }
    };

    const handleStatsUpdated = (data) => {
      console.log('Stats updated event received:', data);
      if (matchesAnyId(data.playerId, profileIds)) {
        showToast('Your stats have been updated', 'success');
        fetchPlayerData();
      }
    };

    const handleInventoryAssigned = (data) => {
      console.log('Inventory assigned event received:', data);
      if (matchesAnyId(data.playerId, profileIds)) {
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
        `${import.meta.env.VITE_API_URL}/api/profiles/me`,
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
      <h2 className="text-xl font-bold mb-4 text-white">My Dashboard</h2>

      {/* Toast Notification */}
      {toast && (
        <div className={`mb-4 p-3 rounded text-sm ${
          toast.type === 'error' ? 'bg-red-900/40 border border-red-500/30 text-red-200' :
          toast.type === 'warning' ? 'bg-yellow-900/40 border border-yellow-500/30 text-yellow-200' :
          'bg-green-900/40 border border-green-500/30 text-green-200'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Profile Card */}
        <div className="bg-gray-800/40 backdrop-blur-sm border border-white/10 rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3 text-white">Profile</h3>
          {profile && (
            <div>
              <div className="mb-6">
                <PlayerSpotlightCard player={profile} />
              </div>

              <div className="mb-3">
                <div className="text-lg font-bold text-white">{profile.fullName}</div>
                <div className="text-gray-400 text-sm">{profile.displayPosition || profile.position}</div>
              </div>

              <div className="space-y-1.5 text-sm">
                {profile.playerDomain?.activeMembership?.jerseyNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Jersey Number:</span>
                    <span className="text-white">#{profile.playerDomain.activeMembership.jerseyNumber}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-400">Player Status:</span>
                  <span className="text-white">{profile.playerDomain?.status || profile.playerStatus || 'active'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Availability:</span>
                  <span className="text-white">{profile.availabilityStatus || 'available'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Fitness Status:</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    profile.fitnessStatus === 'Green' ? 'bg-green-900/40 text-green-200 border border-green-500/30' :
                    profile.fitnessStatus === 'Yellow' ? 'bg-yellow-900/40 text-yellow-200 border border-yellow-500/30' :
                    'bg-red-900/40 text-red-200 border border-red-500/30'
                  }`}>
                    {profile.fitnessStatus}
                  </span>
                </div>

                {profile.weight && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Weight:</span>
                    <span className="text-white">{profile.weight} kg</span>
                  </div>
                )}

                {profile.height && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Height:</span>
                    <span className="text-white">{profile.height} cm</span>
                  </div>
                )}

                {profile.playerDomain?.activeMembership?.squadRole && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Squad Role:</span>
                    <span className="text-white capitalize">{profile.playerDomain.activeMembership.squadRole}</span>
                  </div>
                )}

                {profile.contract?.contractType && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Contract Type:</span>
                    <span className="text-white">{profile.contract.contractType}</span>
                  </div>
                )}

                {profile.contract?.contractStart && profile.contract?.contractEnd && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Contract Period:</span>
                    <span className="text-white text-xs">
                      {new Date(profile.contract.contractStart).toLocaleDateString()} - {new Date(profile.contract.contractEnd).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Performance Stats */}
        <div className="bg-gray-800/40 backdrop-blur-sm border border-white/10 rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3 text-white">Performance Statistics</h3>
          {profile?.stats && (
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-blue-900/40 border border-blue-500/30 rounded">
                <div className="text-2xl font-bold text-blue-200">{profile.stats.goals || 0}</div>
                <div className="text-xs text-gray-400">Goals</div>
              </div>
              <div className="text-center p-3 bg-green-900/40 border border-green-500/30 rounded">
                <div className="text-2xl font-bold text-green-200">{profile.stats.assists || 0}</div>
                <div className="text-xs text-gray-400">Assists</div>
              </div>
              <div className="text-center p-3 bg-purple-900/40 border border-purple-500/30 rounded">
                <div className="text-2xl font-bold text-purple-200">{profile.stats.appearances || 0}</div>
                <div className="text-xs text-gray-400">Appearances</div>
              </div>
              <div className="text-center p-3 bg-yellow-900/40 border border-yellow-500/30 rounded">
                <div className="text-2xl font-bold text-yellow-200">{profile.stats.rating?.toFixed(1) || '0.0'}</div>
                <div className="text-xs text-gray-400">Rating</div>
              </div>
              <div className="text-center p-3 bg-sky-900/40 border border-sky-500/30 rounded">
                <div className="text-2xl font-bold text-sky-200">{profile.stats.minutes || 0}</div>
                <div className="text-xs text-gray-400">Minutes</div>
              </div>
              <div className="text-center p-3 bg-amber-900/40 border border-amber-500/30 rounded">
                <div className="text-2xl font-bold text-amber-200">{profile.stats.yellowCards || 0}</div>
                <div className="text-xs text-gray-400">Yellow Cards</div>
              </div>
              <div className="text-center p-3 bg-rose-900/40 border border-rose-500/30 rounded">
                <div className="text-2xl font-bold text-rose-200">{profile.stats.redCards || 0}</div>
                <div className="text-xs text-gray-400">Red Cards</div>
              </div>
            </div>
          )}
        </div>

        {/* Assigned Equipment */}
        <div className="bg-gray-800/40 backdrop-blur-sm border border-white/10 rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3 text-white">My Equipment</h3>
          {equipment.length === 0 ? (
            <p className="text-gray-400 text-center py-4 text-sm">No equipment assigned</p>
          ) : (
            <div className="space-y-2">
              {equipment.map(item => (
                <div key={item._id} className="flex justify-between items-center p-2.5 bg-gray-700/20 rounded">
                  <div>
                    <div className="font-medium text-white text-sm">{item.itemName}</div>
                    <div className="text-xs text-gray-400">{item.itemType}</div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Assigned: {new Date(item.assignedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Injuries */}
        <div className="bg-gray-800/40 backdrop-blur-sm border border-white/10 rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3 text-white">Active Injuries</h3>
          {injuries.length === 0 ? (
            <p className="text-gray-400 text-center py-4 text-sm">No active injuries</p>
          ) : (
            <div className="space-y-2">
              {injuries.map(injury => (
                <div key={injury._id} className="p-2.5 bg-red-900/40 border border-red-500/30 rounded">
                  <div className="font-medium text-red-200 text-sm">{injury.injuryType}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Severity: <span className={`font-semibold ${
                      injury.severity === 'Minor' ? 'text-yellow-400' :
                      injury.severity === 'Moderate' ? 'text-orange-400' :
                      'text-red-400'
                    }`}>{injury.severity}</span>
                  </div>
                  {injury.expectedRecovery && (
                    <div className="text-xs text-gray-400">
                      Expected Recovery: {new Date(injury.expectedRecovery).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Fines */}
        <div className="bg-gray-800/40 backdrop-blur-sm border border-white/10 rounded-lg p-4 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-3 text-white">Pending Fines</h3>
          {fines.length === 0 ? (
            <p className="text-gray-400 text-center py-4 text-sm">No pending fines</p>
          ) : (
            <div className="space-y-2">
              {fines.map(fine => (
                <div key={fine._id} className="flex justify-between items-center p-3 bg-yellow-900/40 border border-yellow-500/30 rounded">
                  <div>
                    <div className="font-medium text-white text-sm">{fine.offense}</div>
                    <div className="text-xs text-gray-400">
                      Issued: {new Date(fine.dateIssued).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-lg font-bold text-yellow-200">
                    ${fine.fineAmount?.toLocaleString()}
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center p-3 bg-gray-700/20 rounded font-bold">
                <span className="text-white text-sm">Total Pending:</span>
                <span className="text-lg text-red-400">
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
