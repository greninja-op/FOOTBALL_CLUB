import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import FloatingNotice from './FloatingNotice';

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

    // Client-side reason length check (schema requires min 10 chars)
    if (formData.reason.trim().length < 10) {
      setError('Reason must be at least 10 characters long');
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
        // Show the actual server validation message (e.g. minlength error)
        setError(data.message || data.error || 'Failed to submit leave request');
      }
    } catch (err) {
      setError('Network error — could not reach the server. Please try again.');
    }
  };

  if (loading) {
    return <div className="p-4 text-gray-300">Loading...</div>;
  }

  return (
    <div className="p-4">
      <FloatingNotice message={toast?.message || error || success} type={toast?.type || (error ? 'error' : 'success')} />

      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/45">Player Requests</p>
          <p className="mt-1 text-sm text-gray-400">Create and review leave requests inside the same card system.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-full border border-red-500/30 bg-red-600/90 px-4 py-2 text-sm text-white transition hover:bg-red-700"
        >
          {showForm ? 'Cancel' : 'New Request'}
        </button>
      </div>

      <div className="ui-inline-expand mb-4" data-open={showForm}>
        <div className="ui-expand-card p-4">
          <h3 className="text-sm font-semibold mb-3 text-white">Submit Leave Request</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="ui-field"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="ui-field"
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Reason * <span className="text-gray-500 font-normal">(minimum 10 characters)</span>
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="ui-textarea"
                rows="4"
                minLength={10}
                maxLength={500}
                placeholder="Please provide a reason for your leave request..."
                required
              />
              <div className={`text-xs mt-1 text-right ${
                formData.reason.length < 10 ? 'text-red-400' : 'text-gray-500'
              }`}>
                {formData.reason.length}/500
                {formData.reason.length < 10 && formData.reason.length > 0 && (
                  <span className="ml-2">({10 - formData.reason.length} more characters needed)</span>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 text-white py-1.5 px-3 rounded hover:bg-red-700 text-sm transition"
            >
              Submit Request
            </button>
          </form>
        </div>
      </div>

      {/* Leave Request History */}
      <div className="bg-gray-800/40 backdrop-blur-sm border border-white/10 rounded-lg">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white">Request History</h3>
        </div>
        
        {requests.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">
            No leave requests yet
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {requests
              .sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate))
              .map(request => {
                const startDate = new Date(request.startDate);
                const endDate = new Date(request.endDate);
                const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                
                return (
                  <div key={request._id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-base text-white">
                          {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {duration} {duration === 1 ? 'day' : 'days'}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        request.status === 'Approved' ? 'bg-green-900/40 border border-green-500/30 text-green-200' :
                        request.status === 'Denied' ? 'bg-red-900/40 border border-red-500/30 text-red-200' :
                        'bg-yellow-900/40 border border-yellow-500/30 text-yellow-200'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    
                    <div className="text-gray-300 text-sm">
                      <strong>Reason:</strong> {request.reason}
                    </div>

                    {request.reviewedBy && (
                      <div className="mt-1.5 text-xs text-gray-500">
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
