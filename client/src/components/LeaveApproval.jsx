import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LeaveApproval = () => {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/leave?status=Pending`,
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

  const handleApprove = async (requestId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/leave/${requestId}/approve`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Leave request approved');
        setShowConfirmModal(false);
        setSelectedRequest(null);
        fetchRequests();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to approve request');
      }
    } catch (err) {
      setError('Failed to approve request');
    }
  };

  const handleDeny = async (requestId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/leave/${requestId}/deny`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Leave request denied');
        setShowConfirmModal(false);
        setSelectedRequest(null);
        fetchRequests();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to deny request');
      }
    } catch (err) {
      setError('Failed to deny request');
    }
  };

  const openConfirmModal = (request, type) => {
    setSelectedRequest(request);
    setActionType(type);
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    if (actionType === 'approve') {
      handleApprove(selectedRequest._id);
    } else {
      handleDeny(selectedRequest._id);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Leave Request Approval</h2>

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

      {/* Pending Requests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No pending leave requests
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map(request => {
                const startDate = new Date(request.startDate);
                const endDate = new Date(request.endDate);
                const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                
                return (
                  <tr key={request._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{request.playerId?.fullName}</div>
                      <div className="text-sm text-gray-500">{request.playerId?.position}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {startDate.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {endDate.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {duration} {duration === 1 ? 'day' : 'days'}
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="truncate">{request.reason}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openConfirmModal(request, 'approve')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openConfirmModal(request, 'deny')}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          Deny
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {actionType === 'approve' ? 'Approve' : 'Deny'} Leave Request
            </h3>
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                <span className="font-medium">Player:</span> {selectedRequest.playerId?.fullName}
              </p>
              <p className="text-gray-700 mb-2">
                <span className="font-medium">Dates:</span>{' '}
                {new Date(selectedRequest.startDate).toLocaleDateString()} -{' '}
                {new Date(selectedRequest.endDate).toLocaleDateString()}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Reason:</span> {selectedRequest.reason}
              </p>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to {actionType} this leave request?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleConfirm}
                className={`flex-1 text-white py-2 px-4 rounded ${
                  actionType === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm {actionType === 'approve' ? 'Approval' : 'Denial'}
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedRequest(null);
                  setError('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveApproval;
