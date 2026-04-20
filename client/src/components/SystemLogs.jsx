import { useEffect, useState } from 'react';
import UiButton from './ui/UiButton';
import UiCalendarInput from './ui/UiCalendarInput';

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showAllOnline, setShowAllOnline] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchLogs = async () => {
    try {
      if (initialFetchDone) {
        setPageLoading(true);
      } else {
        setLoading(true);
      }

      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '5',
      });

      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`${API_URL}/api/logs?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch logs');

      const data = await response.json();
      setLogs(data.logs);
      setOnlineUsers(data.onlineUsers || []);
      setLoginHistory(data.loginHistory || []);
      setTotalPages(data.pagination.pages);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setPageLoading(false);
      setInitialFetchDone(true);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, startDate, endDate]);

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const exportLogsCsv = () => {
    const headers = ['Timestamp', 'User', 'Role', 'Action', 'Collection', 'Target ID'];
    const rows = logs.map((log) => [
      formatTimestamp(log.timestamp),
      log.performedBy?.email || 'System',
      log.performedBy?.role || 'system',
      log.action,
      log.targetCollection || '',
      log.targetId || ''
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'system-logs.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-900/40 text-green-200 border border-green-500/30';
      case 'UPDATE':
        return 'bg-blue-900/40 text-blue-200 border border-blue-500/30';
      case 'DELETE':
        return 'bg-red-900/40 text-red-200 border border-red-500/30';
      case 'LOGIN':
        return 'bg-purple-900/40 text-purple-200 border border-purple-500/30';
      default:
        return 'bg-gray-700/40 text-gray-300 border border-white/10';
    }
  };

  const visibleOnlineUsers = showAllOnline ? onlineUsers : onlineUsers.slice(0, 5);
  const todayLoginHistory = loginHistory.filter((entry) => {
    const entryDate = new Date(entry.timestamp);
    const today = new Date();
    return entryDate.toDateString() === today.toDateString();
  });
  const visibleLoginHistory = todayLoginHistory.slice(0, 5);
  const overflowLoginHistory = todayLoginHistory.slice(5);

  return (
    <div className="p-4">
      <div className="mb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/45">Monitoring</p>
            <p className="mt-1 text-sm text-gray-400">View who is online, recent logins, and the full audit trail.</p>
          </div>
          <UiButton
            onClick={exportLogsCsv}
            disabled={logs.length === 0}
            variant="secondary"
            className="px-4"
          >
            Export CSV
          </UiButton>
        </div>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Online Users - Compact */}
        <div className="rounded-2xl border border-white/10 bg-gray-800/30 p-4" style={{ maxHeight: 340, display: 'flex', flexDirection: 'column' }}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Online Users</h3>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-900/30 px-3 py-1 text-xs font-semibold text-emerald-200">
              {onlineUsers.length} active
            </span>
          </div>
          {onlineUsers.length === 0 ? (
            <p className="text-sm text-gray-500">No authenticated users are currently online.</p>
          ) : (
            <div className="space-y-2 overflow-y-auto flex-1" style={{ minHeight: 0 }}>
              {visibleOnlineUsers.map((user) => (
                <div key={user.id} className="rounded-xl border border-white/10 bg-gray-700/20 px-3 py-2">
                  <div className="text-sm font-medium text-white">{user.email}</div>
                  <div className="text-xs uppercase tracking-[0.25em] text-gray-400">{user.role}</div>
                </div>
              ))}
              {onlineUsers.length > 5 && (
                <button
                  onClick={() => setShowAllOnline(!showAllOnline)}
                  className="w-full text-center text-xs text-red-400 hover:text-red-300 py-1 transition-colors"
                >
                  {showAllOnline ? 'Show Less' : `Show All (${onlineUsers.length})`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Recent Login History - Compact (show 5) */}
        <div className="rounded-2xl border border-white/10 bg-gray-800/30 p-4" style={{ maxHeight: 340, display: 'flex', flexDirection: 'column' }}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Recent Login History</h3>
            <span className="text-xs uppercase tracking-[0.25em] text-white/45">Today {todayLoginHistory.length}</span>
          </div>
          {todayLoginHistory.length === 0 ? (
            <p className="text-sm text-gray-500">No login events recorded today.</p>
          ) : (
            <div className="space-y-2 overflow-y-auto flex-1 pr-1 custom-scrollbar" style={{ minHeight: 0 }}>
              {visibleLoginHistory.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-gray-700/20 px-3 py-2">
                  <div>
                    <div className="text-sm font-medium text-white">{entry.performedBy?.email || 'Unknown user'}</div>
                    <div className="text-xs uppercase tracking-[0.25em] text-gray-500">{entry.performedBy?.role || 'unknown'}</div>
                  </div>
                  <div className="text-xs text-gray-400">{formatTimestamp(entry.timestamp)}</div>
                </div>
              ))}
              {overflowLoginHistory.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-gray-700/10 px-3 py-2">
                  <div>
                    <div className="text-sm font-medium text-white">{entry.performedBy?.email || 'Unknown user'}</div>
                    <div className="text-xs uppercase tracking-[0.25em] text-gray-500">{entry.performedBy?.role || 'unknown'}</div>
                  </div>
                  <div className="text-xs text-gray-400">{formatTimestamp(entry.timestamp)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Date Filters */}
      <div className="mb-4 rounded-2xl border border-white/10 bg-gray-800/30 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-300">Start Date</label>
            <UiCalendarInput
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="min-w-[200px] flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-300">End Date</label>
            <UiCalendarInput
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <UiButton
            onClick={handleResetFilters}
            variant="secondary"
            className="px-4"
          >
            Reset Filters
          </UiButton>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-white">Loading logs...</div>
      ) : logs.length === 0 && !error ? (
        <div className="py-8 text-center text-gray-400">No logs found</div>
      ) : (
        <>
          {error && (
            <div className="mb-3 rounded-xl border border-red-500/30 bg-red-900/25 px-4 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gray-800/30">
            {pageLoading && (
              <div className="absolute inset-x-0 top-0 z-10 border-b border-white/10 bg-gray-900/80 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/70">
                Updating page...
              </div>
            )}

            <table className={`min-w-full transition-opacity ${pageLoading ? 'opacity-65' : 'opacity-100'}`}>
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-300">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-300">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-300">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-300">Collection</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-300">Target ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-700/20">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-white">{formatTimestamp(log.timestamp)}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {log.performedBy ? (
                        <div>
                          <div className="text-sm font-medium text-white">{log.performedBy.email}</div>
                          <div className="text-xs text-gray-400">{log.performedBy.role}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">System</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-white">{log.targetCollection}</td>
                    <td className="whitespace-nowrap px-6 py-4 font-mono text-sm text-gray-400">
                      {log.targetId ? `${log.targetId.substring(0, 8)}...` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-center gap-2">
            <UiButton
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1 || pageLoading}
              variant="secondary"
            >
              Previous
            </UiButton>
            <span className="px-4 py-2 text-white">Page {page} of {totalPages}</span>
            <UiButton
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages || pageLoading}
              variant="secondary"
            >
              Next
            </UiButton>
          </div>
        </>
      )}
    </div>
  );
};

export default SystemLogs;
