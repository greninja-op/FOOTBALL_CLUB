import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth()
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [events, setEvents] = useState([])
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  
  const socketRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  useEffect(() => {
    // Only establish connection if user is authenticated
    if (!token || !user) {
      // Clean up existing connection if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setSocket(null)
        setConnected(false)
        setEvents([])
        setReconnectAttempts(0)
      }
      return
    }

    // Initialize Socket.io connection with JWT authentication
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: {
        token: token
      },
      autoConnect: true,
      reconnection: false // We'll handle reconnection manually with exponential backoff
    })

    socketRef.current = newSocket
    setSocket(newSocket)

    // Handle successful connection
    newSocket.on('connect', () => {
      console.log('Socket.io connected:', newSocket.id)
      setConnected(true)
      reconnectAttemptsRef.current = 0
      setReconnectAttempts(0) // Reset reconnect attempts on successful connection
    })

    // Handle disconnection
    newSocket.on('disconnect', (reason) => {
      console.log('Socket.io disconnected:', reason)
      setConnected(false)

      // Attempt reconnection with exponential backoff if disconnection was not intentional
      if (reason !== 'io client disconnect' && reconnectAttemptsRef.current < maxReconnectAttempts) {
        attemptReconnection()
      }
    })

    // Handle connection errors
    newSocket.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error.message)
      setConnected(false)

      // Attempt reconnection with exponential backoff
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        attemptReconnection()
      }
    })

    // Listen for all 8 real-time event types
    
    // 1. fixture:created
    newSocket.on('fixture:created', (data) => {
      console.log('Received fixture:created event:', data)
      addEvent('fixture:created', data)
    })

    // 2. leave:approved
    newSocket.on('leave:approved', (data) => {
      console.log('Received leave:approved event:', data)
      addEvent('leave:approved', data)
    })

    // 3. leave:denied
    newSocket.on('leave:denied', (data) => {
      console.log('Received leave:denied event:', data)
      addEvent('leave:denied', data)
    })

    // 4. fine:issued
    newSocket.on('fine:issued', (data) => {
      console.log('Received fine:issued event:', data)
      addEvent('fine:issued', data)
    })

    // 5. injury:logged
    newSocket.on('injury:logged', (data) => {
      console.log('Received injury:logged event:', data)
      addEvent('injury:logged', data)
    })

    // 6. stats:updated
    newSocket.on('stats:updated', (data) => {
      console.log('Received stats:updated event:', data)
      addEvent('stats:updated', data)
    })

    // 7. inventory:assigned
    newSocket.on('inventory:assigned', (data) => {
      console.log('Received inventory:assigned event:', data)
      addEvent('inventory:assigned', data)
    })

    // 8. settings:updated
    newSocket.on('settings:updated', (data) => {
      console.log('Received settings:updated event:', data)
      addEvent('settings:updated', data)
    })

    // Cleanup on unmount or when token changes
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (newSocket) {
        newSocket.disconnect()
      }
    }
  }, [token, user])

  // Helper function to add events to state with timestamp
  const addEvent = (eventType, data) => {
    const event = {
      type: eventType,
      data: data,
      timestamp: new Date().toISOString()
    }
    
    setEvents((prevEvents) => [...prevEvents, event])
  }

  // Reconnection logic with exponential backoff
  const attemptReconnection = () => {
    const nextAttempt = reconnectAttemptsRef.current + 1

    if (nextAttempt > maxReconnectAttempts) {
      console.error('Max reconnection attempts reached. Please refresh the page.')
      return
    }

    reconnectAttemptsRef.current = nextAttempt
    setReconnectAttempts(nextAttempt)

    // Calculate exponential backoff delay: 1s, 2s, 4s, 8s, 16s
    const delay = Math.min(1000 * Math.pow(2, nextAttempt - 1), 16000)

    console.log(`Attempting reconnection ${nextAttempt}/${maxReconnectAttempts} in ${delay}ms...`)

    reconnectTimeoutRef.current = setTimeout(() => {
      if (socketRef.current && !socketRef.current.connected) {
        socketRef.current.connect()
      }
    }, delay)
  }

  const value = {
    socket,
    connected,
    events,
    reconnectAttempts
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}
