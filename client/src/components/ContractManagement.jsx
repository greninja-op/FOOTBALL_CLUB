import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

const getDisplayPosition = (profile) => (
  profile.playerDomain?.activeMembership?.primaryPosition
  || profile.preferredPosition
  || profile.position
  || 'N/A'
)

const ContractManagement = () => {
  const { token } = useAuth()
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch all profiles with contract information
  const fetchContracts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profiles`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch contracts')
      }

      const data = await response.json()
      
      // Filter profiles that have contract information
      const profilesWithContracts = data.profiles.filter(profile => 
        profile.contract && profile.contract.contractEnd
      )
      
      setContracts(profilesWithContracts)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContracts()
  }, [token])

  // Calculate days remaining until contract expiry
  const calculateDaysRemaining = (endDate) => {
    const today = new Date()
    const end = new Date(endDate)
    const diffTime = end - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Get warning level based on days remaining
  const getWarningLevel = (daysRemaining) => {
    if (daysRemaining < 0) return 'expired'
    if (daysRemaining < 90) return 'critical'
    if (daysRemaining < 180) return 'warning'
    return 'normal'
  }

  const getContractProgress = (contract) => {
    if (!contract?.contractStart || !contract?.contractEnd) return 0
    const start = new Date(contract.contractStart).getTime()
    const end = new Date(contract.contractEnd).getTime()
    const now = Date.now()
    if (end <= start) return 100
    return Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)))
  }

  const exportContractsCsv = () => {
    const header = ['Player', 'Position', 'Contract Type', 'Start Date', 'End Date', 'Days Remaining', 'Availability']
    const rows = contracts.map((profile) => {
      const daysRemaining = calculateDaysRemaining(profile.contract.contractEnd)
      return [
        profile.fullName || 'N/A',
        getDisplayPosition(profile),
        profile.contract.contractType || 'N/A',
        formatDate(profile.contract.contractStart),
        formatDate(profile.contract.contractEnd),
        daysRemaining < 0 ? `${Math.abs(daysRemaining)} days ago` : `${daysRemaining} days`,
        profile.availabilityStatus || 'available'
      ]
    })

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'player-contracts.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-gray-800/40 backdrop-blur-sm border border-white/10 rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">Contract Management</h2>
          <p className="text-xs text-gray-400 mt-1">
            Monitor player contracts and expiry dates
          </p>
        </div>
        <button
          onClick={exportContractsCsv}
          disabled={contracts.length === 0}
          className="rounded-full border border-white/15 bg-gray-700/40 px-4 py-2 text-sm text-white transition hover:bg-gray-700/60 disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="mt-2 text-gray-400">Loading contracts...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-900/40 text-red-200 border border-red-500/30 p-3 rounded">
          {error}
        </div>
      )}

      {/* Contracts List */}
      {!loading && !error && (
        <div className="space-y-4">
          {contracts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No contracts found. Add contract information to player profiles.
            </p>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-900/40 border border-blue-500/30 p-4 rounded-lg">
                  <p className="text-sm text-blue-300 font-medium">Total Contracts</p>
                  <p className="text-2xl font-bold text-blue-100">{contracts.length}</p>
                </div>
                <div className="bg-yellow-900/40 border border-yellow-500/30 p-4 rounded-lg">
                  <p className="text-sm text-yellow-300 font-medium">Expiring Soon (&lt;90 days)</p>
                  <p className="text-2xl font-bold text-yellow-100">
                    {contracts.filter(c => {
                      const days = calculateDaysRemaining(c.contract.contractEnd)
                      return days >= 0 && days < 90
                    }).length}
                  </p>
                </div>
                <div className="bg-red-900/40 border border-red-500/30 p-4 rounded-lg">
                  <p className="text-sm text-red-300 font-medium">Expired</p>
                  <p className="text-2xl font-bold text-red-100">
                    {contracts.filter(c => calculateDaysRemaining(c.contract.contractEnd) < 0).length}
                  </p>
                </div>
              </div>

              {/* Contracts Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10">
                  <thead className="bg-gray-900/40">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Player
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Contract Type
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Start Date
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        End Date
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Days Remaining
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Availability
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800/20 divide-y divide-white/10">
                    {contracts
                      .sort((a, b) => calculateDaysRemaining(a.contract.contractEnd) - calculateDaysRemaining(b.contract.contractEnd))
                      .map((profile) => {
                        const daysRemaining = calculateDaysRemaining(profile.contract.contractEnd)
                        const warningLevel = getWarningLevel(daysRemaining)
                        
                        return (
                          <tr key={profile._id} className="hover:bg-gray-700/20">
                            <td className="px-4 py-2.5 whitespace-nowrap">
                              <div className="text-sm font-medium text-white">
                                {profile.fullName || 'N/A'}
                              </div>
                            </td>
                            <td className="px-4 py-2.5 whitespace-nowrap">
                              <div className="text-sm text-gray-400">
                                {getDisplayPosition(profile)}
                              </div>
                            </td>
                            <td className="px-4 py-2.5 whitespace-nowrap">
                              <div className="text-sm text-gray-400">
                                {profile.contract.contractType || 'N/A'}
                              </div>
                            </td>
                            <td className="px-4 py-2.5 whitespace-nowrap">
                              <div className="text-sm text-gray-400">
                                {formatDate(profile.contract.contractStart)}
                              </div>
                            </td>
                            <td className="px-4 py-2.5 whitespace-nowrap">
                              <div className="text-sm text-gray-400">
                                {formatDate(profile.contract.contractEnd)}
                              </div>
                            </td>
                            <td className="px-4 py-2.5 whitespace-nowrap">
                              <div className={`text-sm font-semibold ${
                                warningLevel === 'expired' ? 'text-red-400' :
                                warningLevel === 'critical' ? 'text-red-400' :
                                warningLevel === 'warning' ? 'text-yellow-400' :
                                'text-green-400'
                              }`}>
                                {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days ago` : `${daysRemaining} days`}
                              </div>
                              <div className="mt-2 h-1.5 w-28 overflow-hidden rounded-full bg-white/10">
                                <div
                                  className={`h-full rounded-full ${
                                    warningLevel === 'expired' || warningLevel === 'critical'
                                      ? 'bg-red-500'
                                      : warningLevel === 'warning'
                                      ? 'bg-yellow-500'
                                      : 'bg-green-500'
                                  }`}
                                  style={{ width: `${getContractProgress(profile.contract)}%` }}
                                />
                              </div>
                            </td>
                            <td className="px-4 py-2.5 whitespace-nowrap">
                              {warningLevel === 'expired' && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-900/40 text-red-200 border border-red-500/30">
                                  Expired
                                </span>
                              )}
                              {warningLevel === 'critical' && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-900/40 text-red-200 border border-red-500/30 flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  Critical
                                </span>
                              )}
                              {warningLevel === 'warning' && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-900/40 text-yellow-200 border border-yellow-500/30">
                                  Warning
                                </span>
                              )}
                              {warningLevel === 'normal' && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-900/40 text-green-200 border border-green-500/30">
                                  Active
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                profile.availabilityStatus === 'manual-unavailable' || profile.availabilityStatus === 'injured' || profile.availabilityStatus === 'leave'
                                  ? 'bg-red-900/40 text-red-200 border border-red-500/30'
                                  : profile.availabilityStatus === 'listed' || profile.availabilityStatus === 'suspended'
                                  ? 'bg-yellow-900/40 text-yellow-200 border border-yellow-500/30'
                                  : 'bg-green-900/40 text-green-200 border border-green-500/30'
                              }`}>
                                {profile.availabilityStatus || 'available'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default ContractManagement
