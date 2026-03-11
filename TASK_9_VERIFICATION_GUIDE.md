# Task 9: Phase 1 Verification Guide

## Overview
This guide provides step-by-step instructions to verify Phase 1 completion.

## Prerequisites

### 1. Start Backend Server
```bash
cd server
npm start
# Server should start on http://localhost:5000
```

### 2. Start Frontend Server
```bash
cd client
npm run dev
# Frontend should start on http://localhost:5173
```

### 3. Verify Database is Seeded
If not already seeded, run:
```bash
cd server
npm run seed
```

## Test Credentials
All passwords: `password123`
- Admin: admin@club.com
- Manager: manager@club.com
- Coach: coach@club.com
- Player: player@club.com

## Verification Tests

### Test 1: Admin Login and Access Control
1. Open http://localhost:5173
2. Login with admin@club.com / password123
3. ✅ Should redirect to /admin
4. ✅ Navbar should show club name and logout button
5. Try accessing /manager directly
6. ✅ Should be blocked (403 or redirect)
7. Try accessing /coach directly
8. ✅ Should be blocked
9. Try accessing /player directly
10. ✅ Should be blocked
11. Click Logout
12. ✅ Should redirect to /login

### Test 2: Manager Login and Access Control
1. Login with manager@club.com / password123
2. ✅ Should redirect to /manager
3. ✅ Navbar visible with logout button
4. Try accessing /admin
5. ✅ Should be blocked
6. Logout successfully

### Test 3: Coach Login and Access Control
1. Login with coach@club.com / password123
2. ✅ Should redirect to /coach
3. Try accessing /admin and /manager
4. ✅ Both should be blocked
5. Logout successfully

### Test 4: Player Login and Access Control
1. Login with player@club.com / password123
2. ✅ Should redirect to /player
3. Try accessing /admin, /manager, /coach
4. ✅ All should be blocked
5. Logout successfully

### Test 5: Unauthenticated Access
1. Clear browser localStorage
2. Try accessing /admin directly
3. ✅ Should redirect to /login
4. Repeat for /manager, /coach, /player
5. ✅ All should redirect to /login

### Test 6: Invalid Credentials
1. Try logging in with wrong@email.com / wrongpass
2. ✅ Should show error message
3. ✅ Should not redirect

## Automated Backend Tests
Run the automated test script:
```bash
node verify-phase1.js
```

This tests:
- Server connectivity
- Login endpoints for all 4 roles
- Token generation and verification
- Invalid credentials handling
- Settings endpoint

## Success Criteria
All tests must pass:
- ✅ All 4 users can log in
- ✅ Each user redirects to correct panel
- ✅ Role guards prevent unauthorized access
- ✅ Unauthenticated users redirected to login
- ✅ Navbar displays correctly
- ✅ Logout works properly

## Next Steps
Once all tests pass, Phase 1 is complete and Phase 2 can begin.
