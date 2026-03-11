import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

const LeaveRequestForm = () => {
  const { token, user } = useAuth();
  const { socket } = useSocket();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  // Listen for leave:approved and leave:denied events
  useEffect(() => {
    if (!socket || !user) return;

    const handleLeaveApproved = (data) => {
      console.log('Leave approved event received:', data);
      if (data.playerId === user.id) {
        showToast('Your leave request has been approved', 'success');
        fetchRequests();
      }
    };

    const handleLeaveDenied = (data) => {
      console.log('Leave denied event received:', data);
      if (data.playerId === user.id) {
        showToast('Your leave request has been denied', 'error');
        fetchRequests();
      }
    };

    socket.on('leave:approved', handleLeaveApproved);
    socket.on('leave:denied', handleLeaveDenied);

    return () => {
      socket.off('leave:approved', handleLeaveApproved);
      socket.off('leave:denied', handleLeaveDenied);
    };
  }, [socket, user]);

  const fetchRequests = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/leave`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const data = await response.json();
      if (data.success) {
        setRequests(data.requests);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to load leave requests');
      setLoading(false);
    }
  };

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate date range
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (endDate < startDate) {
      setError('End date must be on or after start date');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/leave`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Leave request submitted successfully');
        setShowForm(false);
        setFormData({ startDate: '', endDate: '', reason: '' });
        fetchRequests();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to submit leave request');
      }
    } catch (err) {
      setError('Failed to submit leave request');
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Leave Requests</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'New Request'}
        </button>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`mb-4 p-4 rounded ${
          toast.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {toast.message}
        </div>
      )}

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

      {/* Leave Request Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Submit Leave Request</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason *
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="4"
                placeholder="Please provide a reason for your leave request..."
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Submit Request
            </button>
          </form>
        </div>
      )}

      {/* Leave Request History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Request History</h3>
        </div>
        
        {requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No leave requests yet
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {requests
              .sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate))
              .map(request => {
                const startDate = new Date(request.startDate);
                const endDate = new Date(request.endDate);
                const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                
                return (
                  <div key={request._id} className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-medium text-lg">
                          {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {duration} {duration === 1 ? 'day' : 'days'}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded text-sm font-semibold ${
                        request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        request.status === 'Denied' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    
                    <div className="text-gray-700">
                      <strong>Reason:</strong> {request.reason}
                    </div>

                    {request.reviewedBy && (
                      <div className="mt-2 text-sm text-gray-500">
                        Reviewed by: {request.reviewedBy.email || 'Coach'}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveRequestForm;
