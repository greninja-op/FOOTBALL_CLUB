# Socket.io Quick Reference Card

## Import
```jsx
import { useSocket } from '../contexts/SocketContext'
```

## Hook Usage
```jsx
const { socket, connected, events, reconnectAttempts } = useSocket()
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `socket` | `Socket \| null` | Socket.io instance |
| `connected` | `boolean` | Connection status |
| `events` | `Array<Event>` | All received events |
| `reconnectAttempts` | `number` | Reconnection count (0-5) |

## Event Structure
```javascript
{
  type: 'fixture:created',      // Event name
  data: { /* payload */ },       // Event data
  timestamp: '2024-01-15T...'    // ISO 8601 timestamp
}
```

## Event Types

| Event | Description | Emitted By |
|-------|-------------|------------|
| `fixture:created` | New fixture scheduled | Manager |
| `leave:approved` | Leave request approved | Coach |
| `leave:denied` | Leave request denied | Coach |
| `fine:issued` | Disciplinary fine issued | Coach |
| `injury:logged` | Injury recorded | Coach |
| `stats:updated` | Player stats updated | Coach |
| `inventory:assigned` | Equipment assigned | Manager |
| `settings:updated` | Club settings changed | Admin |

## Common Patterns

### Listen for Events
```jsx
useEffect(() => {
  const myEvents = events.filter(e => e.type === 'fixture:created')
  if (myEvents.length > 0) {
    // Handle events
  }
}, [events])
```

### Filter by User
```jsx
const myEvents = events.filter(e => e.data.playerId === user.id)
```

### Get Latest Event
```jsx
const latest = events[events.length - 1]
```

### Show Connection Status
```jsx
{!connected && <div>Disconnected</div>}
{reconnectAttempts > 0 && <div>Reconnecting {reconnectAttempts}/5</div>}
```

## Reconnection

- **Strategy**: Exponential backoff
- **Delays**: 1s, 2s, 4s, 8s, 16s
- **Max Attempts**: 5
- **Reset**: On successful connection
- **Manual**: Refresh page after 5 failed attempts

## Requirements

- User must be authenticated (token exists)
- AuthContext must be available
- Server must be running with Socket.io enabled
- VITE_API_URL must be configured

## Files

- **Context**: `client/src/contexts/SocketContext.jsx`
- **Hook**: `useSocket()` exported from SocketContext
- **Status Component**: `client/src/components/SocketStatus.jsx`
- **Guide**: `client/SOCKET_INTEGRATION_GUIDE.md`
- **Completion**: `client/TASK_31_COMPLETION.md`
