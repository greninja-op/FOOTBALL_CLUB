# Middleware Flow Diagram

## Request Flow Through Middleware Chain

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT REQUEST                          │
│                  POST /api/users (Create User)                  │
│              Authorization: Bearer <jwt_token>                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    1. authMiddleware.js                         │
├─────────────────────────────────────────────────────────────────┤
│  • Extract Bearer token from Authorization header               │
│  • Verify JWT using JWT_SECRET                                  │
│  • Decode payload: {id, role, iat, exp}                        │
│  • Attach req.user = {id, role}                                │
│                                                                 │
│  ✓ Success: Call next()                                        │
│  ✗ Failure: Return 401 (Unauthorized)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    2. roleGuard.js                              │
│                  requireRole(['admin'])                         │
├─────────────────────────────────────────────────────────────────┤
│  • Check if req.user exists                                     │
│  • Check if req.user.role exists                                │
│  • Check if req.user.role in allowedRoles                       │
│                                                                 │
│  ✓ Success: Call next()                                        │
│  ✗ Failure: Return 403 (Forbidden)                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   3. loggerMiddleware.js                        │
├─────────────────────────────────────────────────────────────────┤
│  • Check if method is POST/PUT/PATCH/DELETE                     │
│  • Override res.json to intercept response                      │
│  • Call next() immediately (non-blocking)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    4. Controller Action                         │
│                  userController.create()                        │
├─────────────────────────────────────────────────────────────────┤
│  • Execute business logic                                       │
│  • Create user in database                                      │
│  • Return response: res.json({user: {...}})                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              3b. loggerMiddleware (Async Logging)               │
├─────────────────────────────────────────────────────────────────┤
│  • Intercept res.json call                                      │
│  • Check if status is 2xx (success)                             │
│  • Extract action, collection, targetId                         │
│  • Create SystemLog entry asynchronously                        │
│  • Call original res.json (send response)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT RESPONSE                            │
│                   200 OK {user: {...}}                          │
└─────────────────────────────────────────────────────────────────┘
```

## Authentication Flow Detail

```
┌──────────────┐
│   Client     │
└──────┬───────┘
       │
       │ 1. POST /api/auth/login
       │    {email, password}
       ▼
┌──────────────────────────┐
│  authController.login()  │
├──────────────────────────┤
│ • Find user by email     │
│ • bcrypt.compare()       │
│ • Generate JWT token     │
│ • Return {token, role}   │
└──────┬───────────────────┘
       │
       │ 2. Store token in localStorage
       ▼
┌──────────────┐
│   Client     │
└──────┬───────┘
       │
       │ 3. Subsequent requests
       │    Authorization: Bearer <token>
       ▼
┌──────────────────────────┐
│   authMiddleware.js      │
├──────────────────────────┤
│ • Verify token           │
│ • Attach req.user        │
└──────┬───────────────────┘
       │
       │ 4. Access protected routes
       ▼
┌──────────────┐
│  Protected   │
│   Routes     │
└──────────────┘
```

## Role-Based Authorization Examples

### Example 1: Admin-Only Route

```javascript
router.get('/api/users',
  authMiddleware,           // Validates JWT
  requireRole(['admin']),   // Checks role = 'admin'
  userController.getAll     // Executes if authorized
);
```

**Flow:**
```
Request → authMiddleware → requireRole(['admin']) → controller
                ↓                    ↓
         req.user = {id, role}   Check: role === 'admin'
                                       ↓
                                  ✓ admin → next()
                                  ✗ other → 403
```

### Example 2: Multi-Role Route

```javascript
router.post('/api/fixtures',
  authMiddleware,
  requireRole(['manager', 'admin']),
  loggerMiddleware,
  fixtureController.create
);
```

**Flow:**
```
Request → authMiddleware → requireRole(['manager','admin']) → loggerMiddleware → controller
                ↓                         ↓                          ↓
         req.user = {id, role}   Check: role in ['manager','admin']  Override res.json
                                       ↓                              ↓
                                  ✓ match → next()              Intercept response
                                  ✗ no match → 403              Log to SystemLog
```

### Example 3: Player-Only Route

```javascript
router.post('/api/leave',
  authMiddleware,
  requireRole(['player']),
  leaveController.submit
);
```

**Flow:**
```
Request → authMiddleware → requireRole(['player']) → controller
                ↓                    ↓
         req.user = {id, role}   Check: role === 'player'
                                       ↓
                                  ✓ player → next()
                                  ✗ other → 403
```

## Error Handling Flow

### Scenario 1: Missing Token

```
Request (no Authorization header)
    ↓
authMiddleware
    ↓
Check: authHeader exists?
    ↓
✗ No
    ↓
Return 401: "No authorization header provided"
    ↓
Client receives error
```

### Scenario 2: Invalid Token

```
Request (Authorization: Bearer invalid.token)
    ↓
authMiddleware
    ↓
jwt.verify(token, JWT_SECRET)
    ↓
✗ JsonWebTokenError
    ↓
Return 401: "Invalid token"
    ↓
Client receives error
```

### Scenario 3: Expired Token

```
Request (Authorization: Bearer <expired_token>)
    ↓
authMiddleware
    ↓
jwt.verify(token, JWT_SECRET)
    ↓
✗ TokenExpiredError
    ↓
Return 401: "Token has expired"
    ↓
Client receives error (should redirect to login)
```

### Scenario 4: Unauthorized Role

```
Request (player trying to access admin route)
    ↓
authMiddleware
    ↓
✓ Token valid, req.user = {id: '123', role: 'player'}
    ↓
requireRole(['admin'])
    ↓
Check: 'player' in ['admin']?
    ↓
✗ No
    ↓
Return 403: "Access denied"
    ↓
Client receives error
```

## Logging Flow Detail

```
Controller executes successfully
    ↓
res.json({user: {...}}) called
    ↓
loggerMiddleware intercepts
    ↓
Check: statusCode 2xx?
    ↓
✓ Yes
    ↓
setImmediate(async () => {
    ↓
    Determine action (POST → CREATE)
    ↓
    Extract targetCollection from path
    ↓
    Extract targetId from response
    ↓
    Create SystemLog entry
    ↓
    {
      action: 'CREATE',
      performedBy: req.user.id,
      targetCollection: 'User',
      targetId: '507f1f77bcf86cd799439011',
      changes: {method, path, timestamp}
    }
})
    ↓
Call original res.json (send response)
    ↓
Client receives response immediately
    ↓
(Logging happens asynchronously in background)
```

## Complete Request Example

**Request:**
```http
POST /api/users HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "email": "newuser@club.com",
  "password": "password123",
  "role": "player"
}
```

**Middleware Chain:**
```
1. authMiddleware
   ✓ Token valid
   ✓ req.user = {id: '507f...', role: 'admin'}

2. requireRole(['admin'])
   ✓ 'admin' in ['admin']
   ✓ Authorized

3. loggerMiddleware
   ✓ POST method detected
   ✓ res.json overridden
   ✓ Continue to controller

4. userController.create()
   ✓ Create user in database
   ✓ res.json({user: {...}})

5. loggerMiddleware (async)
   ✓ Status 201 (success)
   ✓ Create SystemLog entry
   ✓ Send response to client
```

**Response:**
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "user": {
    "_id": "507f1f77bcf86cd799439012",
    "email": "newuser@club.com",
    "role": "player",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**SystemLog Entry (created asynchronously):**
```javascript
{
  "_id": "507f1f77bcf86cd799439013",
  "action": "CREATE",
  "performedBy": "507f1f77bcf86cd799439011",
  "targetCollection": "User",
  "targetId": "507f1f77bcf86cd799439012",
  "changes": {
    "method": "POST",
    "path": "/api/users",
    "timestamp": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Performance Considerations

1. **authMiddleware**: Synchronous JWT verification (~1-2ms)
2. **roleGuard**: Simple array check (~0.1ms)
3. **loggerMiddleware**: Non-blocking async logging (0ms blocking)
4. **Total overhead**: ~1-2ms per request

The logging happens asynchronously using `setImmediate`, so it doesn't block the response to the client.
