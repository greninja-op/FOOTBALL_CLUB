import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [logoUrl, setLogoUrl] = useState(null)
  const [clubName, setClubName] = useState('')
  const navigate = useNavigate()
  const { login, user } = useAuth()

  useEffect(() => {
    if (user) redirectToPanel(user.role)
  }, [user])

  // Fetch club logo and name
  useEffect(() => {
    fetch(`${API_URL}/api/public/home`)
      .then(res => res.json())
      .then(data => {
        if (data?.club?.logoUrl) {
          setLogoUrl(`${API_URL}${data.club.logoUrl}`)
        }
        if (data?.club?.clubName) {
          setClubName(data.club.clubName)
        }
      })
      .catch(() => {})
  }, [])

  const redirectToPanel = (role) => {
    const roleRoutes = { admin: '/admin', manager: '/manager', coach: '/coach', player: '/player' }
    navigate(roleRoutes[role] || '/')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!identifier || !password) {
      setError('Please enter your email/name and password')
      return
    }

    setLoading(true)
    const loginIdentifier = identifier.trim()
    const result = await login(loginIdentifier, password)
    setLoading(false)

    if (result.success) {
      redirectToPanel(result.role)
    } else {
      setError(result.error || 'Authentication failed. Please check your credentials.')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        position: 'relative',
        zIndex: 3,
      }}
    >
      {/* Glow background */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(ellipse at 50% 40%, rgba(200,16,46,0.12), transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: 420,
        position: 'relative',
      }}>
        {/* Crest / Logo top */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'rgba(200,16,46,0.12)',
            border: '1px solid rgba(200,16,46,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            animation: 'crestGlow 4s ease-in-out infinite',
            overflow: 'hidden',
            padding: logoUrl ? 6 : 0,
          }}>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={clubName || 'Club Logo'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  borderRadius: '50%',
                }}
              />
            ) : (
              <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, letterSpacing: 4, color: 'rgba(255,255,255,0.8)' }}>FC</span>
            )}
          </div>
          <div style={{ marginTop: 16, fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, letterSpacing: 6, color: 'white' }}>
            STAFF PORTAL
          </div>
          <p style={{ marginTop: 6, fontSize: 12, color: 'rgba(255,255,255,0.35)', letterSpacing: 1 }}>
            {clubName || 'Club Management System'}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(10,10,24,0.8)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 24,
          padding: '40px 36px',
          boxShadow: '0 0 80px rgba(0,0,0,0.5)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {error && (
              <div style={{
                padding: '12px 16px',
                borderRadius: 12,
                background: 'rgba(200,16,46,0.1)',
                border: '1px solid rgba(200,16,46,0.3)',
                fontSize: 13,
                color: '#fca5a5',
              }}>
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="identifier"
                style={{ display: 'block', fontSize: 9, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}
              >
                Email or Full Name
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={loading}
                placeholder="your.email@club.com or Full Name"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: 14,
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(200,16,46,0.5)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                style={{ display: 'block', fontSize: 9, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: 14,
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(200,16,46,0.5)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              />
            </div>

            <button
              type="submit"
              id="login-submit"
              disabled={loading}
              style={{
                padding: '14px',
                borderRadius: 12,
                background: loading ? 'rgba(200,16,46,0.5)' : 'var(--color-primary)',
                border: 'none',
                color: 'white',
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 15,
                letterSpacing: 4,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 20px rgba(200,16,46,0.3)',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(200,16,46,0.5)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(200,16,46,0.3)';
              }}
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>
        </div>

        {/* Back to home */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <a
            href="/"
            style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', letterSpacing: 2, transition: 'color 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
          >
            ← Back to Homepage
          </a>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
