import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

const InventoryManagement = () => {
  const { token } = useAuth()
  const [inventory, setInventory] = useState([])
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [toast, setToast] = useState(null)

  // Fetch inventory
  const fetchInventory = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/inventory`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch inventory')
      }

      const data = await response.json()
      setInventory(data.items)
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  // Fetch players
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
    } catch (err) {
      console.error('Error fetching players:', err)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchInventory(), fetchPlayers()])
      setLoading(false)
    }
    loadData()
  }, [token])

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Handle assign button click
  const handleAssignClick = (item) => {
    setSelectedItem(item)
    setShowAssignModal(true)
  }

  // Handle return item
  const handleReturn = async (itemId) => {
    if (!confirm('Mark this item as returned?')) {
      return
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/inventory/${itemId}/return`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            returnedAt: new Date().toISOString()
          })
        }
      )

      if (!response.ok) {
        throw new Error('Failed to return item')
      }

      await fetchInventory()
      showToast('Item returned successfully')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Get player name by ID
  const getPlayerName = (playerId) => {
    const player = players.find(p => p._id === playerId)
    return player ? player.fullName : 'Unknown'
  }

  // Check if item is assigned
  const isAssigned = (item) => {
    return item.assignedTo && !item.returnedAt
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Track equipment and assignments
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
        >
          Add Item
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
          <p className="mt-2 text-gray-600">Loading inventory...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-100 text-red-700 p-4 rounded">
          {error}
        </div>
      )}

      {/* Inventory Table */}
      {!loading && !error && (
        <div className="overflow-x-auto">
          {inventory.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No inventory items found. Add your first item to get started.
            </p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.itemName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded ${
                        item.itemType === 'Jersey' ? 'bg-blue-100 text-blue-700' :
                        item.itemType === 'Boots' ? 'bg-green-100 text-green-700' :
                        item.itemType === 'Training Equipment' ? 'bg-purple-100 text-purple-700' :
                        item.itemType === 'Medical' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {item.itemType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {item.assignedTo ? getPlayerName(item.assignedTo) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {formatDate(item.assignedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isAssigned(item) ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                          Assigned
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Available
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {isAssigned(item) ? (
                        <button
                          onClick={() => handleReturn(item._id)}
                          className="text-orange-600 hover:text-orange-800 font-medium"
                        >
                          Return
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAssignClick(item)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Assign
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Create Item Modal */}
      {showCreateModal && (
        <CreateItemModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchInventory()
            showToast('Item created successfully')
          }}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}

      {/* Assign Item Modal */}
      {showAssignModal && selectedItem && (
        <AssignItemModal
          item={selectedItem}
          players={players}
          onClose={() => {
            setShowAssignModal(false)
            setSelectedItem(null)
          }}
          onSuccess={() => {
            setShowAssignModal(false)
            setSelectedItem(null)
            fetchInventory()
            showToast('Item assigned successfully')
          }}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}
    </div>
  )
}

const CreateItemModal = ({ onClose, onSuccess, onError }) => {
  const { token } = useAuth()
  const [formData, setFormData] = useState({
    itemName: '',
    itemType: 'Jersey'
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.itemName.trim()) {
      onError('Item name is required')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create item')
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
          <h3 className="text-xl font-bold text-gray-800">Add Inventory Item</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="itemName"
              value={formData.itemName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter item name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Type
            </label>
            <select
              name="itemType"
              value={formData.itemType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Jersey">Jersey</option>
              <option value="Boots">Boots</option>
              <option value="Training Equipment">Training Equipment</option>
              <option value="Medical">Medical</option>
              <option value="Other">Other</option>
            </select>
          </div>

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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const AssignItemModal = ({ item, players, onClose, onSuccess, onError }) => {
  const { token } = useAuth()
  const [selectedPlayer, setSelectedPlayer] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedPlayer) {
      onError('Please select a player')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/inventory/${item._id}/assign`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            playerId: selectedPlayer
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to assign item')
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
          <h3 className="text-xl font-bold text-gray-800">Assign Item</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-600">Item:</p>
            <p className="font-medium text-gray-800">{item.itemName}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign to Player <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a player</option>
              {players.map((player) => (
                <option key={player._id} value={player._id}>
                  {player.fullName} - {player.position}
                </option>
              ))}
            </select>
          </div>

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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default InventoryManagement
