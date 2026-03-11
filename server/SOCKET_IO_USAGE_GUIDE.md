# Socket.io Usage Guide for Controllers

## Overview
This guide explains how to use the Socket.io instance in controllers to emit real-time events to connected clients.

## Setup Complete ✓
- Socket.io server initialized with JWT authentication
- IO instance available via `getIO()` function
- All socket connections require valid JWT token

## How to Use in Controllers

### Step 1: Import the getIO function
```javascript
const { getIO } = require('../utils/socketIO');
```

### Step 2: Get the io instance and emit events
```javascript
// In your controller function
async function createFixture(req, res) {
  try {
    // ... your business logic ...
    const fixture = await Fixture.create(fixtureData);
    
    // Get io instance and emit event
    const io = getIO();
    io.emit('fixture:created', {
      fixtureId: fixture._id,
      opponent: fixture.opponent,
      date: fixture.date,
      location: fixture.location
    });
    
    res.status(201).json({ fixture });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

## Event Types to Implement

Based on Requirements 18.1-18.8, the following events should be emitted:

### 1. fixture:created
**Controller:** `fixtureController.js`
**Function:** `createFixture()`
**Payload:**
```javascript
{
  fixtureId: ObjectId,
  opponent: String,
  date: Date,
  location: String,
  matchType: String
}
```

### 2. leave:approved
**Controller:** `leaveController.js`
**Function:** `approveRequest()`
**Payload:**
```javascript
{
  requestId: ObjectId,
  playerId: ObjectId,
  startDate: Date,
  endDate: Date
}
```

### 3. leave:denied
**Controller:** `leaveController.js`
**Function:** `denyRequest()`
**Payload:**
```javascript
{
  requestId: ObjectId,
  playerId: ObjectId,
  reason: String (optional)
}
```

### 4. fine:issued
**Controller:** `disciplinaryController.js`
**Function:** `logAction()`
**Payload:**
```javascript
{
  actionId: ObjectId,
  playerId: ObjectId,
  offense: String,
  fineAmount: Number,
  dateIssued: Date
}
```

### 5. injury:logged
**Controller:** `injuryController.js`
**Function:** `logInjury()`
**Payload:**
```javascript
{
  injuryId: ObjectId,
  playerId: ObjectId,
  injuryType: String,
  severity: String,
  expectedRecovery: Date
}
```

### 6. stats:updated
**Controller:** `profileController.js`
**Function:** `updateStats()`
**Payload:**
```javascript
{
  playerId: ObjectId,
  stats: {
    goals: Number,
    assists: Number,
    appearances: Number,
    rating: Number
  }
}
```

### 7. inventory:assigned
**Controller:** `inventoryController.js`
**Function:** `assignItem()`
**Payload:**
```javascript
{
  itemId: ObjectId,
  itemName: String,
  playerId: ObjectId,
  assignedAt: Date
}
```

### 8. settings:updated
**Controller:** `settingsController.js`
**Function:** `updateSettings()`
**Payload:**
```javascript
{
  clubName: String,
  logoUrl: String,
  updatedAt: Date
}
```

## Example: Complete Controller Implementation

```javascript
const { getIO } = require('../utils/socketIO');
const LeaveRequest = require('../models/LeaveRequest');

/**
 * Approve a leave request
 * Emits leave:approved event to all connected clients
 */
async function approveRequest(req, res) {
  try {
    const { id } = req.params;
    const coachId = req.user.id;

    // Update leave request
    const leaveRequest = await LeaveRequest.findByIdAndUpdate(
      id,
      {
        status: 'Approved',
        reviewedBy: coachId,
        reviewedAt: new Date()
      },
      { new: true }
    ).populate('playerId', 'fullName');

    if (!leaveRequest) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    // Emit real-time event
    const io = getIO();
    io.emit('leave:approved', {
      requestId: leaveRequest._id,
      playerId: leaveRequest.playerId._id,
      playerName: leaveRequest.playerId.fullName,
      startDate: leaveRequest.startDate,
      endDate: leaveRequest.endDate
    });

    res.json({ leaveRequest });
  } catch (error) {
    console.error('Error approving leave request:', error);
    res.status(500).json({ error: 'Failed to approve leave request' });
  }
}

module.exports = { approveRequest };
```

## Error Handling

If `getIO()` is called before the server is initialized, it will throw an error:
```javascript
Error: Socket.io has not been initialized. Call setIO() first.
```

This should never happen in production since `setIO()` is called during server startup in `server.js`.

## Testing Socket Events

### Manual Testing with Browser Console
1. Start the server: `npm start`
2. Open browser console on the client application
3. Check Socket.io connection in Network tab (WebSocket)
4. Trigger a controller action (e.g., create a fixture)
5. Verify event is received in browser console

### Automated Testing
For automated testing, you can:
1. Install `socket.io-client` in server dev dependencies
2. Create test scripts that connect to the server
3. Trigger controller actions via API
4. Listen for events on the test client
5. Assert that events are received with correct payload

## Client-Side Implementation (Next Steps)

The frontend needs to:
1. Create SocketContext with Socket.io connection
2. Pass JWT token in connection auth: `{ auth: { token } }`
3. Listen for all 8 event types
4. Update component state when events are received
5. Display notifications for relevant events

Example client connection:
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: localStorage.getItem('authToken')
  }
});

socket.on('fixture:created', (data) => {
  console.log('New fixture created:', data);
  // Update UI
});
```

## Security Notes

- All socket connections require valid JWT token
- Tokens are verified using the same secret as HTTP API
- Each socket has `userId` and `userRole` attached
- Future enhancement: Role-based event filtering
  - Example: Only send `fine:issued` to the specific player
  - Example: Only send `settings:updated` to admin/manager roles

## Troubleshooting

### Issue: "Socket.io has not been initialized"
**Solution:** Ensure `setIO(io)` is called in `server.js` after `initializeSocketServer()`

### Issue: Events not received on client
**Solution:** 
1. Check client is connected (socket.connected === true)
2. Verify JWT token is valid
3. Check browser console for connection errors
4. Verify event name matches exactly (case-sensitive)

### Issue: Authentication failed on socket connection
**Solution:**
1. Verify JWT token is passed in `auth.token`
2. Check token is not expired (8-hour expiry)
3. Verify JWT_SECRET matches between client and server
4. Check server logs for specific error message

## Next Steps

1. **Task 30**: Update all controllers to emit events (see event list above)
2. **Task 31**: Create SocketContext and SocketProvider in frontend
3. **Task 32**: Update frontend components to listen for events
4. **Task 33**: Create NotificationCenter component for toast notifications
