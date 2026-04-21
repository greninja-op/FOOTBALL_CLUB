import { useState, useEffect } from 'react';
import FloatingNotice from './FloatingNotice';
import UiButton from './ui/UiButton';
import UiSelect from './ui/UiSelect';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch users
  const fetchUsers = async () => {
    try {
      if (initialFetchDone) {
        setPageLoading(true);
      } else {
        setLoading(true);
      }

      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users?page=${page}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      setUsers(data.users);
      setTotalPages(data.pagination.pages);
      setError(null);
    } catch (err) {
      setError(err.message);
      showToast('Error fetching users', 'error');
    } finally {
      setLoading(false);
      setPageLoading(false);
      setInitialFetchDone(true);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Delete user
  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to delete user');

      showToast('User deleted successfully');
      fetchUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredUsers = normalizedSearchTerm
    ? users.filter((user) => {
        const fullName = user.profile?.fullName || '';
        return (
          user.email?.toLowerCase().includes(normalizedSearchTerm)
          || user.role?.toLowerCase().includes(normalizedSearchTerm)
          || fullName.toLowerCase().includes(normalizedSearchTerm)
        );
      })
    : users;

  return (
    <div className="p-4 transition-all duration-300">
      <FloatingNotice message={toast?.message} type={toast?.type} />

      <div className="mb-4 flex justify-between items-center gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/45">System Access</p>
          <p className="mt-1 text-sm text-gray-400">Manage system users and roles</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-full min-w-[15rem] max-w-[18rem]">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="ui-field"
              placeholder="Search by name, email, or role"
            />
          </div>
          <UiButton
            onClick={() => setShowCreateForm((current) => !current)}
            variant="primary"
            className="px-4"
          >
            {showCreateForm ? 'Close Form' : 'Create User'}
          </UiButton>
        </div>
      </div>

      <div className="ui-inline-expand mb-4" data-open={showCreateForm}>
        <div className="ui-expand-card">
          <div className="border-b border-white/10 px-6 py-4">
            <h3 className="text-xl font-bold text-white">Create New User</h3>
            <p className="mt-1 text-sm text-gray-400">
              Fill in the details below. This panel expands the card so the full form stays visible.
            </p>
          </div>
          <div className="px-6 py-5">
            <CreateUserPanel
              onClose={() => setShowCreateForm(false)}
              onSuccess={() => {
                setShowCreateForm(false);
                fetchUsers();
                showToast('User created successfully');
              }}
              onError={(msg) => showToast(msg, 'error')}
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading && users.length === 0 ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : (
        <>
          {error && (
            <div className="mb-3 rounded-xl border border-red-500/30 bg-red-900/25 px-4 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="relative bg-gray-800/40 backdrop-blur-sm border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
            {pageLoading && (
              <div className="absolute inset-x-0 top-0 z-10 border-b border-white/10 bg-gray-900/80 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/70">
                Updating users...
              </div>
            )}

            <table className={`min-w-full transition-opacity ${pageLoading ? 'opacity-65' : 'opacity-100'}`}>
              <thead className="bg-gray-900/60 border-b border-white/10">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Full Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-400">
                      No users match your search.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        user.role === 'admin' ? 'bg-purple-900/40 text-purple-300 border border-purple-500/30' :
                        user.role === 'manager' ? 'bg-blue-900/40 text-blue-300 border border-blue-500/30' :
                        user.role === 'coach' ? 'bg-green-900/40 text-green-300 border border-green-500/30' :
                        'bg-gray-900/40 text-gray-300 border border-gray-500/30'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-300">
                      {user.profile?.fullName || 'N/A'}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditModal(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 mr-3 transition-colors text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-400 hover:text-red-300 transition-colors text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-3 flex justify-center gap-2">
            <UiButton
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || pageLoading}
              variant="secondary"
              size="sm"
            >
              Previous
            </UiButton>
            <span className="px-3 py-1 text-sm text-gray-300">
              Page {page} of {totalPages}
            </span>
            <UiButton
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || pageLoading}
              variant="secondary"
              size="sm"
            >
              Next
            </UiButton>
          </div>
        </>
      )}

      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedUser(null);
            fetchUsers();
            showToast('User updated successfully');
          }}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}
    </div>
  );
};

// Create User Panel Component
const CreateUserPanel = ({ onClose, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'player',
    fullName: '',
    position: 'Midfielder'
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('authToken');
      const payload = { ...formData };
      // Don't send position for non-player roles
      if (formData.role !== 'player') {
        delete payload.position;
      }
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create user');
      }

      onSuccess();
    } catch (err) {
      onError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const isPlayerRole = formData.role === 'player';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-300">Full Name *</label>
        <input
          type="text"
          required
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          className="ui-field"
          placeholder="Enter full name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-300">Email *</label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="ui-field"
          placeholder="user@club.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-300">Password *</label>
        <input
          type="password"
          required
          minLength={6}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="ui-field"
          placeholder="Minimum 6 characters"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-300">Role *</label>
        <UiSelect
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
        >
          <option value="player">Player</option>
          <option value="coach">Coach</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </UiSelect>
      </div>
      {isPlayerRole && (
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Position *</label>
          <UiSelect
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
          >
            <option value="Goalkeeper">Goalkeeper</option>
            <option value="Defender">Defender</option>
            <option value="Midfielder">Midfielder</option>
            <option value="Forward">Forward</option>
          </UiSelect>
        </div>
      )}
      <div className="flex justify-end gap-2 pt-4">
        <UiButton
          type="button"
          onClick={onClose}
          variant="secondary"
        >
          Cancel
        </UiButton>
        <UiButton
          type="submit"
          disabled={submitting}
          variant="primary"
        >
          {submitting ? 'Creating...' : 'Create User'}
        </UiButton>
      </div>
    </form>
  );
};

// Edit User Modal Component
const EditUserModal = ({ user, onClose, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    email: user.email,
    role: user.role,
    fullName: user.profile?.fullName || '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('authToken');
      const payload = {
        email: formData.email,
        role: formData.role,
        fullName: formData.fullName,
      };
      // Only include password if user entered one
      if (formData.password) {
        payload.password = formData.password;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/${user.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update user');
      }

      onSuccess();
    } catch (err) {
      onError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[95vh] flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-xl font-bold text-white">Edit User</h3>
          <p className="text-sm text-gray-400 mt-1">Update user details below</p>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="ui-field"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="ui-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">New Password (leave blank to keep current)</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="ui-field"
                placeholder="Enter new password or leave blank"
                minLength={formData.password ? 6 : undefined}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Role</label>
              <UiSelect
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="player">Player</option>
                <option value="coach">Coach</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </UiSelect>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <UiButton
                type="button"
                onClick={onClose}
                variant="secondary"
              >
                Cancel
              </UiButton>
              <UiButton
                type="submit"
                disabled={submitting}
                variant="primary"
              >
                {submitting ? 'Updating...' : 'Update User'}
              </UiButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
