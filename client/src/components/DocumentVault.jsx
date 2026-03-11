import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

const DocumentVault = () => {
  const { token } = useAuth()
  const [players, setPlayers] = useState([])
  const [documents, setDocuments] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [toast, setToast] = useState(null)

  // Fetch all players
  const fetchPlayers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profiles`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch players')
      }

      const data = await response.json()
      setPlayers(data.profiles.filter(p => p.position !== 'Staff'))
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  // Fetch documents for all players
  const fetchAllDocuments = async () => {
    try {
      const docsMap = {}
      
      for (const player of players) {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/documents/${player._id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )

        if (response.ok) {
          const data = await response.json()
          docsMap[player._id] = data.documents || []
        }
      }

      setDocuments(docsMap)
    } catch (err) {
      console.error('Error fetching documents:', err)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await fetchPlayers()
      setLoading(false)
    }
    loadData()
  }, [token])

  useEffect(() => {
    if (players.length > 0) {
      fetchAllDocuments()
    }
  }, [players])

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Handle upload button click
  const handleUploadClick = (player) => {
    setSelectedPlayer(player)
    setShowUploadModal(true)
  }

  // Handle document download
  const handleDownload = async (documentId, fileName) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/documents/download/${documentId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to download document')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      showToast('Document downloaded successfully')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  // Handle document delete
  const handleDelete = async (documentId, playerId) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/documents/${documentId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete document')
      }

      // Refresh documents for this player
      const docsResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/documents/${playerId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (docsResponse.ok) {
        const data = await docsResponse.json()
        setDocuments(prev => ({
          ...prev,
          [playerId]: data.documents || []
        }))
      }

      showToast('Document deleted successfully')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Document Vault</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage player documents and contracts
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`mb-4 p-4 rounded ${
          toast.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading documents...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-100 text-red-700 p-4 rounded">
          {error}
        </div>
      )}

      {/* Documents List */}
      {!loading && !error && (
        <div className="space-y-6">
          {players.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No players found.
            </p>
          ) : (
            players.map((player) => (
              <div key={player._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {player.fullName || 'Unknown Player'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {player.position} • {documents[player._id]?.length || 0} document(s)
                    </p>
                  </div>
                  <button
                    onClick={() => handleUploadClick(player)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition"
                  >
                    Upload Document
                  </button>
                </div>

                {/* Documents for this player */}
                {documents[player._id] && documents[player._id].length > 0 ? (
                  <div className="space-y-2">
                    {documents[player._id].map((doc) => (
                      <div
                        key={doc._id}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{doc.fileName}</p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(doc.fileSize)} • Uploaded {formatDate(doc.uploadedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownload(doc._id, doc.fileName)}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition"
                            title="Download"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(doc._id, player._id)}
                            className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 transition"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No documents uploaded yet</p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && selectedPlayer && (
        <UploadDocumentModal
          player={selectedPlayer}
          onClose={() => {
            setShowUploadModal(false)
            setSelectedPlayer(null)
          }}
          onSuccess={async () => {
            setShowUploadModal(false)
            // Refresh documents for this player
            const response = await fetch(
              `${import.meta.env.VITE_API_URL}/api/documents/${selectedPlayer._id}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            )
            if (response.ok) {
              const data = await response.json()
              setDocuments(prev => ({
                ...prev,
                [selectedPlayer._id]: data.documents || []
              }))
            }
            setSelectedPlayer(null)
            showToast('Document uploaded successfully')
          }}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}
    </div>
  )
}

const UploadDocumentModal = ({ player, onClose, onSuccess, onError }) => {
  const { token } = useAuth()
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Only PDF, JPEG, and PNG files are allowed')
      setFile(null)
      return
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024
    if (selectedFile.size > maxSize) {
      setError('File size must be less than 10MB')
      setFile(null)
      return
    }

    setError(null)
    setFile(selectedFile)
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!file) {
      setError('Please select a file')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('document', file)
      formData.append('playerId', player._id)

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload document')
      }

      onSuccess()
    } catch (err) {
      onError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800">
            Upload Document for {player.fullName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Document <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Allowed: PDF, JPEG, PNG (Max 10MB)
            </p>
          </div>

          {/* Selected File Info */}
          {file && (
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Selected:</span> {file.name}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded text-sm">
              {error}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={uploading || !file}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DocumentVault
