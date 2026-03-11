# Socket.io Integration Guide

## Overview
This guide explains how to use the SocketContext in your components to receive real-time updates.

## Quick Start

### 1. Import the Hook
```jsx
import { useSocket } from '../contexts/SocketContext'
```

### 2. Use in Your Component
```jsx
function MyComponent() {
  const { socket, connected, events, reconnectAttempts } = useSocket()
  
  // Your component logic
}
```

## Available Properties

### `socket`
- Type: `Socket | null`
- The Socket.io client instance
- Use for manual event emission (if needed)
- `null` when not authenticated

### `connected`
- Type: `boolean`
- Current connection status
- `true` when connected to server
- `false` when disconnected or not authenticated

### `events`
- Type: `Array<{type: string, data: any, timestamp: string}>`
- Array of all received events
- Each event has:
  - `type`: Event name (e.g., 'fixture:created')
  - `data`: Event payload from server
  - `timestamp`: ISO 8601 timestamp when event was received

### `reconnectAttempts`
- Type: `number`
- Current reconnection attempt count (0-5)
- Resets to 0 on successful connection
- Shows user when reconnecting

## Event Types

The system broadcasts 8 event types:

1. **fixture:created** - New fixture scheduled
2. **leave:approved** - Leave request approved
3. **leave:denied** - Leave request denied
4. **fine:issued** - Disciplinary fine issued
5. **injury:logged** - Injury recorded
6. **stats:updated** - Player stats updated
7. **inventory:assigned** - Equipment assigned
8. **settings:updated** - Club settings changed

## Usage Patterns

### Pattern 1: Listen for Specific Events

```jsx
import { useEffect } from 'react'
import { useSocket } from '../contexts/SocketContext'

function FixtureCalendar() {
  const { events } = useSocket()
  const [fixtures, setFixtures] = useState([])

  useEffect(() => {
    // Filter for fixture events
    const fixtureEvents = events.filter(e => e.type === 'fixture:created')
    
    if (fixtureEvents.length > 0) {
      // Refetch fixtures when new ones are created
      fetchFixtures()
    }
  }, [events])

  return (
    // Your component JSX
  )
}
```

### Pattern 2: Filter Events by User

```jsx
import { useEffect } from 'react'
import { useSocket } from '../contexts/SocketContext'
import { useAuth } from '../contexts/AuthContext'

function PlayerDashboard() {
  const { events } = useSocket()
  const { user } = useAuth()

  useEffect(() => {
    // Filter events for current player
    const myEvents = events.filter(e => {
      // Check if event is for this player
      return e.data.playerId === user.id
    })

    if (myEvents.length > 0) {
      const latestEvent = myEvents[myEvents.length - 1]
      
      // Handle different event types
      switch (latestEvent.type) {
        case 'fine:issued':
          showNotification('Fine issued', latestEvent.data)
          break
        case 'injury:logged':
          showNotification('Injury logged', latestEvent.data)
          break
        case 'stats:updated':
          refetchStats()
          break
        case 'inventory:assigned':
          refetchInventory()
          break
      }
    }
  }, [events, user.id])

  return (
    // Your component JSX
  )
}
```

### Pattern 3: Show Connection Status

```jsx
import { useSocket } from '../contexts/SocketContext'

function MyComponent() {
  const { connected, reconnectAttempts } = useSocket()

  return (
    <div>
      {!connected && reconnectAttempts > 0 && (
        <div className="alert alert-warning">
          Reconnecting... Attempt {reconnectAttempts}/5
        </div>
      )}
      
      {!connected && reconnectAttempts >= 5 && (
        <div className="alert alert-error">
          Connection lost. Please refresh the page.
        </div>
      )}
      
      {/* Your component content */}
    </div>
  )
}
```

### Pattern 4: Track Latest Event

```jsx
import { useEffect, useState } from 'react'
import { useSocket } from '../contexts/SocketContext'

function Navbar() {
  const { events } = useSocket()
  const [clubSettings, setClubSettings] = useState(null)

  useEffect(() => {
    // Find latest settings update
    const settingsEvents = events.filter(e => e.type === 'settings:updated')
    
    if (settingsEvents.length > 0) {
      const latestSettings = settingsEvents[settingsEvents.length - 1]
      setClubSettings(latestSettings.data)
    }
  }, [events])

  return (
    <nav>
      {clubSettings && (
        <img src={clubSettings.logoUrl} alt={clubSettings.clubName} />
      )}
    </nav>
  )
}
```

### Pattern 5: Show Toast Notifications

```jsx
import { useEffect } from 'react'
import { useSocket } from '../contexts/SocketContext'
import { toast } from 'react-toastify' // or your toast library

function NotificationListener() {
  const { events } = useSocket()

  useEffect(() => {
    if (events.length === 0) return

    const latestEvent = events[events.length - 1]
    
    // Show toast for latest event
    const messages = {
      'fixture:created': 'New fixture scheduled',
      'leave:approved': 'Leave request approved',
      'leave:denied': 'Leave request denied',
      'fine:issued': 'Fine issued',
      'injury:logged': 'Injury logged',
      'stats:updated': 'Stats updated',
      'inventory:assigned': 'Equipment assigned',
      'settings:updated': 'Settings updated'
    }

    const message = messages[latestEvent.type]
    if (message) {
      toast.info(message)
    }
  }, [events])

  return null // This is a listener component
}
```

## Best Practices

### 1. Filter Events Efficiently
```jsx
// ✅ Good - Filter once
const fixtureEvents = events.filter(e => e.type === 'fixture:created')

// ❌ Bad - Filter multiple times
events.filter(e => e.type === 'fixture:created').length
events.filter(e => e.type === 'fixture:created')[0]
```

### 2. Check Event Relevance
```jsx
// ✅ Good - Check if event is for current user
if (event.data.playerId === user.id) {
  handleEvent(event)
}

// ❌ Bad - Handle all events regardless
handleEvent(event)
```

### 3. Avoid Infinite Loops
```jsx
// ✅ Good - Proper dependency array
useEffect(() => {
  const latestEvent = events[events.length - 1]
  if (latestEvent?.type === 'fixture:created') {
    fetchFixtures()
  }
}, [events]) // Only re-run when events change

// ❌ Bad - Missing dependency
useEffect(() => {
  fetchFixtures() // Runs on every render
})
```

### 4. Handle Empty Events Array
```jsx
// ✅ Good - Check array length
if (events.length > 0) {
  const latestEvent = events[events.length - 1]
  // Process event
}

// ❌ Bad - No check
const latestEvent = events[events.length - 1] // undefined if empty
```

### 5. Debounce Frequent Updates
```jsx
import { useEffect, useRef } from 'react'

function MyComponent() {
  const { events } = useSocket()
  const timeoutRef = useRef(null)

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Debounce updates
    timeoutRef.current = setTimeout(() => {
      const statsEvents = events.filter(e => e.type === 'stats:updated')
      if (statsEvents.length > 0) {
        refetchStats()
      }
    }, 500) // Wait 500ms after last event

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [events])
}
```

## Debugging

### Enable Console Logs
The SocketContext already logs all events to console:
```
Socket.io connected: abc123
Received fixture:created event: {...}
Received leave:approved event: {...}
```

### Add SocketStatus Component
```jsx
import SocketStatus from '../components/SocketStatus'

function MyPanel() {
  return (
    <div>
      {/* Your panel content */}
      <SocketStatus /> {/* Shows connection status */}
    </div>
  )
}
```

### Inspect Events Array
```jsx
const { events } = useSocket()
console.log('All events:', events)
console.log('Event count:', events.length)
console.log('Latest event:', events[events.length - 1])
```

## Troubleshooting

### Socket Not Connecting
**Problem**: `connected` is always `false`

**Solutions**:
1. Check if user is authenticated (token exists)
2. Verify VITE_API_URL environment variable
3. Check server Socket.io is running
4. Check browser console for connection errors

### Events Not Received
**Problem**: `events` array is empty

**Solutions**:
1. Verify socket is connected (`connected === true`)
2. Check server is emitting events
3. Verify event names match exactly
4. Check browser console for event logs

### Reconnection Not Working
**Problem**: Socket doesn't reconnect after disconnect

**Solutions**:
1. Check `reconnectAttempts` count
2. If >= 5, refresh page
3. Check server is running
4. Verify network connection

### Memory Leak Warning
**Problem**: React warns about memory leaks

**Solutions**:
1. Ensure cleanup in useEffect:
```jsx
useEffect(() => {
  // Your logic
  
  return () => {
    // Cleanup
  }
}, [events])
```

## Performance Tips

1. **Limit Event Processing**: Only process events relevant to your component
2. **Use Memoization**: Memoize filtered event arrays
3. **Debounce Updates**: Don't refetch on every event
4. **Clean Up**: Remove event listeners in cleanup functions
5. **Lazy Load**: Only connect socket when needed

## Security Notes

1. **JWT Authentication**: Socket connection requires valid JWT token
2. **Auto Disconnect**: Socket disconnects on logout
3. **Server Validation**: All events validated by server
4. **No Client Emission**: Clients only receive events, don't emit
5. **Token Expiry**: Connection fails if token expires

## Next Steps

After integrating socket events in your components:
1. Test with multiple browser tabs
2. Verify events appear in real-time
3. Test reconnection by stopping server
4. Add toast notifications for user feedback
5. Implement event-specific UI updates

## Support

For issues or questions:
1. Check browser console for errors
2. Verify server logs for event emissions
3. Review this guide for usage patterns
4. Check Task 31 completion document
