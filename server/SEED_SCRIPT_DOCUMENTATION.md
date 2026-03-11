# Database Seeding Script Documentation

## Overview

The `seed.js` script populates the database with initial test data for the Football Club Management System. It creates 4 test users (one for each role), their associated profiles, and initial club settings.

## Requirements Validated

- **Requirement 3.1**: User creation with email, passwordHash, role, and createdAt
- **Requirement 3.6**: Profile creation associated with each user
- **Requirement 4.1**: Initial Settings document with default club name

## Usage

### Command Line

```bash
# From the server directory
node seed.js

# Or using npm script
npm run seed
```

### Prerequisites

1. MongoDB must be running and accessible
2. `.env` file must be configured with `MONGODB_URI`
3. All dependencies must be installed (`npm install`)

## What the Script Does

### 1. Database Connection
- Connects to MongoDB using the connection string from `.env`
- Uses the same connection configuration as the main application

### 2. Clear Existing Data (Optional)
- Removes all existing documents from:
  - Users collection
  - Profiles collection
  - Settings collection
- This ensures a clean state for testing

### 3. Create Test Users

Creates 4 users with the following credentials:

| Role    | Email              | Password     | Full Name    | Position |
|---------|-------------------|--------------|--------------|----------|
| Admin   | admin@club.com    | password123  | Admin User   | Staff    |
| Manager | manager@club.com  | password123  | Manager User | Staff    |
| Coach   | coach@club.com    | password123  | Coach User   | Staff    |
| Player  | player@club.com   | password123  | Player User  | Forward  |

### 4. Password Hashing
- All passwords are hashed using bcrypt with cost factor 10
- Complies with Requirement 21.6 for secure password storage

### 5. Profile Creation
- Each user gets an associated Profile document
- Player profile includes additional fields:
  - Weight: 75 kg
  - Height: 180 cm
  - Contract Type: Full-Time
  - Contract Start: Current date
  - Contract End: 1 year from now

### 6. Settings Creation
- Creates initial Settings document with:
  - Club Name: "Football Club Management System"
  - Logo URL: null (can be updated later)

### 7. Credential Display
- Logs all created user credentials to console
- Displays User IDs and Profile IDs for reference

## Output Example

```
🌱 Starting database seeding process...

✓ MongoDB Connected: localhost
✓ Database: football-club
✓ Connection pool: 5-20 connections

🗑️  Clearing existing data...
  ✓ Cleared Users collection
  ✓ Cleared Profiles collection
  ✓ Cleared Settings collection
✓ All collections cleared successfully

👥 Creating users and profiles...

  ✓ Created ADMIN: admin@club.com
  ✓ Created MANAGER: manager@club.com
  ✓ Created COACH: coach@club.com
  ✓ Created PLAYER: player@club.com

✓ All users and profiles created successfully

⚙️  Creating initial settings...

  ✓ Created Settings: Football Club Management System
  ✓ Settings ID: 507f1f77bcf86cd799439011

═══════════════════════════════════════════════════════════
                  SEEDED USER CREDENTIALS                  
═══════════════════════════════════════════════════════════

1. ADMIN
   Email:    admin@club.com
   Password: password123
   User ID:  507f1f77bcf86cd799439011
   Profile:  507f1f77bcf86cd799439012

2. MANAGER
   Email:    manager@club.com
   Password: password123
   User ID:  507f1f77bcf86cd799439013
   Profile:  507f1f77bcf86cd799439014

3. COACH
   Email:    coach@club.com
   Password: password123
   User ID:  507f1f77bcf86cd799439015
   Profile:  507f1f77bcf86cd799439016

4. PLAYER
   Email:    player@club.com
   Password: password123
   User ID:  507f1f77bcf86cd799439017
   Profile:  507f1f77bcf86cd799439018

═══════════════════════════════════════════════════════════
NOTE: All passwords are "password123" for testing purposes
═══════════════════════════════════════════════════════════

✅ Database seeding completed successfully!
```

## Error Handling

The script includes comprehensive error handling:

- **Database Connection Errors**: Displays connection error and exits
- **User Creation Errors**: Shows which user failed and the error message
- **Profile Creation Errors**: Catches and displays profile creation failures
- **Settings Creation Errors**: Handles settings document creation issues

## Testing the Seeded Data

After running the seed script, you can test the authentication:

### Using the test-auth.js script:
```bash
node test-auth.js
```

### Using curl:
```bash
# Login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@club.com","password":"password123"}'

# Login as manager
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@club.com","password":"password123"}'

# Login as coach
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"coach@club.com","password":"password123"}'

# Login as player
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"player@club.com","password":"password123"}'
```

## Re-running the Script

The script can be run multiple times safely:
- It clears existing data before seeding
- This ensures a consistent test state
- Useful for resetting the database during development

## Security Notes

⚠️ **IMPORTANT**: This script is for development and testing only!

- All users share the same password ("password123")
- Passwords are intentionally simple for testing
- **DO NOT** use this script in production
- **DO NOT** commit the actual `.env` file with production credentials

## Integration with Application

The seeded users can immediately be used to:
1. Test authentication endpoints
2. Test role-based authorization
3. Verify middleware functionality
4. Test panel access restrictions
5. Develop and test frontend components

## Troubleshooting

### "MONGODB_URI is not defined"
- Ensure `.env` file exists in the server directory
- Verify `MONGODB_URI` is set in `.env`

### "Connection refused"
- Ensure MongoDB is running
- Check if MongoDB is listening on the correct port
- Verify the connection string in `.env`

### "Duplicate key error"
- The script clears data before seeding
- If this error occurs, manually clear the collections or drop the database

### "bcrypt error"
- Ensure bcrypt is properly installed
- Try reinstalling: `npm install bcrypt --save`
- On Windows, you may need build tools: `npm install --global windows-build-tools`

## Related Files

- `server/models/User.js` - User schema definition
- `server/models/Profile.js` - Profile schema definition
- `server/models/Settings.js` - Settings schema definition
- `server/config/database.js` - Database connection configuration
- `server/.env` - Environment variables (not committed)
- `server/.env.example` - Environment variables template

## Task Completion

This script completes **Task 6** from the implementation plan:
- ✅ Creates seed.js script to populate initial data
- ✅ Creates 4 users with different roles
- ✅ Hashes passwords with bcrypt (cost factor 10)
- ✅ Creates associated Profile for each user
- ✅ Creates initial Settings document
- ✅ Logs all seeded user credentials to console
- ✅ Validates Requirements 3.1, 3.6, 4.1
