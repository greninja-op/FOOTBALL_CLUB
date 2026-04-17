import { useState, useEffect } from 'react'
import { useSocket } from '../contexts/SocketContext'
import { useAuth } from '../contexts/AuthContext'

const NotificationCenter = () => {
  const { user, token } = useAuth()
  const { events } = useSocket()
  const [activeNotifications, setActiveNotifications] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  // Process new events and create notifications
  useEffect(() => {
    if (!user || !token || events.length === 0) return

    const latestEvent = events[events.length - 1]
    const notification = createNotification(latestEvent)

    // Add notification to active list
    setActiveNotifications((prev) => [...prev, notification])

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      setActiveNotifications((prev) => 
        prev.filter((n) => n.id !== notification.id)
      )
    }, 5000)

    return () => clearTimeout(timer)
  }, [events, user, token])

  // Create notification object from event
  const createNotification = (event) => {
    const id = `${event.type}-${event.timestamp}-${Math.random()}`
    const message = formatEventMessage(event)
    const icon = getEventIcon(event.type)
    const color = getEventColor(event.type)

    return {
      id,
      type: event.type,
      message,
      icon,
      color,
      timestamp: event.timestamp,
      data: event.data
    }
  }

  // Format event message for display
  const formatEventMessage = (event) => {
    switch (event.type) {
      case 'fixture:created':
        return `New fixture: ${event.data.opponent || 'Match scheduled'}`
      
      case 'leave:approved':
        return 'Your leave request has been approved'
      
      case 'leave:denied':
        return 'Your leave request has been denied'
      
      case 'fine:issued':
        return `Fine issued: $${event.data.amount || 0} for ${event.data.offense || 'violation'}`
      
      case 'injury:logged':
        return `Injury logged: ${event.data.injuryType || 'Injury recorded'}`
      
      case 'stats:updated':
        return 'Your performance stats have been updated'
      
      case 'inventory:assigned':
        return `Equipment assigned: ${event.data.itemName || 'Item'}`
      
      case 'settings:updated':
        return 'Club settings have been updated'
      
      default:
        return 'New notification'
    }
  }

  // Get icon for event type
  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'fixture:created':
        return '⚽'
      case 'leave:approved':
        return '✅'
      case 'leave:denied':
        return '❌'
      case 'fine:issued':
        return '💰'
      case 'injury:logged':
        return '🏥'
      case 'stats:updated':
        return '📊'
      case 'inventory:assigned':
        return '📦'
      case 'settings:updated':
        return '⚙️'
      default:
        return '🔔'
    }
  }

  // Get color scheme for event type
  const getEventColor = (eventType) => {
    switch (eventType) {
      case 'fixture:created':
        return 'bg-blue-500'
      case 'leave:approved':
        return 'bg-green-500'
      case 'leave:denied':
        return 'bg-red-500'
      case 'fine:issued':
        return 'bg-yellow-500'
      case 'injury:logged':
        return 'bg-orange-500'
      case 'stats:updated':
        return 'bg-purple-500'
      case 'inventory:assigned':
        return 'bg-indigo-500'
      case 'settings:updated':
        return 'bg-gray-500'
      default:
        return 'bg-blue-500'
    }
  }

  // Dismiss notification manually
  const dismissNotification = (id) => {
    setActiveNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  // Get last 10 events for history
  const getEventHistory = () => {
    return events.slice(-10).reverse()
  }

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  // Don't render if user is not authenticated
  if (!user || !token) {
    return null
  }

  const hideHistoryButton = user.role === 'admin'

  return (
    <>
      {/* Active Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {activeNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`${notification.color} text-white rounded-lg shadow-lg p-4 flex items-start space-x-3 animate-slide-in`}
          >
            <span className="text-2xl">{notification.icon}</span>
            <div className="flex-1">
              <p className="font-semibold text-sm">{notification.message}</p>
              <p className="text-xs opacity-90 mt-1">
                {formatTimestamp(notification.timestamp)}
              </p>
            </div>
            <button
              onClick={() => dismissNotification(notification.id)}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Dismiss notification"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Notification History Toggle Button */}
      {!hideHistoryButton && (
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-colors"
          aria-label="Toggle notification history"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {events.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {Math.min(events.length, 99)}
            </span>
          )}
        </button>
      )}

      {/* Notification History Panel */}
      {showHistory && !hideHistoryButton && (
        <div className="fixed bottom-20 right-4 z-50 bg-white rounded-lg shadow-xl w-96 max-h-96 overflow-hidden">
          <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
            <h3 className="font-semibold">Notification History</h3>
            <button
              onClick={() => setShowHistory(false)}
              className="text-white hover:text-gray-300 transition-colors"
              aria-label="Close history"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          
          <div className="overflow-y-auto max-h-80">
            {getEventHistory().length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <svg
                  className="w-12 h-12 mx-auto mb-2 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {getEventHistory().map((event, index) => {
                  const notification = createNotification(event)
                  return (
                    <div
                      key={`${event.type}-${event.timestamp}-${index}`}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{notification.icon}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimestamp(event.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom animation styles */}
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  )
}

export default NotificationCenter
