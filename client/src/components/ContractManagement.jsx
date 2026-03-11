import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

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

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Contract Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Monitor player contracts and expiry dates
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading contracts...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-100 text-red-700 p-4 rounded">
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Total Contracts</p>
                  <p className="text-2xl font-bold text-blue-900">{contracts.length}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-600 font-medium">Expiring Soon (&lt;90 days)</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {contracts.filter(c => {
                      const days = calculateDaysRemaining(c.contract.contractEnd)
                      return days >= 0 && days < 90
                    }).length}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">Expired</p>
                  <p className="text-2xl font-bold text-red-900">
                    {contracts.filter(c => calculateDaysRemaining(c.contract.contractEnd) < 0).length}
                  </p>
                </div>
              </div>

              {/* Contracts Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Player
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contract Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        End Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Days Remaining
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contracts
                      .sort((a, b) => calculateDaysRemaining(a.contract.contractEnd) - calculateDaysRemaining(b.contract.contractEnd))
                      .map((profile) => {
                        const daysRemaining = calculateDaysRemaining(profile.contract.contractEnd)
                        const warningLevel = getWarningLevel(daysRemaining)
                        
                        return (
                          <tr key={profile._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {profile.fullName || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">
                                {profile.position || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">
                                {profile.contract.contractType || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">
                                {formatDate(profile.contract.contractStart)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">
                                {formatDate(profile.contract.contractEnd)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-sm font-semibold ${
                                warningLevel === 'expired' ? 'text-red-600' :
                                warningLevel === 'critical' ? 'text-red-600' :
                                warningLevel === 'warning' ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days ago` : `${daysRemaining} days`}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {warningLevel === 'expired' && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                  Expired
                                </span>
                              )}
                              {warningLevel === 'critical' && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  Critical
                                </span>
                              )}
                              {warningLevel === 'warning' && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                  Warning
                                </span>
                              )}
                              {warningLevel === 'normal' && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                  Active
                                </span>
                              )}
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
