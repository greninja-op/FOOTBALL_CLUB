# Authentication Testing Guide - Task 5

## Quick Start

### 1. Prerequisites
Ensure you have:
- MongoDB running locally or connection string in `.env`
- `.env` file with `JWT_SECRET` configured
- Node.js installed
- Dependencies installed (`npm install` in server directory)

### 2. Run Automated Tests
```bash
cd server
node test-auth.js
```

This will run 10 comprehensive tests covering all authentication functionality.

## Manual API Testing

### Setup
1. Start the server:
```bash
cd server
npm start
```

2. Server should be running on `http://localhost:5000`

### Test Scenarios

#### Scenario 1: Successful Login
**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@club.com",
    "password": "password123"
  }'
```

**Expected Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1N...",
  "role": "admin",
  "userId": "657abc123def456789012345"
}
```

**What to verify:**
- ✓ Status code is 200
- ✓ Token is a valid JWT string
- ✓ Role matches user's role
- ✓ userId is returned

---

#### Scenario 2: Invalid Password
**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@club.com",
    "password": "wrongpassword"
  }'
```

**Expected Response (401):**
```json
{
  "error": "Authentication failed",
  "message": "Invalid credentials"
}
```

**What to verify:**
- ✓ Status code is 401
- ✓ Error message is generic (doesn't reveal if email exists)
- ✓ Message is "Invalid credentials"

---

#### Scenario 3: Non-Existent Email
**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "password123"
  }'
```

**Expected Response (401):**
```json
{
  "error": "Authentication failed",
  "message": "Invalid credentials"
}
```

**What to verify:**
- ✓ Status code is 401
- ✓ Same error message as invalid password (prevents email enumeration)
- ✓ No indication whether email exists or not

---

#### Scenario 4: Missing Credentials
**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "",
    "password": ""
  }'
```

**Expected Response (400):**
```json
{
  "error": "Validation error",
  "message": "Email and password are required"
}
```

**What to verify:**
- ✓ Status code is 400
- ✓ Clear validation error message

---

#### Scenario 5: Verify Valid Token
**Request:**
```bash
# First, get a token from login
TOKEN="<paste token from login response>"

curl -X GET http://localhost:5000/api/auth/verify \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**
```json
{
  "valid": true,
  "user": {
    "id": "657abc123def456789012345",
    "role": "admin"
  }
}
```

**What to verify:**
- ✓ Status code is 200
- ✓ valid is true
- ✓ User ID and role are returned
- ✓ Matches the user who logged in

---

#### Scenario 6: Verify Invalid Token
**Request:**
```bash
curl -X GET http://localhost:5000/api/auth/verify \
  -H "Authorization: Bearer invalid.token.here"
```

**Expected Response (401):**
```json
{
  "error": "Authentication failed",
  "message": "Invalid token"
}
```

**What to verify:**
- ✓ Status code is 401
- ✓ Error indicates invalid token

---

#### Scenario 7: Verify Without Token
**Request:**
```bash
curl -X GET http://localhost:5000/api/auth/verify
```

**Expected Response (401):**
```json
{
  "error": "Authentication required",
  "message": "No authorization header provided"
}
```

**What to verify:**
- ✓ Status code is 401
- ✓ Error indicates missing authorization

---

#### Scenario 8: Logout
**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/logout
```

**Expected Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

**What to verify:**
- ✓ Status code is 200
- ✓ Success message returned
- ✓ Client should remove token from localStorage

---

## Token Validation Tests

### Test 1: Token Expiry (8 hours)
Decode a token to verify expiry:

```javascript
const jwt = require('jsonwebtoken');

// Get token from login
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

// Decode without verification to inspect
const decoded = jwt.decode(token);

console.log('Issued at:', new Date(decoded.iat * 1000));
console.log('Expires at:', new Date(decoded.exp * 1000));
console.log('Duration:', (decoded.exp - decoded.iat) / 3600, 'hours');
```

**Expected:**
- Duration should be exactly 8 hours

### Test 2: Token Payload
```javascript
const decoded = jwt.decode(token);
console.log(decoded);
```

**Expected payload:**
```json
{
  "id": "657abc123def456789012345",
  "role": "admin",
  "iat": 1702123456,
  "exp": 1702152256
}
```

**What to verify:**
- ✓ Contains `id` field
- ✓ Contains `role` field
- ✓ Contains `iat` (issued at) timestamp
- ✓ Contains `exp` (expiry) timestamp
- ✓ No sensitive data (no password, email, etc.)

---

## Security Tests

### Test 1: Email Enumeration Prevention
Try logging in with:
1. Valid email + wrong password
2. Invalid email + any password

**Both should return the same error:**
```json
{
  "error": "Authentication failed",
  "message": "Invalid credentials"
}
```

This prevents attackers from discovering valid email addresses.

### Test 2: Password Hash Security
Check that password hashes are never returned:

```bash
# Login and get token
TOKEN="<your token>"

# Try to get user data
curl -X GET http://localhost:5000/api/auth/verify \
  -H "Authorization: Bearer $TOKEN"
```

**Verify:**
- ✓ Response does NOT contain `passwordHash`
- ✓ Response does NOT contain `password`
- ✓ Only safe fields are returned (id, role)

### Test 3: bcrypt Password Verification
The implementation uses `bcrypt.compare()` which:
- ✓ Is timing-attack resistant
- ✓ Uses cost factor 10 (from User creation)
- ✓ Automatically handles salt

---

## Integration Tests

### Test with Seeded Users
After running Task 6 (database seeding), test with all 4 roles:

```bash
# Admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@club.com","password":"password123"}'

# Manager
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@club.com","password":"password123"}'

# Coach
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"coach@club.com","password":"password123"}'

# Player
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"player@club.com","password":"password123"}'
```

**Verify each returns:**
- ✓ Different userId
- ✓ Correct role
- ✓ Valid JWT token

---

## Troubleshooting

### Issue: "JWT_SECRET is not defined"
**Solution:** Add to `.env` file:
```
JWT_SECRET=your-secret-key-here-make-it-long-and-random
```

### Issue: "Cannot find module 'bcrypt'"
**Solution:** Install dependencies:
```bash
cd server
npm install
```

### Issue: "MongoDB connection failed"
**Solution:** Ensure MongoDB is running and `MONGODB_URI` is correct in `.env`:
```
MONGODB_URI=mongodb://localhost:27017/football-club
```

### Issue: Token verification fails immediately
**Solution:** Ensure the same `JWT_SECRET` is used for signing and verifying

---

## Requirements Checklist

- [x] **Requirement 1.1:** JWT token with 8-hour expiry generated on successful login
- [x] **Requirement 1.2:** Generic error message prevents email enumeration
- [x] **Requirement 1.3:** Token expiry enforced, expired tokens rejected
- [x] **Requirement 1.4:** bcrypt.compare() used for password verification
- [x] **Requirement 23.4:** Appropriate HTTP status codes (200, 401, 400)

---

## Next Steps

1. ✓ Run automated tests: `node test-auth.js`
2. ✓ Test all API endpoints manually with cURL
3. ✓ Verify token expiry is exactly 8 hours
4. ✓ Verify email enumeration prevention
5. ✓ Proceed to Task 6: Database seeding
6. ✓ Integrate with frontend (Task 7)

---

## Files Created

- `server/controllers/authController.js` - Authentication logic
- `server/routes/authRoutes.js` - API routes
- `server/test-auth.js` - Automated tests
- `server/TASK_5_COMPLETION.md` - Implementation documentation
- `server/TEST_AUTH_GUIDE.md` - This testing guide

**Task 5 Complete! ✓**
