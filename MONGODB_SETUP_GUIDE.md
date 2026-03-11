# MongoDB Setup Guide

## Option 1: MongoDB Atlas (Cloud - Recommended for Development)

MongoDB Atlas is a free cloud database service, perfect for development and testing.

### Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google account
3. Verify your email address

### Step 2: Create a Free Cluster

1. After login, click "Build a Database"
2. Choose "FREE" tier (M0 Sandbox)
3. Select a cloud provider and region (choose closest to you)
4. Cluster Name: `FootballClub` (or keep default)
5. Click "Create Cluster" (takes 3-5 minutes)

### Step 3: Create Database User

1. Click "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `footballadmin` (or your choice)
5. Password: Generate a secure password (save it!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### Step 4: Whitelist IP Address

1. Click "Network Access" in left sidebar
2. Click "Add IP Address"
3. For development, click "Allow Access from Anywhere" (0.0.0.0/0)
   - **Note**: For production, use specific IP addresses
4. Click "Confirm"

### Step 5: Get Connection String

1. Click "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Driver: Node.js, Version: 5.5 or later
5. Copy the connection string, it looks like:
   ```
   mongodb+srv://footballadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password
7. Add database name before the `?`:
   ```
   mongodb+srv://footballadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/football-club?retryWrites=true&w=majority
   ```

### Step 6: Configure Environment Variables

**Server .env file** (`server/.env`):
```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://footballadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/football-club?retryWrites=true&w=majority

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=5000
NODE_ENV=development

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173
```

**Client .env file** (`client/.env`):
```env
# API URL
VITE_API_URL=http://localhost:5000

# Socket.io URL
VITE_SOCKET_URL=http://localhost:5000
```

### Step 7: Test Connection

```bash
# Navigate to server directory
cd server

# Install dependencies (if not already done)
npm install

# Test database connection
node test-db-connection.js

# If successful, seed the database
npm run seed
```

Expected output:
```
✓ MongoDB Connected: cluster0.xxxxx.mongodb.net
✓ Database: football-club
✓ Connection pool: 5-20 connections
```

---

## Option 2: Local MongoDB Installation

For offline development or if you prefer local setup.

### Windows Installation

1. **Download MongoDB**
   - Go to https://www.mongodb.com/try/download/community
   - Select Windows, MSI package
   - Download and run installer

2. **Install MongoDB**
   - Choose "Complete" installation
   - Install MongoDB as a Service (recommended)
   - Install MongoDB Compass (GUI tool)

3. **Verify Installation**
   ```bash
   # Open Command Prompt or PowerShell
   mongod --version
   ```

4. **Start MongoDB Service**
   ```bash
   # MongoDB should start automatically as a service
   # To manually start:
   net start MongoDB
   ```

5. **Connection String**
   ```env
   MONGODB_URI=mongodb://localhost:27017/football-club
   ```

### macOS Installation

1. **Install using Homebrew**
   ```bash
   # Install Homebrew if not installed
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

   # Install MongoDB
   brew tap mongodb/brew
   brew install mongodb-community@7.0
   ```

2. **Start MongoDB**
   ```bash
   # Start MongoDB service
   brew services start mongodb-community@7.0

   # Or run manually
   mongod --config /usr/local/etc/mongod.conf
   ```

3. **Verify Installation**
   ```bash
   mongosh --version
   ```

4. **Connection String**
   ```env
   MONGODB_URI=mongodb://localhost:27017/football-club
   ```

### Linux (Ubuntu/Debian) Installation

1. **Import MongoDB GPG Key**
   ```bash
   curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
   ```

2. **Add MongoDB Repository**
   ```bash
   echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   ```

3. **Install MongoDB**
   ```bash
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

4. **Start MongoDB**
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

5. **Verify Installation**
   ```bash
   mongosh --version
   ```

6. **Connection String**
   ```env
   MONGODB_URI=mongodb://localhost:27017/football-club
   ```

---

## Step 8: Seed the Database

After MongoDB is connected, populate it with test data:

```bash
cd server

# Run seeding script
npm run seed

# Or directly
node seed.js
```

Expected output:
```
🌱 Starting database seeding process...

✓ MongoDB Connected
✓ Database: football-club

🗑️  Clearing existing data...
  ✓ Cleared Users collection
  ✓ Cleared Profiles collection
  ✓ Cleared Settings collection

👥 Creating users and profiles...
  ✓ Created ADMIN: admin@club.com
  ✓ Created MANAGER: manager@club.com
  ✓ Created COACH: coach@club.com
  ✓ Created PLAYER: player@club.com

⚙️  Creating initial settings...
  ✓ Created Settings: Football Club Management System

═══════════════════════════════════════════════════════════
                  SEEDED USER CREDENTIALS                  
═══════════════════════════════════════════════════════════

1. ADMIN
   Email:    admin@club.com
   Password: password123
   ...

✅ Database seeding completed successfully!
```

---

## Step 9: Start the Application

```bash
# Terminal 1 - Start Backend
cd server
npm start

# Terminal 2 - Start Frontend
cd client
npm run dev
```

Backend should show:
```
✓ MongoDB Connected: ...
✓ Server running on port 5000
✓ All systems operational
```

Frontend should show:
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## Step 10: Verify Everything Works

1. Open browser to http://localhost:5173
2. Login with test credentials:
   - Email: `admin@club.com`
   - Password: `password123`
3. Should redirect to `/admin` panel
4. Navbar should show "Football Club Management System"
5. Logout button should work

---

## Troubleshooting

### Issue 1: Connection Timeout (Atlas)
**Solution**: Check Network Access whitelist includes your IP

### Issue 2: Authentication Failed (Atlas)
**Solution**: 
- Verify password is correct (no special characters causing issues)
- Check username matches database user
- Ensure password is URL-encoded if it contains special characters

### Issue 3: Local MongoDB Not Starting
**Windows**:
```bash
net start MongoDB
```

**macOS**:
```bash
brew services restart mongodb-community@7.0
```

**Linux**:
```bash
sudo systemctl restart mongod
```

### Issue 4: Cannot Connect to localhost:27017
**Solution**: 
- Check if MongoDB service is running
- Verify port 27017 is not blocked by firewall
- Try `mongosh` to test connection

### Issue 5: Database Not Found
**Solution**: MongoDB creates databases automatically on first write. Just run the seed script.

---

## MongoDB Compass (GUI Tool)

MongoDB Compass provides a visual interface for your database.

### Installation
- Download from https://www.mongodb.com/try/download/compass
- Install and open

### Connect to Atlas
1. Open Compass
2. Paste your connection string
3. Click "Connect"

### Connect to Local
1. Open Compass
2. Use connection string: `mongodb://localhost:27017`
3. Click "Connect"

### View Data
1. Select `football-club` database
2. Browse collections: users, profiles, settings, etc.
3. View, edit, or delete documents

---

## Security Best Practices

### For Development
- ✅ Use MongoDB Atlas free tier
- ✅ Keep .env files in .gitignore
- ✅ Use strong JWT_SECRET
- ✅ Whitelist specific IPs when possible

### For Production
- ✅ Use MongoDB Atlas paid tier with backups
- ✅ Enable authentication on local MongoDB
- ✅ Use environment-specific connection strings
- ✅ Enable SSL/TLS connections
- ✅ Implement IP whitelisting
- ✅ Regular database backups
- ✅ Monitor database performance
- ✅ Use connection pooling (already configured)

---

## Environment Variables Summary

**server/.env**:
```env
# MongoDB (choose one)
# Option 1: MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/football-club?retryWrites=true&w=majority

# Option 2: Local MongoDB
# MONGODB_URI=mongodb://localhost:27017/football-club

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CLIENT_URL=http://localhost:5173
```

**client/.env**:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## Next Steps

After MongoDB is set up:
1. ✅ Run seed script to populate test data
2. ✅ Start backend and frontend servers
3. ✅ Test login with all 4 user roles
4. ✅ Run Phase 1 verification tests
5. ✅ Push to GitHub (see GIT_SETUP_GUIDE.md)
6. ✅ Begin Phase 2 implementation

---

## Quick Reference

**Test Users** (all passwords: `password123`):
- admin@club.com
- manager@club.com
- coach@club.com
- player@club.com

**Useful Commands**:
```bash
# Seed database
npm run seed

# Test connection
node test-db-connection.js

# Start backend
npm start

# Start frontend
npm run dev
```

**MongoDB Shell Commands**:
```bash
# Connect to database
mongosh "your-connection-string"

# Show databases
show dbs

# Use database
use football-club

# Show collections
show collections

# View users
db.users.find().pretty()

# Count documents
db.users.countDocuments()

# Drop database (careful!)
db.dropDatabase()
```
