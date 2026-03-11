# Quick Start: Using the Seed Script

## Prerequisites

1. **MongoDB Running**: Ensure MongoDB is running on your system
   ```bash
   # Check if MongoDB is running
   mongosh --eval "db.version()"
   ```

2. **Environment Variables**: Ensure `.env` file exists in `server/` directory
   ```bash
   # server/.env should contain:
   MONGODB_URI=mongodb://localhost:27017/football-club
   JWT_SECRET=your-secret-key-here
   PORT=5000
   ```

3. **Dependencies Installed**: Run npm install if not already done
   ```bash
   cd server
   npm install
   ```

## Running the Seed Script

### Option 1: Using npm script (Recommended)
```bash
cd server
npm run seed
```

### Option 2: Using node directly
```bash
cd server
node seed.js
```

## What Happens When You Run It

1. **Connects to MongoDB**
   - Uses connection string from `.env`
   - Displays connection status

2. **Clears Existing Data**
   - Removes all Users
   - Removes all Profiles
   - Removes all Settings
   - ⚠️ This ensures a clean test state

3. **Creates Test Users**
   - admin@club.com (Admin role)
   - manager@club.com (Manager role)
   - coach@club.com (Coach role)
   - player@club.com (Player role)

4. **Creates Profiles**
   - One profile per user
   - Player gets additional contract details

5. **Creates Settings**
   - Default club name: "Football Club Management System"

6. **Displays Credentials**
   - Shows all created users with IDs
   - All passwords are "password123"

## Testing After Seeding

### Test 1: Login as Admin
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@club.com","password":"password123"}'
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "admin",
  "userId": "507f1f77bcf86cd799439011"
}
```

### Test 2: Login as Manager
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@club.com","password":"password123"}'
```

### Test 3: Login as Coach
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"coach@club.com","password":"password123"}'
```

### Test 4: Login as Player
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"player@club.com","password":"password123"}'
```

### Test 5: Use the test-auth.js script
```bash
cd server
node test-auth.js
```

## Verifying Data in MongoDB

### Using MongoDB Shell (mongosh)
```bash
# Connect to database
mongosh mongodb://localhost:27017/football-club

# View all users
db.users.find().pretty()

# View all profiles
db.profiles.find().pretty()

# View settings
db.settings.find().pretty()

# Count documents
db.users.countDocuments()  // Should return 4
db.profiles.countDocuments()  // Should return 4
db.settings.countDocuments()  // Should return 1
```

### Using MongoDB Compass
1. Connect to `mongodb://localhost:27017`
2. Select `football-club` database
3. Browse collections: users, profiles, settings

## Common Issues and Solutions

### Issue: "MONGODB_URI is not defined"
**Solution**: Create or check `server/.env` file
```bash
# Create .env file
cp server/.env.example server/.env

# Edit and add your MongoDB URI
nano server/.env
```

### Issue: "Connection refused"
**Solution**: Start MongoDB
```bash
# On Windows (if installed as service)
net start MongoDB

# On macOS (using Homebrew)
brew services start mongodb-community

# On Linux
sudo systemctl start mongod
```

### Issue: "bcrypt error" or "Module not found"
**Solution**: Reinstall dependencies
```bash
cd server
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Duplicate key error"
**Solution**: The script should clear data automatically, but if it fails:
```bash
# Drop the database and re-run
mongosh mongodb://localhost:27017/football-club --eval "db.dropDatabase()"
npm run seed
```

## Re-running the Script

You can run the seed script multiple times:
- It automatically clears existing data
- Creates fresh test data each time
- Useful for resetting during development

```bash
# Reset database to clean state
npm run seed
```

## Integration with Development Workflow

### Typical workflow:
1. **Start MongoDB**
   ```bash
   # Ensure MongoDB is running
   ```

2. **Seed Database**
   ```bash
   cd server
   npm run seed
   ```

3. **Start Server**
   ```bash
   npm run dev
   ```

4. **Test Authentication**
   ```bash
   # In another terminal
   node test-auth.js
   ```

5. **Start Frontend** (when ready)
   ```bash
   cd ../client
   npm run dev
   ```

## Security Reminder

⚠️ **IMPORTANT**: 
- This script is for **development and testing only**
- All users share the same simple password
- **DO NOT** use in production
- **DO NOT** commit `.env` file with real credentials

## Next Steps

After successfully seeding:
1. ✅ Test authentication with all 4 roles
2. ✅ Verify JWT tokens are generated correctly
3. ✅ Test role-based authorization middleware
4. ✅ Begin frontend development with real user data
5. ✅ Proceed to Phase 2: Admin Panel implementation

## Quick Reference

| User Role | Email              | Password    |
|-----------|-------------------|-------------|
| Admin     | admin@club.com    | password123 |
| Manager   | manager@club.com  | password123 |
| Coach     | coach@club.com    | password123 |
| Player    | player@club.com   | password123 |

**All passwords**: `password123`

## Support

For more detailed information, see:
- `SEED_SCRIPT_DOCUMENTATION.md` - Full documentation
- `TASK_6_COMPLETION.md` - Implementation details
- `TEST_AUTH_GUIDE.md` - Authentication testing guide
