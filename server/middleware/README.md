# Middleware Documentation

This directory contains authentication, authorization, and logging middleware for the Football Club Management System.

## Overview

The middleware components implement the security and audit trail requirements for the application:

1. **authMiddleware.js** - JWT token validation
2. **roleGuard.js** - Role-based access control
3. **loggerMiddleware.js** - Audit trail logging

## Requirements Validation

### authMiddleware.js
- **Requirement 1.3**: JWT token expiry validation (8-hour expiry)
- **Requirement 2.1**: Protected route authentication
- **Requirement 21.1**: Session management and security

### roleGuard.js
- **Requirement 2.2**: Role-based route authorization
- **Requirement 2.3**: Player route restrictions
- **Requirement 2.4**: Coach route restrictions
- **Requirement 2.5**: Manager route restrictions
- **Requirement 2.6**: Admin full access
- **Requirement 2.7**: Manager route access enforcement
- **Requirement 2.8**: Coach route access enforcement
- **Requirement 2.9**: Player route access enforcement

### loggerMiddleware.js
- **Requirement 3.3**: User update logging
- **Requirement 3.4**: User deletion logging
- **Requirement 5.1**: Database write operation logging
- **Requirement 5.4**: User attribution in logs

## Usage

### 1. authMiddleware

Validates JWT tokens and attaches user information to the request object.

```javascript
const authMiddleware = require('./middleware/authMiddleware');

// Apply to all protected routes
app.use('/api', authMiddleware);

// Or apply to specific routes
router.get('/profile', authMiddleware, profileController.getProfile);
```

**Behavior:**
- Extracts Bearer token from `Authorization` header
- Verifies JWT using `JWT_SECRET` from environment
- Decodes payload to extract `{id, role}`
- Attaches `req.user = {id, role}` to request
- Returns 401 if token is missing, invalid, or expired

**Error Responses:**
- `401` - No authorization header
- `401` - Invalid authorization format
- `401` - No token provided
- `401` - Invalid token
- `401` - Token expired

### 2. roleGuard (requireRole)

Factory function that creates middleware to restrict routes by user role.

```javascript
const requireRole = require('./middleware/roleGuard');

// Admin only
router.get('/users', authMiddleware, requireRole(['admin']), userController.getAll);

// Manager and Admin
router.post('/fixtures', authMiddleware, requireRole(['manager', 'admin']), fixtureController.create);

// Coach and Admin
router.post('/training', authMiddleware, requireRole(['coach', 'admin']), trainingController.create);

// Player only
router.post('/leave', authMiddleware, requireRole(['player']), leaveController.submit);
```

**Behavior:**
- Checks if `req.user.role` is in `allowedRoles` array
- Returns 403 if unauthorized
- Calls `next()` if authorized
- Must be applied AFTER `authMiddleware`

**Error Responses:**
- `401` - User information not found (authMiddleware not applied)
- `403` - User role not found
- `403` - Access denied (role not in allowed list)

### 3. loggerMiddleware

Logs all database write operations to the SystemLog collection.

```javascript
const loggerMiddleware = require('./middleware/loggerMiddleware');

// Apply to routes that modify data
router.post('/users', authMiddleware, requireRole(['admin']), loggerMiddleware, userController.create);
router.put('/users/:id', authMiddleware, requireRole(['admin']), loggerMiddleware, userController.update);
router.delete('/users/:id', authMiddleware, requireRole(['admin']), loggerMiddleware, userController.delete);
```

**Behavior:**
- Intercepts POST, PUT, PATCH, DELETE requests
- After successful controller execution (2xx status), creates SystemLog entry
- Logs: action, performedBy, targetCollection, targetId, timestamp
- Handles errors gracefully without blocking requests
- Must be applied AFTER `authMiddleware` and `roleGuard`

**Logged Information:**
- `action`: CREATE, UPDATE, or DELETE (based on HTTP method)
- `performedBy`: User ID from `req.user.id`
- `targetCollection`: Extracted from route path
- `targetId`: Extracted from response data or route params
- `changes`: Metadata including method, path, timestamp

**Important Notes:**
- Only logs successful operations (2xx status codes)
- Logging is asynchronous and non-blocking
- Errors in logging are caught and logged to console
- Does not block the response if logging fails

## Middleware Chain Order

The correct order for applying middleware is:

```javascript
router.METHOD('/path',
  authMiddleware,        // 1. Validate JWT and attach req.user
  requireRole([...]),    // 2. Check if user role is authorized
  loggerMiddleware,      // 3. Log the operation (for write operations)
  controller.action      // 4. Execute business logic
);
```

**Example:**
```javascript
router.post('/fixtures',
  authMiddleware,
  requireRole(['manager', 'admin']),
  loggerMiddleware,
  fixtureController.create
);
```

## Authorization Matrix

| Route Pattern | Admin | Manager | Coach | Player |
|--------------|-------|---------|-------|--------|
| /api/auth/* | ✓ | ✓ | ✓ | ✓ |
| /api/users/* | ✓ | ✗ | ✗ | ✗ |
| /api/settings/* | ✓ | ✗ | ✗ | ✗ |
| /api/logs/* | ✓ | ✗ | ✗ | ✗ |
| /api/profiles/* (read) | ✓ | ✓ | ✓ | Own only |
| /api/profiles/* (write) | ✓ | ✓ | ✗ | ✗ |
| /api/profiles/*/fitness | ✓ | ✗ | ✓ | ✗ |
| /api/profiles/*/stats | ✓ | ✗ | ✓ | ✗ |
| /api/fixtures/* (read) | ✓ | ✓ | ✓ | ✓ |
| /api/fixtures/* (create) | ✓ | ✓ | ✗ | ✗ |
| /api/fixtures/*/lineup | ✓ | ✗ | ✓ | ✗ |
| /api/training/* (read) | ✓ | ✓ | ✓ | ✓ |
| /api/training/* (write) | ✓ | ✗ | ✓ | ✗ |
| /api/injuries/* | ✓ | Read | ✓ | Read own |
| /api/disciplinary/* | ✓ | Read | ✓ | Read own |
| /api/disciplinary/*/pay | ✓ | ✓ | ✗ | ✗ |
| /api/leave/* (submit) | ✓ | ✗ | ✗ | ✓ |
| /api/leave/* (approve) | ✓ | ✗ | ✓ | ✗ |
| /api/inventory/* | ✓ | ✓ | Read | Read own |
| /api/documents/* | ✓ | ✓ | ✗ | ✗ |

## Testing

To test the middleware, run:

```bash
node test-middleware.js
```

This will execute a comprehensive test suite covering:
1. JWT token generation
2. Token verification
3. authMiddleware with valid token
4. authMiddleware without token
5. authMiddleware with invalid token
6. roleGuard with authorized role
7. roleGuard with unauthorized role
8. roleGuard with multiple allowed roles
9. Token expiry validation

## Environment Variables

Required environment variables:

```env
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=8h
```

## Error Handling

All middleware includes comprehensive error handling:

- **authMiddleware**: Returns 401 for authentication failures
- **roleGuard**: Returns 403 for authorization failures
- **loggerMiddleware**: Catches and logs errors without blocking responses

## Security Considerations

1. **JWT Secret**: Must be strong and kept secure in production
2. **Token Expiry**: Set to 8 hours as per requirements
3. **HTTPS**: All production traffic should use HTTPS
4. **Rate Limiting**: Should be implemented at the application level
5. **Input Sanitization**: Should be implemented in controllers

## Implementation Status

- [x] Task 4.1: authMiddleware.js created
- [x] Task 4.2: roleGuard.js created
- [x] Task 4.3: loggerMiddleware.js created
- [x] All requirements validated
- [x] Documentation complete
- [x] Test suite created

## Next Steps

1. Integrate middleware into route definitions (Phase 1, Task 5)
2. Create authentication controller (Phase 1, Task 5)
3. Test with actual API endpoints
4. Write property-based tests (Task 4.4)
