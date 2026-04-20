import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import UiButton from './ui/UiButton';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getDisplayPosition = (player) => (
  player.playerDomain?.activeMembership?.primaryPosition
  || player.preferredPosition
  || player.position
  || 'N/A'
);

const getPlayerSearchText = (player) => (
  `${player.fullName || ''} ${getDisplayPosition(player)} ${player.position || ''}`.toLowerCase()
);

const DocumentVault = () => {
  const { token } = useAuth();
  const [players, setPlayers] = useState([]);
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPlayerId, setExpandedPlayerId] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPlayers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/profiles`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch players');
      }

      const data = await response.json();
      const availablePlayers = (data.profiles || [])
        .filter((player) => player.position !== 'Staff')
        .sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));

      setPlayers(availablePlayers);
      setError(null);
    } catch (fetchError) {
      setError(fetchError.message);
    }
  };

  const refreshPlayerDocuments = async (playerId) => {
    const response = await fetch(`${API_URL}/api/documents/${playerId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    setDocuments((current) => ({
      ...current,
      [playerId]: data.documents || []
    }));
  };

  const fetchAllDocuments = async () => {
    try {
      const docsByPlayer = {};

      await Promise.all(players.map(async (player) => {
        const response = await fetch(`${API_URL}/api/documents/${player._id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          docsByPlayer[player._id] = data.documents || [];
        }
      }));

      setDocuments(docsByPlayer);
    } catch (fetchError) {
      console.error('Error fetching documents:', fetchError);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchPlayers();
      setLoading(false);
    };

    loadData();
  }, [token]);

  useEffect(() => {
    if (players.length > 0) {
      fetchAllDocuments();
    } else {
      setDocuments({});
    }
  }, [players]);

  const visiblePlayers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filtered = players.filter((player) => getPlayerSearchText(player).includes(normalizedSearch));

    if (!normalizedSearch) {
      return filtered.slice(0, 5);
    }

    return filtered;
  }, [players, searchTerm]);

  const handleDownload = async (documentId, fileName) => {
    try {
      const response = await fetch(`${API_URL}/api/documents/download/${documentId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download document');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(anchor);

      showToast('Document downloaded successfully');
    } catch (downloadError) {
      showToast(downloadError.message, 'error');
    }
  };

  const handleDelete = async (documentId, playerId) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      await refreshPlayerDocuments(playerId);
      showToast('Document deleted successfully');
    } catch (deleteError) {
      showToast(deleteError.message, 'error');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-gray-800/40 backdrop-blur-sm border border-white/10 rounded-2xl shadow p-4">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Document Vault</h2>
          <p className="mt-1 text-xs text-gray-400">Manage player documents and contracts</p>
        </div>

        <div className="w-full max-w-sm">
          <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/45">Search Players</label>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="ui-field"
            placeholder="Search by name or position"
          />
        </div>
      </div>

      {toast && (
        <div className={`mb-4 rounded-xl border px-3 py-2 text-sm ${
          toast.type === 'error'
            ? 'border-red-500/30 bg-red-900/40 text-red-200'
            : 'border-green-500/30 bg-green-900/40 text-green-200'
        }`}>
          {toast.message}
        </div>
      )}

      {loading && (
        <div className="py-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-red-600" />
          <p className="mt-2 text-gray-400">Loading documents...</p>
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl border border-red-500/30 bg-red-900/40 p-3 text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {!searchTerm.trim() && players.length > 5 && (
            <div className="mb-4 rounded-xl border border-white/10 bg-gray-700/20 px-3 py-2 text-xs text-gray-300">
              Showing first 5 players. Use search to find anyone else.
            </div>
          )}

          {visiblePlayers.length === 0 ? (
            <p className="py-8 text-center text-gray-500">No players found.</p>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {visiblePlayers.map((player) => {
                const playerDocuments = documents[player._id] || [];
                const isExpanded = expandedPlayerId === player._id;

                return (
                  <div key={player._id} className="rounded-2xl border border-white/10 bg-gray-800/20 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-white">{player.fullName || 'Unknown Player'}</h3>
                        <p className="text-sm text-gray-400">
                          {getDisplayPosition(player)} • {playerDocuments.length} document(s)
                        </p>
                      </div>

                      <UiButton
                        onClick={() => setExpandedPlayerId(isExpanded ? null : player._id)}
                        variant={isExpanded ? 'secondary' : 'primary'}
                        className="self-center"
                      >
                        {isExpanded ? 'Close Upload' : 'Upload Document'}
                      </UiButton>
                    </div>

                    {playerDocuments.length > 0 ? (
                      <div className="space-y-2">
                        {playerDocuments.map((doc) => (
                          <div
                            key={doc._id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-gray-700/20 p-3"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-white">{doc.fileName}</p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(doc.fileSize)} • Uploaded {formatDate(doc.uploadedAt)}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <UiButton
                                onClick={() => handleDownload(doc._id, doc.fileName)}
                                variant="ghost"
                                size="sm"
                              >
                                Download
                              </UiButton>
                              <UiButton
                                onClick={() => handleDelete(doc._id, player._id)}
                                variant="danger"
                                size="sm"
                              >
                                Delete
                              </UiButton>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm italic text-gray-500">No documents uploaded yet.</p>
                    )}

                    <div className="ui-inline-expand mt-3" data-open={isExpanded}>
                      <div className="ui-expand-card p-4">
                        <InlineUploadPanel
                          player={player}
                          onCancel={() => setExpandedPlayerId(null)}
                          onSuccess={async () => {
                            await refreshPlayerDocuments(player._id);
                            setExpandedPlayerId(null);
                            showToast(`Document uploaded for ${player.fullName}`);
                          }}
                          onError={(message) => showToast(message, 'error')}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const InlineUploadPanel = ({ player, onCancel, onSuccess, onError }) => {
  const { token } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const inputId = `document-upload-${player._id}`;

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Only PDF, JPEG, and PNG files are allowed.');
      setFile(null);
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError('File size must be less than 10MB.');
      setFile(null);
      return;
    }

    setError('');
    setFile(selectedFile);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setError('Please choose a file before uploading.');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('playerId', player._id);

      const response = await fetch(`${API_URL}/api/documents`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload document');
      }

      onSuccess();
    } catch (submitError) {
      const message = submitError.message || 'Failed to upload document';
      setError(message);
      onError(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm font-semibold text-white">Upload for {player.fullName}</p>

      <div className="rounded-xl border border-white/10 bg-gray-900/40 p-3">
        <input
          id={inputId}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor={inputId}>
            <span className="ui-btn ui-btn-ghost ui-btn-md cursor-pointer px-4">Choose File</span>
          </label>
          <span className="text-sm text-gray-300">{file ? file.name : 'No file selected'}</span>
        </div>

        <p className="mt-2 text-xs text-gray-500">Allowed: PDF, JPEG, PNG. Max size 10MB.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-900/30 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <UiButton type="button" onClick={onCancel} variant="secondary" disabled={uploading}>
          Cancel
        </UiButton>
        <UiButton type="submit" variant="primary" disabled={uploading || !file}>
          {uploading ? 'Uploading...' : 'Upload'}
        </UiButton>
      </div>
    </form>
  );
};

export default DocumentVault;
