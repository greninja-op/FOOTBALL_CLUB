# Authentication Flow Documentation

## Overview
This document describes the authentication flow in the Football Club Management System frontend.

## Components Involved

1. **AuthContext** - Manages authentication state globally
2. **LoginPage** - User interface for authentication
3. **ProtectedRoute** - Guards routes requiring authentication
4. **Role-specific Panels** - Admin, Manager, Coach, Player panels

## Flow Diagrams

### Initial App Load Flow

```
User opens app
    ↓
App.jsx renders
    ↓
AuthProvider initializes
    ↓
Check localStorage for 'authToken'
    ↓
    ├─ Token exists
    │   ↓
    │   Call GET /api/auth/verify
    │   ↓
    │   ├─ Valid token
    │   │   ↓
    │   │   Set user state {id, role}
    │   │   Set loading = false
    │   │   ↓
    │   │   User stays on current route
    │   │
    │   └─ Invalid token
    │       ↓
    │       Clear localStorage
    │       Set user = null
    │       Set loading = false
    │       ↓
    │       Redirect to /login
    │
    └─ No token
        ↓
        Set loading = false
        ↓
        Redirect to /login
```

### Login Flow

```
User navigates to /login
    ↓
LoginPage renders
    ↓
User enters email & password
    ↓
User clicks "Sign In"
    ↓
Validate inputs
    ├─ Invalid
    │   ↓
    │   Show error message
    │   Stay on login page
    │
    └─ Valid
        ↓
        Call login(email, password)
        ↓
        POST /api/auth/login
        ↓
        ├─ Success (200)
        │   ↓
        │   Receive {token, role, userId}
        │   ↓
        │   Store token in localStorage
        │   Set user state {id, role}
        │   ↓
        │   Redirect based on role:
        │   ├─ admin → /admin
        │   ├─ manager → /manager
        │   ├─ coach → /coach
        │   └─ player → /player
        │
        └─ Failure (401/400)
            ↓
            Show error message
            Stay on login page
```

### Protected Route Access Flow

```
User navigates to protected route (e.g., /admin)
    ↓
ProtectedRoute component renders
    ↓
Check loading state
    ├─ loading = true
    │   ↓
    │   Show loading spinner
    │   Wait for token verification
    │
    └─ loading = false
        ↓
        Check token & user
        ├─ No token or no user
        │   ↓
        │   Redirect to /login
        │
        └─ Token & user exist
            ↓
            Check allowedRoles (if specified)
            ├─ Role not allowed
            │   ↓
            │   Show "Access Denied" message
            │
            └─ Role allowed or no role check
                ↓
                Render protected component
```

### Logout Flow

```
User clicks "Logout" button
    ↓
Call logout() from AuthContext
    ↓
Clear 'authToken' from localStorage
    ↓
Set user = null
Set token = null
    ↓
Navigate to /login
    ↓
LoginPage renders
```

## State Management

### AuthContext State

```javascript
{
  user: {
    id: string,      // User ID from database
    role: string     // 'admin' | 'manager' | 'coach' | 'player'
  } | null,
  token: string | null,  // JWT token
  loading: boolean       // Token verification in progress
}
```

### localStorage

```javascript
{
  'authToken': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'  // JWT token
}
```

## API Endpoints

### POST /api/auth/login

**Request:**
```json
{
  "email": "admin@club.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "admin",
  "userId": "507f1f77bcf86cd799439011"
}
```

**Error Response (401):**
```json
{
  "message": "Invalid credentials"
}
```

### GET /api/auth/verify

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "valid": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "role": "admin"
  }
}
```

**Error Response (401):**
```json
{
  "valid": false,
  "message": "Invalid or expired token"
}
```

## Security Considerations

### Token Storage
- JWT token stored in localStorage
- Vulnerable to XSS attacks
- Consider using httpOnly cookies in production

### Token Transmission
- Token sent in Authorization header
- Format: `Bearer <token>`
- HTTPS required in production

### Token Expiry
- Backend sets 8-hour expiry
- Frontend doesn't track expiry locally
- Relies on backend verification

### Password Security
- Passwords never stored in frontend state
- Transmitted to backend for verification
- Backend handles bcrypt hashing

## Error Handling

### Network Errors
```javascript
try {
  const response = await fetch(...)
} catch (error) {
  // Network error, server down, CORS issue
  return { success: false, error: 'Connection failed' }
}
```

### Authentication Errors
```javascript
if (!response.ok) {
  const error = await response.json()
  // 401: Invalid credentials
  // 400: Validation error
  return { success: false, error: error.message }
}
```

### Token Verification Errors
```javascript
if (!response.ok) {
  // Token invalid or expired
  localStorage.removeItem('authToken')
  setToken(null)
  setUser(null)
  // User redirected to login by ProtectedRoute
}
```

## Role-Based Access Control

### Route Protection Matrix

| Route | Admin | Manager | Coach | Player |
|-------|-------|---------|-------|--------|
| /login | ✅ | ✅ | ✅ | ✅ |
| /admin | ✅ | ❌ | ❌ | ❌ |
| /manager | ❌ | ✅ | ❌ | ❌ |
| /coach | ❌ | ❌ | ✅ | ❌ |
| /player | ❌ | ❌ | ❌ | ✅ |

### Implementation

```jsx
// Admin-only route
<Route 
  path="/admin" 
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminPanel />
    </ProtectedRoute>
  } 
/>

// Multiple roles allowed
<Route 
  path="/reports" 
  element={
    <ProtectedRoute allowedRoles={['admin', 'manager']}>
      <ReportsPage />
    </ProtectedRoute>
  } 
/>

// Any authenticated user
<Route 
  path="/profile" 
  element={
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  } 
/>
```

## Testing Scenarios

### Scenario 1: First-time User
1. User opens app → Redirected to /login
2. User enters credentials → Authenticated
3. Token stored in localStorage
4. User redirected to role-specific panel
5. User refreshes page → Stays authenticated

### Scenario 2: Returning User
1. User opens app → Token verified
2. User stays on last visited route
3. User navigates between allowed routes
4. User logs out → Token cleared

### Scenario 3: Expired Token
1. User opens app → Token verification fails
2. Token cleared from localStorage
3. User redirected to /login
4. User must re-authenticate

### Scenario 4: Unauthorized Access
1. Player user tries to access /admin
2. ProtectedRoute checks role
3. "Access Denied" message shown
4. User cannot access admin features

### Scenario 5: Direct URL Access
1. Unauthenticated user types /admin in URL
2. ProtectedRoute checks authentication
3. User redirected to /login
4. After login, user redirected to role panel (not /admin)

## Debugging Tips

### Check Authentication State
```javascript
// In browser console
localStorage.getItem('authToken')  // View stored token
```

### Monitor Network Requests
1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Check /api/auth/login and /api/auth/verify requests
4. Verify Authorization header in requests

### React DevTools
1. Install React DevTools extension
2. View AuthContext state
3. Check user, token, loading values

### Common Issues

**Issue**: Infinite redirect loop
- **Cause**: Token verification always fails
- **Fix**: Check backend /api/auth/verify endpoint

**Issue**: "Access Denied" on valid role
- **Cause**: Role mismatch in allowedRoles
- **Fix**: Verify user.role matches allowedRoles array

**Issue**: Token not persisting
- **Cause**: localStorage not working
- **Fix**: Check browser privacy settings, incognito mode

**Issue**: CORS errors
- **Cause**: Backend not allowing frontend origin
- **Fix**: Configure CORS in backend Express app

## Future Enhancements

- [ ] Implement refresh token mechanism
- [ ] Add "Remember Me" functionality
- [ ] Implement password reset flow
- [ ] Add two-factor authentication
- [ ] Move to httpOnly cookies
- [ ] Add session timeout warning
- [ ] Implement automatic token refresh
- [ ] Add biometric authentication support
