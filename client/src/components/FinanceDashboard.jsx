import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

const getDisplayPosition = (player) => (
  player.playerDomain?.activeMembership?.primaryPosition
  || player.preferredPosition
  || player.position
  || 'N/A'
)

const FinanceDashboard = () => {
  const { token } = useAuth()
  const [fines, setFines] = useState([])
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  // Fetch disciplinary actions (fines)
  const fetchFines = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/disciplinary`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch fines')
      }

      const data = await response.json()
      setFines(data.actions)
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
      setPlayers(data.profiles)
    } catch (err) {
      console.error('Error fetching players:', err)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchFines(), fetchPlayers()])
      setLoading(false)
    }
    loadData()
  }, [token])

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Handle mark as paid
  const handleMarkPaid = async (fineId) => {
    if (!confirm('Mark this fine as paid?')) {
      return
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/disciplinary/${fineId}/pay`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            paymentDate: new Date().toISOString()
          })
        }
      )

      if (!response.ok) {
        throw new Error('Failed to mark fine as paid')
      }

      await fetchFines()
      showToast('Fine marked as paid successfully')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  // Get player name by ID
  const getPlayerData = (playerRef) => {
    if (playerRef?.fullName) {
      return playerRef
    }

    const playerId = playerRef?._id || playerRef
    return players.find((player) => player._id === playerId) || null
  }

  // Calculate total pending fines
  const totalPending = fines
    .filter(fine => !fine.isPaid)
    .reduce((sum, fine) => sum + fine.fineAmount, 0)

  // Calculate total paid fines
  const totalPaid = fines
    .filter(fine => fine.isPaid)
    .reduce((sum, fine) => sum + fine.fineAmount, 0)

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

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg shadow border border-white/10 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Finance Dashboard</h2>
          <p className="text-sm text-gray-300 mt-1">
            Track fines and payments
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`mb-4 p-4 rounded backdrop-blur-sm ${
          toast.type === 'error' ? 'bg-red-900/40 text-red-200 border border-red-500/30' : 'bg-green-900/40 text-green-200 border border-green-500/30'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="mt-2 text-gray-300">Loading finance data...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-900/40 text-red-200 p-4 rounded border border-red-500/30">
          {error}
        </div>
      )}

      {/* Finance Dashboard */}
      {!loading && !error && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/30">
              <p className="text-sm text-red-300 font-medium">Pending Fines</p>
              <p className="text-2xl font-bold text-red-200">{formatCurrency(totalPending)}</p>
              <p className="text-xs text-red-400 mt-1">
                {fines.filter(f => !f.isPaid).length} unpaid fine(s)
              </p>
            </div>
            <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30">
              <p className="text-sm text-green-300 font-medium">Paid Fines</p>
              <p className="text-2xl font-bold text-green-200">{formatCurrency(totalPaid)}</p>
              <p className="text-xs text-green-400 mt-1">
                {fines.filter(f => f.isPaid).length} paid fine(s)
              </p>
            </div>
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
              <p className="text-sm text-blue-300 font-medium">Total Fines</p>
              <p className="text-2xl font-bold text-blue-200">{formatCurrency(totalPending + totalPaid)}</p>
              <p className="text-xs text-blue-400 mt-1">
                {fines.length} total fine(s)
              </p>
            </div>
          </div>

          {/* Pending Fines Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Pending Fines</h3>
            {fines.filter(f => !f.isPaid).length === 0 ? (
              <p className="text-gray-400 text-center py-8 bg-gray-800/20 rounded border border-white/10">
                No pending fines. All fines have been paid.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10">
                  <thead className="bg-gray-900/40">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Player
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Offense
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Date Issued
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800/20 divide-y divide-white/10">
                    {fines
                      .filter(fine => !fine.isPaid)
                      .sort((a, b) => new Date(b.dateIssued) - new Date(a.dateIssued))
                      .map((fine) => (
                        <tr key={fine._id} className="hover:bg-gray-700/20">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">
                              {getPlayerData(fine.playerId)?.fullName || 'Unknown'}
                            </div>
                            <div className="text-xs text-gray-400">
                              {getDisplayPosition(getPlayerData(fine.playerId) || {})}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-300">
                              {fine.offense}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-red-400">
                              {formatCurrency(fine.fineAmount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">
                              {formatDate(fine.dateIssued)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleMarkPaid(fine._id)}
                              className="text-green-400 hover:text-green-300 font-medium"
                            >
                              Mark Paid
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Paid Fines Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Paid Fines</h3>
            {fines.filter(f => f.isPaid).length === 0 ? (
              <p className="text-gray-400 text-center py-8 bg-gray-800/20 rounded border border-white/10">
                No paid fines yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10">
                  <thead className="bg-gray-900/40">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Player
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Offense
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Date Issued
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Payment Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800/20 divide-y divide-white/10">
                    {fines
                      .filter(fine => fine.isPaid)
                      .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
                      .map((fine) => (
                        <tr key={fine._id} className="hover:bg-gray-700/20">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">
                              {getPlayerData(fine.playerId)?.fullName || 'Unknown'}
                            </div>
                            <div className="text-xs text-gray-400">
                              {getDisplayPosition(getPlayerData(fine.playerId) || {})}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-300">
                              {fine.offense}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">
                              {formatCurrency(fine.fineAmount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">
                              {formatDate(fine.dateIssued)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-green-400 font-medium">
                              {formatDate(fine.paymentDate)}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default FinanceDashboard
