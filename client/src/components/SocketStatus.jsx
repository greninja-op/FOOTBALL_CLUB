import { useSocket } from '../contexts/SocketContext'

/**
 * SocketStatus Component
 * 
 * Displays the current Socket.io connection status and reconnection attempts.
 * This is a utility component that can be added to any panel for debugging.
 * 
 * Usage:
 * import SocketStatus from '../components/SocketStatus'
 * 
 * <SocketStatus />
 */
const SocketStatus = () => {
  const { connected, reconnectAttempts, events } = useSocket()

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 border border-gray-200 max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="font-semibold text-sm">
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      
      {reconnectAttempts > 0 && (
        <div className="text-xs text-orange-600 mb-2">
          Reconnecting... Attempt {reconnectAttempts}/5
        </div>
      )}
      
      {reconnectAttempts >= 5 && !connected && (
        <div className="text-xs text-red-600 mb-2">
          Connection failed. Please refresh the page.
        </div>
      )}
      
      <div className="text-xs text-gray-600">
        Events received: {events.length}
      </div>
      
      {events.length > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          Last event: {events[events.length - 1].type}
        </div>
      )}
    </div>
  )
}

export default SocketStatus
