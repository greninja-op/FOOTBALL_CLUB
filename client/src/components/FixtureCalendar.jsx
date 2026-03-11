import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'

const FixtureCalendar = () => {
  const { token } = useAuth()
  const { socket, events } = useSocket()
  const [fixtures, setFixtures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [toast, setToast] = useState(null)

  // Fetch fixtures
  const fetchFixtures = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/fixtures`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch fixtures')
      }

      const data = await response.json()
      setFixtures(data.fixtures)
      setError(null)
    } catch (err) {
      setError(err.message)
      showToast('Error fetching fixtures', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFixtures()
  }, [token])

  // Listen for fixture:created events
  useEffect(() => {
    if (!socket) return

    const handleFixtureCreated = (data) => {
      console.log('Fixture created event received:', data)
      showToast('New fixture created')
      fetchFixtures()
    }

    socket.on('fixture:created', handleFixtureCreated)

    return () => {
      socket.off('fixture:created', handleFixtureCreated)
    }
  }, [socket])

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Format time for display
  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Fixture Calendar</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
        >
          Create Fixture
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

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading fixtures...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-100 text-red-700 p-4 rounded">
          {error}
        </div>
      )}

      {/* Fixtures List */}
      {!loading && !error && (
        <div className="space-y-4">
          {fixtures.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No fixtures scheduled. Create your first fixture to get started.
            </p>
          ) : (
            fixtures.map((fixture) => (
              <div
                key={fixture.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        vs {fixture.opponent}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded ${
                        fixture.matchType === 'League' ? 'bg-blue-100 text-blue-700' :
                        fixture.matchType === 'Cup' ? 'bg-purple-100 text-purple-700' :
                        fixture.matchType === 'Friendly' ? 'bg-green-100 text-green-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {fixture.matchType}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(fixture.date)}</span>
                        <span className="text-gray-400">•</span>
                        <span>{formatTime(fixture.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{fixture.location}</span>
                      </div>
                    </div>
                  </div>
                  {fixture.lineup && fixture.lineup.length > 0 && (
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">{fixture.lineup.length}</span> players
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Fixture Modal */}
      {showCreateModal && (
        <CreateFixtureModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchFixtures()
            showToast('Fixture created successfully')
          }}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}
    </div>
  )
}

const CreateFixtureModal = ({ onClose, onSuccess, onError }) => {
  const { token } = useAuth()
  const [formData, setFormData] = useState({
    opponent: '',
    date: '',
    location: '',
    matchType: 'League'
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  // Validate form
  const validate = () => {
    const newErrors = {}

    if (!formData.opponent.trim()) {
      newErrors.opponent = 'Opponent is required'
    }

    if (!formData.date) {
      newErrors.date = 'Date is required'
    } else {
      // Validate date is not in the past
      const selectedDate = new Date(formData.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        newErrors.date = 'Fixture date cannot be in the past'
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/fixtures`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create fixture')
      }

      onSuccess()
    } catch (err) {
      onError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800">Create Fixture</h3>
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
          {/* Opponent Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Opponent <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="opponent"
              value={formData.opponent}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.opponent ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter opponent name"
            />
            {errors.opponent && (
              <p className="mt-1 text-sm text-red-500">{errors.opponent}</p>
            )}
          </div>

          {/* Date Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-500">{errors.date}</p>
            )}
          </div>

          {/* Location Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.location ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter location"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-500">{errors.location}</p>
            )}
          </div>

          {/* Match Type Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Match Type
            </label>
            <select
              name="matchType"
              value={formData.matchType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="League">League</option>
              <option value="Cup">Cup</option>
              <option value="Friendly">Friendly</option>
              <option value="Tournament">Tournament</option>
            </select>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Fixture'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FixtureCalendar
