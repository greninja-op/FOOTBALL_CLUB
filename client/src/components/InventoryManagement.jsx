import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import FloatingNotice from './FloatingNotice'

const getDisplayPosition = (player) => (
  player.playerDomain?.activeMembership?.primaryPosition
  || player.preferredPosition
  || player.position
  || 'N/A'
)

const InventoryManagement = () => {
  const { token } = useAuth()
  const [inventory, setInventory] = useState([])
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState('stock')

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
  const getPlayerName = (playerRef) => {
    if (playerRef?.fullName) {
      return playerRef.fullName
    }

    const playerId = playerRef?._id || playerRef
    const player = players.find(p => p._id === playerId)
    return player ? player.fullName : 'Unknown'
  }

  // Check if item is assigned
  const isAssigned = (item) => {
    return item.assignedTo && !item.returnedAt
  }

  const visibleInventory = inventory.filter((item) => (
    activeTab === 'allocations' ? isAssigned(item) : true
  ))

  return (
    <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg shadow border border-white/10 p-4">
      <FloatingNotice message={toast?.message || error} type={toast?.type || 'error'} />
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">Inventory Management</h2>
          <p className="text-xs text-gray-300 mt-1">
            Track equipment and assignments
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm((current) => !current)}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm transition"
        >
          {showCreateForm ? 'Close Form' : 'Add Item'}
        </button>
      </div>

      <div className="ui-inline-expand mb-4" data-open={showCreateForm}>
        <div className="ui-expand-card p-6">
          <CreateItemPanel
            onClose={() => setShowCreateForm(false)}
            onSuccess={() => {
              setShowCreateForm(false)
              fetchInventory()
              showToast('Item created successfully')
            }}
            onError={(msg) => showToast(msg, 'error')}
          />
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        {[
          { id: 'stock', label: 'Stock Room' },
          { id: 'allocations', label: 'Allocations' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              activeTab === tab.id
                ? 'border-red-500/40 bg-red-600/80 text-white'
                : 'border-white/15 bg-gray-700/30 text-gray-300 hover:bg-gray-700/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="mt-2 text-gray-300">Loading inventory...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-900/40 text-red-200 p-4 rounded border border-red-500/30">
          {error}
        </div>
      )}

      {/* Inventory Table */}
      {!loading && !error && (
        <div className="overflow-x-auto">
          {inventory.length === 0 ? (
            <p className="text-gray-400 text-center py-8 bg-gray-800/20 rounded border border-white/10">
              No inventory items found. Add your first item to get started.
            </p>
          ) : visibleInventory.length === 0 ? (
            <p className="text-gray-400 text-center py-8 bg-gray-800/20 rounded border border-white/10">
              No active equipment allocations yet.
            </p>
          ) : (
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-gray-900/40">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Assignment Date
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800/20 divide-y divide-white/10">
                {visibleInventory.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-700/20">
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {item.itemName}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded border ${
                        item.itemType === 'Jersey' ? 'bg-blue-900/40 text-blue-200 border-blue-500/30' :
                        item.itemType === 'Boots' ? 'bg-green-900/40 text-green-200 border-green-500/30' :
                        item.itemType === 'Training Equipment' ? 'bg-purple-900/40 text-purple-200 border-purple-500/30' :
                        item.itemType === 'Medical' ? 'bg-red-900/40 text-red-200 border-red-500/30' :
                        'bg-gray-700/40 text-gray-300 border-gray-500/30'
                      }`}>
                        {item.itemType}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {item.assignedTo ? getPlayerName(item.assignedTo) : '-'}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {formatDate(item.assignedAt)}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      {isAssigned(item) ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-900/40 text-yellow-200 border border-yellow-500/30">
                          Assigned
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-900/40 text-green-200 border border-green-500/30">
                          Available
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                      {isAssigned(item) ? (
                        <button
                          onClick={() => handleReturn(item._id)}
                          className="text-orange-400 hover:text-orange-300 font-medium"
                        >
                          Return
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAssignClick(item)}
                          className="text-red-400 hover:text-red-300 font-medium"
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

const CreateItemPanel = ({ onClose, onSuccess, onError }) => {
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-bold text-white">Add Inventory Item</h3>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Item Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="itemName"
          value={formData.itemName}
          onChange={handleChange}
          className="ui-field"
          placeholder="Enter item name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Item Type
        </label>
        <select
          name="itemType"
          value={formData.itemType}
          onChange={handleChange}
          className="ui-select"
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
          className="flex-1 px-4 py-2 bg-gray-700/40 border border-white/10 text-gray-300 rounded hover:bg-gray-700/60 transition"
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
          disabled={submitting}
        >
          {submitting ? 'Creating...' : 'Create'}
        </button>
      </div>
    </form>
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900/95 backdrop-blur-md rounded-lg shadow-xl max-w-md w-full mx-4 border border-white/10">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h3 className="text-xl font-bold text-white">Assign Item</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-300 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-800/40 p-3 rounded border border-white/10">
            <p className="text-sm text-gray-400">Item:</p>
            <p className="font-medium text-white">{item.itemName}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Assign to Player <span className="text-red-400">*</span>
            </label>
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/40 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Select a player</option>
              {players.map((player) => (
                <option key={player._id} value={player._id}>
                  {player.fullName} - {getDisplayPosition(player)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700/40 border border-white/10 text-gray-300 rounded hover:bg-gray-700/60 transition"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
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
