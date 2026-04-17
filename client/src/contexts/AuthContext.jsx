import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('authToken'))
  const [loading, setLoading] = useState(true)

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('authToken')
      
      if (!storedToken) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          // Restore fullName from localStorage if available
          const storedFullName = localStorage.getItem('userFullName')
          const storedEmail = localStorage.getItem('userEmail')
          setUser({ ...data.user, fullName: storedFullName || null, email: storedEmail || null })
          setToken(storedToken)
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('authToken')
          localStorage.removeItem('userFullName')
          localStorage.removeItem('userEmail')
          setToken(null)
          setUser(null)
        }
      } catch (error) {
        console.error('Token verification failed:', error)
        localStorage.removeItem('authToken')
        localStorage.removeItem('userFullName')
        localStorage.removeItem('userEmail')
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    verifyToken()
  }, [])

  const login = async (identifier, password) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: identifier, password })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Authentication failed')
      }

      const data = await response.json()
      
      // Store token and user info in localStorage
      localStorage.setItem('authToken', data.token)
      if (data.fullName) localStorage.setItem('userFullName', data.fullName)
      if (data.email) localStorage.setItem('userEmail', data.email)
      setToken(data.token)
      setUser({ id: data.userId, role: data.role, fullName: data.fullName || null, email: data.email || null })

      return { success: true, role: data.role }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userFullName')
    localStorage.removeItem('userEmail')
    setToken(null)
    setUser(null)
  }

  const value = {
    user,
    token,
    loading,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
