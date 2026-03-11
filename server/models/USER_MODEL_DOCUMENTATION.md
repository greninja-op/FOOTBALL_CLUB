# User Model Documentation

## Overview
The User model represents system users with role-based access control for the Football Club Management System.

## Task 3.1 Implementation Summary

### Requirements Validated
- **Requirement 3.1**: User creation with email, passwordHash, role, and createdAt
- **Requirement 3.2**: Role validation with enum ['admin', 'manager', 'coach', 'player']
- **Requirement 3.5**: Unique email constraint enforcement
- **Requirement 22.1**: Database schema enforcement with Mongoose validation

### Schema Fields

#### email
- **Type**: String
- **Required**: Yes
- **Unique**: Yes (enforced at database level)
- **Validation**: RFC 5322 compliant email regex
- **Transformations**: 
  - Converted to lowercase automatically
  - Trimmed of whitespace
- **Index**: Single field index for fast authentication lookups

#### passwordHash
- **Type**: String
- **Required**: Yes
- **Security**: 
  - Not selected in queries by default (`select: false`)
  - Excluded from JSON/Object transformations
  - Intended to store bcrypt hashes with cost factor 10
- **Note**: Plain passwords should never be stored; only bcrypt hashes

#### role
- **Type**: String
- **Required**: Yes
- **Enum Values**: ['admin', 'manager', 'coach', 'player']
- **Validation**: Custom error message for invalid roles
- **Index**: Single field index for role-based queries

#### createdAt
- **Type**: Date
- **Default**: Current timestamp (Date.now)
- **Immutable**: Cannot be changed after creation
- **Purpose**: Audit trail and user account age tracking

### Indexes

1. **Email Index**: `{ email: 1 }`
   - Purpose: Fast user lookup during authentication
   - Type: Unique (enforced by schema)
   - Performance: O(log n) lookup time

2. **Role Index**: `{ role: 1 }`
   - Purpose: Efficient role-based queries (e.g., get all coaches)
   - Type: Non-unique
   - Performance: O(log n) lookup time

### Security Features

1. **Password Hash Protection**
   - `select: false` prevents accidental exposure in queries
   - Excluded from JSON serialization
   - Excluded from Object serialization

2. **Email Validation**
   - RFC 5322 compliant regex pattern
   - Prevents invalid email formats
   - Automatic lowercase conversion prevents case-sensitivity issues

3. **Role Enforcement**
   - Strict enum validation
   - Prevents privilege escalation through invalid roles
   - Clear error messages for debugging

### Usage Examples

#### Creating a User
```javascript
const User = require('./models/User');
const bcrypt = require('bcrypt');

// Hash password
const passwordHash = await bcrypt.hash('plainPassword', 10);

// Create user
const user = new User({
  email: 'admin@footballclub.com',
  passwordHash: passwordHash,
  role: 'admin'
});

await user.save();
```

#### Finding Users
```javascript
// Find by email (for authentication)
const user = await User.findOne({ email: 'admin@footballclub.com' })
  .select('+passwordHash'); // Explicitly include passwordHash for verification

// Find by role
const coaches = await User.find({ role: 'coach' });

// Find all users (passwordHash excluded automatically)
const allUsers = await User.find();
```

#### Validation Examples
```javascript
// Valid user
const validUser = new User({
  email: 'test@example.com',
  passwordHash: '$2b$10$...',
  role: 'player'
});
await validUser.save(); // ✓ Success

// Invalid email
const invalidEmail = new User({
  email: 'not-an-email',
  passwordHash: '$2b$10$...',
  role: 'player'
});
await invalidEmail.save(); // ✗ ValidationError: Invalid email format

// Invalid role
const invalidRole = new User({
  email: 'test@example.com',
  passwordHash: '$2b$10$...',
  role: 'superuser'
});
await invalidRole.save(); // ✗ ValidationError: superuser is not a valid role

// Missing required field
const missingField = new User({
  email: 'test@example.com',
  role: 'player'
});
await missingField.save(); // ✗ ValidationError: Password hash is required
```

### Relationships

The User model has the following relationships with other collections:

1. **One-to-One with Profiles**: Each user has exactly one profile
2. **One-to-Many with SystemLogs**: Users perform multiple logged actions
3. **One-to-Many with Fixtures**: Managers create multiple fixtures
4. **One-to-Many with TrainingSessions**: Coaches create multiple training sessions
5. **One-to-Many with Injuries**: Coaches log multiple injuries
6. **One-to-Many with DisciplinaryActions**: Coaches issue multiple disciplinary actions
7. **One-to-Many with LeaveRequests**: Coaches review multiple leave requests

### Testing

A test script is provided at `server/test-user-model.js` that validates:
- Valid user creation
- Email format validation
- Role enum validation
- Required field validation
- Email lowercase conversion
- All valid roles acceptance
- Index definitions

Run tests with: `node test-user-model.js`

### Next Steps

After implementing the User model, the following tasks should be completed:

1. **Task 3.2**: Create Profile schema (linked to User via userId)
2. **Task 3.3**: Implement authentication controller with JWT
3. **Task 3.4**: Create authMiddleware for token validation
4. **Task 3.5**: Create roleGuard middleware for authorization

### Compliance

This implementation satisfies:
- ✓ Email validation with RFC 5322 regex
- ✓ Unique email constraint
- ✓ Role enum validation ['admin', 'manager', 'coach', 'player']
- ✓ Indexes for email and role fields
- ✓ All required fields (email, passwordHash, role, createdAt)
- ✓ Security best practices (password hash protection)
