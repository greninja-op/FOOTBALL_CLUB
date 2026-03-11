import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { socket } = useSocket()
  const navigate = useNavigate()
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch club settings on mount
  const fetchSettings = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/settings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  // Listen for settings:updated events
  useEffect(() => {
    if (!socket) return

    const handleSettingsUpdated = (data) => {
      console.log('Settings updated event received:', data)
      fetchSettings()
    }

    socket.on('settings:updated', handleSettingsUpdated)

    return () => {
      socket.off('settings:updated', handleSettingsUpdated)
    }
  }, [socket])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      manager: 'bg-blue-100 text-blue-800',
      coach: 'bg-green-100 text-green-800',
      player: 'bg-yellow-100 text-yellow-800'
    }
    return colors[role?.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Club Logo and Name */}
          <div className="flex items-center gap-3">
            {!loading && settings?.logoUrl ? (
              <img 
                src={settings.logoUrl} 
                alt={settings.clubName || 'Club Logo'} 
                className="h-10 w-10 object-contain"
              />
            ) : null}
            <h1 className="text-xl font-bold text-gray-800">
              {!loading && settings?.clubName ? settings.clubName : 'Football Club'}
            </h1>
          </div>

          {/* User Role Badge and Logout */}
          <div className="flex items-center gap-4">
            {user?.role && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(user.role)}`}>
                {user.role.toUpperCase()}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
