# NotificationCenter Component Guide

## Overview
The NotificationCenter is a global component that displays real-time notifications for all Socket.io events across the application.

## Features

### 1. Toast Notifications
- **Location**: Top-right corner of screen
- **Duration**: Auto-dismiss after 5 seconds
- **Interaction**: Click X to dismiss manually
- **Animation**: Smooth slide-in from right

### 2. Notification History
- **Access**: Click bell icon in bottom-right corner
- **Capacity**: Shows last 10 events
- **Order**: Most recent first
- **Scrolling**: Scrollable if more than 5 events

## Event Types & Visual Design

| Event Type | Icon | Color | Trigger |
|------------|------|-------|---------|
| `fixture:created` | ⚽ | Blue | Manager creates fixture |
| `leave:approved` | ✅ | Green | Coach approves leave request |
| `leave:denied` | ❌ | Red | Coach denies leave request |
| `fine:issued` | 💰 | Yellow | Coach logs disciplinary action |
| `injury:logged` | 🏥 | Orange | Coach logs injury |
| `stats:updated` | 📊 | Purple | Coach updates player stats |
| `inventory:assigned` | 📦 | Indigo | Manager assigns equipment |
| `settings:updated` | ⚙️ | Gray | Admin updates club settings |

## Message Formats

### fixture:created
```
"New fixture: [Opponent Name]"
Example: "New fixture: Manchester United"
```

### leave:approved
```
"Your leave request has been approved"
```

### leave:denied
```
"Your leave request has been denied"
```

### fine:issued
```
"Fine issued: $[amount] for [offense]"
Example: "Fine issued: $500 for Late to training"
```

### injury:logged
```
"Injury logged: [injury type]"
Example: "Injury logged: Hamstring strain"
```

### stats:updated
```
"Your performance stats have been updated"
```

### inventory:assigned
```
"Equipment assigned: [item name]"
Example: "Equipment assigned: Training Jersey #10"
```

### settings:updated
```
"Club settings have been updated"
```

## Timestamp Display

Notifications show relative timestamps:
- **< 1 minute**: "Just now"
- **< 60 minutes**: "5m ago", "30m ago"
- **< 24 hours**: "2h ago", "12h ago"
- **≥ 24 hours**: Full date (e.g., "12/15/2023")

## Component Architecture

### State
```javascript
activeNotifications: Array<Notification>  // Currently visible toasts
showHistory: boolean                      // History panel visibility
```

### Notification Object
```javascript
{
  id: string,           // Unique identifier
  type: string,         // Event type
  message: string,      // Formatted message
  icon: string,         // Emoji icon
  color: string,        // Tailwind color class
  timestamp: string,    // ISO timestamp
  data: object         // Original event data
}
```

### Dependencies
- `useSocket()` hook from SocketContext
- React hooks: `useState`, `useEffect`
- Tailwind CSS for styling

## Usage in Application

The NotificationCenter is automatically included in App.jsx:

```jsx
<AuthProvider>
  <SocketProvider>
    <Router>
      <NotificationCenter />  {/* Global component */}
      <Routes>...</Routes>
    </Router>
  </SocketProvider>
</AuthProvider>
```

No additional setup required in individual panels.

## Customization

### Changing Auto-Dismiss Duration
Edit the timeout in NotificationCenter.jsx:
```javascript
const timer = setTimeout(() => {
  // Dismiss logic
}, 5000)  // Change 5000 to desired milliseconds
```

### Changing History Capacity
Edit the slice parameter:
```javascript
const getEventHistory = () => {
  return events.slice(-10).reverse()  // Change -10 to desired count
}
```

### Adding New Event Types
1. Add case to `formatEventMessage()`
2. Add case to `getEventIcon()`
3. Add case to `getEventColor()`

Example:
```javascript
case 'new:event':
  return 'New event message'

case 'new:event':
  return '🎉'

case 'new:event':
  return 'bg-pink-500'
```

## Accessibility

- All interactive elements have ARIA labels
- Keyboard accessible (Tab navigation)
- High contrast colors for readability
- Clear visual hierarchy
- Semantic HTML structure

## Performance Considerations

- Notifications auto-dismiss to prevent memory buildup
- History limited to last 10 events
- Timers cleaned up on unmount
- Component only renders when authenticated
- Efficient state updates with functional setState

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires ES6+ support
- CSS Grid and Flexbox support
- Fixed positioning support

## Troubleshooting

### Notifications not appearing
1. Check Socket.io connection status
2. Verify user is authenticated
3. Check browser console for errors
4. Verify event is being emitted from backend

### History not showing events
1. Verify events array in SocketContext
2. Check if events are being added to state
3. Verify getEventHistory() is returning data

### Styling issues
1. Ensure Tailwind CSS is properly configured
2. Check for CSS conflicts
3. Verify z-index values (component uses z-50)

## Future Enhancements

Potential improvements:
- Sound notifications (optional)
- Notification preferences per user
- Filter notifications by type
- Mark notifications as read
- Persistent notification storage
- Desktop notifications API
- Notification grouping
- Custom notification sounds per event type
