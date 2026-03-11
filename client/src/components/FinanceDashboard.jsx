import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

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
  const getPlayerName = (playerId) => {
    const player = players.find(p => p._id === playerId)
    return player ? player.fullName : 'Unknown'
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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Finance Dashboard</h2>
          <p className="text-sm text-gray-600 mt-1">
            Track fines and payments
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
          <p className="mt-2 text-gray-600">Loading finance data...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-100 text-red-700 p-4 rounded">
          {error}
        </div>
      )}

      {/* Finance Dashboard */}
      {!loading && !error && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-600 font-medium">Pending Fines</p>
              <p className="text-2xl font-bold text-red-900">{formatCurrency(totalPending)}</p>
              <p className="text-xs text-red-600 mt-1">
                {fines.filter(f => !f.isPaid).length} unpaid fine(s)
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Paid Fines</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(totalPaid)}</p>
              <p className="text-xs text-green-600 mt-1">
                {fines.filter(f => f.isPaid).length} paid fine(s)
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Total Fines</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalPending + totalPaid)}</p>
              <p className="text-xs text-blue-600 mt-1">
                {fines.length} total fine(s)
              </p>
            </div>
          </div>

          {/* Pending Fines Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Pending Fines</h3>
            {fines.filter(f => !f.isPaid).length === 0 ? (
              <p className="text-gray-500 text-center py-8 bg-gray-50 rounded">
                No pending fines. All fines have been paid.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Player
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Offense
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Issued
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {fines
                      .filter(fine => !fine.isPaid)
                      .sort((a, b) => new Date(b.dateIssued) - new Date(a.dateIssued))
                      .map((fine) => (
                        <tr key={fine._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {getPlayerName(fine.playerId)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">
                              {fine.offense}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-red-600">
                              {formatCurrency(fine.fineAmount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {formatDate(fine.dateIssued)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleMarkPaid(fine._id)}
                              className="text-green-600 hover:text-green-800 font-medium"
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
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Paid Fines</h3>
            {fines.filter(f => f.isPaid).length === 0 ? (
              <p className="text-gray-500 text-center py-8 bg-gray-50 rounded">
                No paid fines yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Player
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Offense
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Issued
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {fines
                      .filter(fine => fine.isPaid)
                      .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
                      .map((fine) => (
                        <tr key={fine._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {getPlayerName(fine.playerId)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">
                              {fine.offense}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(fine.fineAmount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {formatDate(fine.dateIssued)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-green-600 font-medium">
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
