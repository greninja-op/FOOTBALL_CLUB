import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FloatingNotice from './FloatingNotice';
import UiButton from './ui/UiButton';

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
    return <div className="p-4 text-gray-400">Loading...</div>;
  }

  return (
    <div className="p-4">
      <FloatingNotice message={error || success} type={error ? 'error' : 'success'} />
      <h2 className="text-xl font-bold mb-4 text-white">Leave Request Approval</h2>

      {/* Pending Requests Table */}
      <div className="bg-gray-800/40 backdrop-blur-sm border border-white/10 rounded-lg shadow overflow-hidden">
        {requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No pending leave requests
          </div>
        ) : (
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-gray-900/40">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase">Player</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase">Start Date</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase">End Date</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase">Duration</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase">Reason</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800/20 divide-y divide-white/10">
              {requests.map(request => {
                const startDate = new Date(request.startDate);
                const endDate = new Date(request.endDate);
                const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                
                return (
                  <tr key={request._id} className="hover:bg-gray-700/20">
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="font-medium text-white">{request.playerId?.fullName}</div>
                      <div className="text-sm text-gray-400">{request.playerId?.position}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-gray-300">
                      {startDate.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-gray-300">
                      {endDate.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-gray-300">
                      {duration} {duration === 1 ? 'day' : 'days'}
                    </td>
                    <td className="px-4 py-2.5 max-w-xs">
                      <div className="truncate text-gray-300">{request.reason}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="flex gap-2">
                        <UiButton
                          onClick={() => openConfirmModal(request, 'approve')}
                          variant="success"
                          size="sm"
                        >
                          Approve
                        </UiButton>
                        <UiButton
                          onClick={() => openConfirmModal(request, 'deny')}
                          variant="danger"
                          size="sm"
                        >
                          Deny
                        </UiButton>
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
          <div className="bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-lg p-4 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-white">
              {actionType === 'approve' ? 'Approve' : 'Deny'} Leave Request
            </h3>
            <div className="mb-6">
              <p className="text-gray-300 mb-2">
                <span className="font-medium">Player:</span> {selectedRequest.playerId?.fullName}
              </p>
              <p className="text-gray-300 mb-2">
                <span className="font-medium">Dates:</span>{' '}
                {new Date(selectedRequest.startDate).toLocaleDateString()} -{' '}
                {new Date(selectedRequest.endDate).toLocaleDateString()}
              </p>
              <p className="text-gray-300">
                <span className="font-medium">Reason:</span> {selectedRequest.reason}
              </p>
            </div>
            <p className="text-gray-400 mb-6">
              Are you sure you want to {actionType} this leave request?
            </p>
            <div className="flex gap-2">
              <UiButton
                onClick={handleConfirm}
                variant={actionType === 'approve' ? 'success' : 'danger'}
                className="flex-1"
              >
                Confirm {actionType === 'approve' ? 'Approval' : 'Denial'}
              </UiButton>
              <UiButton
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedRequest(null);
                  setError('');
                }}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </UiButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveApproval;
