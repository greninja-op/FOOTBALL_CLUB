import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const Navbar = ({ menuItems, activeSection, onMenuClick }) => {
  const { user, logout } = useAuth()
  const { socket } = useSocket()
  const navigate = useNavigate()
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [density, setDensity] = useState(() => localStorage.getItem('uiDensity') || 'comfortable')

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

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.density = density
  }, [density])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleDensityChange = (nextDensity) => {
    setDensity(nextDensity)
    localStorage.setItem('uiDensity', nextDensity)
    document.documentElement.dataset.density = nextDensity
  }

  const getRoleBadgeStyle = (role) => {
    const styles = {
      admin: { background: 'rgba(168,85,247,0.15)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)' },
      manager: { background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' },
      coach: { background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' },
      player: { background: 'rgba(234,179,8,0.15)', color: '#facc15', border: '1px solid rgba(234,179,8,0.3)' }
    }
    return styles[role?.toLowerCase()] || { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.2)' }
  }

  const roleStyle = user?.role ? getRoleBadgeStyle(user.role) : {}
  const showMenu = menuItems && menuItems.length > 0
  const logoSrc = settings?.logoUrl
    ? settings.logoUrl.startsWith('http')
      ? settings.logoUrl
      : `${API_URL}${settings.logoUrl}`
    : null

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      transition: 'background 0.4s ease, border-color 0.4s ease',
      borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.06)' : 'transparent'}`,
      background: scrolled ? 'rgba(4,4,12,0.85)' : 'transparent',
      backdropFilter: scrolled ? 'blur(24px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
    }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`grid items-center gap-6 py-4 ${showMenu ? 'md:grid-cols-[1fr_auto_1fr]' : 'md:grid-cols-[1fr_auto]'}`}
        >
          <div className="flex min-w-0 items-center gap-3">
            {!loading && logoSrc ? (
              <div
                className="crest-glow"
                style={{
                  width: 40,
                  height: 40,
                  minWidth: 40,
                  minHeight: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(200,16,46,0.12)',
                  border: '1px solid rgba(200,16,46,0.3)',
                  padding: 4,
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <img 
                  src={logoSrc}
                  alt={settings.clubName || 'Club Logo'} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    objectPosition: 'center',
                  }}
                />
              </div>
            ) : (
              <div
                className="crest-glow"
                style={{
                  width: 40,
                  height: 40,
                  minWidth: 40,
                  minHeight: 40,
                  borderRadius: '50%',
                  background: 'rgba(200,16,46,0.12)',
                  border: '1px solid rgba(200,16,46,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 16,
                  letterSpacing: 2,
                  color: 'rgba(255,255,255,0.7)',
                  flexShrink: 0,
                }}
              >
                FC
              </div>
            )}
            <span style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 20,
              letterSpacing: 4,
              color: 'white',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {!loading && settings?.clubName ? settings.clubName : 'Football Club Management System'}
            </span>
          </div>

          {showMenu && (
            <nav className="hidden items-center justify-center gap-10 md:flex">
              {menuItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => onMenuClick && onMenuClick(item.id)}
                    className="nav-menu-item"
                    style={{
                      position: 'relative',
                      padding: '0 0 10px',
                      fontSize: 10,
                      fontFamily: "'Bebas Neue', sans-serif",
                      letterSpacing: 4,
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      background: 'transparent',
                      border: 'none',
                      whiteSpace: 'nowrap',
                      color: 'white',
                    }}
                  >
                    {item.label}
                    <span style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: 'var(--color-primary)',
                      display: 'block',
                    }} className="nav-underline" />
                  </button>
                ))}
            </nav>
          )}

          <div className="relative flex items-center justify-end gap-6">
            {user?.role && (
              <button
                onClick={() => setShowAccountMenu((current) => !current)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 100,
                  fontSize: 10,
                  fontFamily: "'Bebas Neue', sans-serif",
                  letterSpacing: 4,
                  cursor: 'pointer',
                  ...roleStyle,
                }}
              >
                {user.role.toUpperCase()}
              </button>
            )}

            {showAccountMenu && (
              <div className="absolute right-28 top-12 z-50 w-72 rounded-2xl border border-white/10 bg-gray-950/95 p-4 text-left shadow-2xl backdrop-blur">
                <div className="mb-3 border-b border-white/10 pb-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/45">Account</p>
                  <p className="mt-2 truncate text-sm font-semibold text-white">{user?.fullName || user?.email}</p>
                  <p className="text-xs capitalize text-gray-400">{user?.role}</p>
                </div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                  UI Density
                </label>
                <select
                  value={density}
                  onChange={(event) => handleDensityChange(event.target.value)}
                  className="ui-select mb-3"
                >
                  <option value="comfortable">Comfortable</option>
                  <option value="compact">Compact</option>
                </select>
                <p className="text-xs leading-5 text-gray-500">
                  Password changes are handled by the admin user-management flow in this build.
                </p>
                <button
                  onClick={() => setShowAccountMenu(false)}
                  className="mt-3 w-full rounded-full border border-white/15 bg-gray-700/40 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700/60"
                >
                  Close
                </button>
              </div>
            )}

            <button
              onClick={handleLogout}
              style={{
                padding: '8px 20px',
                fontSize: 13,
                fontFamily: "'Bebas Neue', sans-serif",
                letterSpacing: 3,
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 12px rgba(200,16,46,0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(200,16,46,0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = ''
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(200,16,46,0.3)'
              }}
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
