# Quick Start Guide - Football Club Management System

Get your project running in 10 minutes!

## Prerequisites

- Node.js (v18 or higher)
- Git
- MongoDB Atlas account (free) OR local MongoDB installation

---

## Step 1: MongoDB Setup (5 minutes)

### Option A: MongoDB Atlas (Recommended - Cloud)

1. **Create account**: https://www.mongodb.com/cloud/atlas/register
2. **Create free cluster**: Click "Build a Database" → Choose FREE tier
3. **Create user**: Database Access → Add User → Save credentials
4. **Whitelist IP**: Network Access → Add IP → "Allow Access from Anywhere"
5. **Get connection string**: Database → Connect → "Connect your application"
   ```
   mongodb+srv://username:password@cluster.xxxxx.mongodb.net/football-club?retryWrites=true&w=majority
   ```

### Option B: Local MongoDB

**Windows**:
```bash
# Download from https://www.mongodb.com/try/download/community
# Install and start service
net start MongoDB
```

**macOS**:
```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

**Linux**:
```bash
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

Connection string: `mongodb://localhost:27017/football-club`

---

## Step 2: Configure Environment Variables (2 minutes)

**Create `server/.env`**:
```env
# MongoDB Connection (use your connection string)
MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/football-club?retryWrites=true&w=majority

# JWT Secret (generate random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string

# Server Config
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**Create `client/.env`**:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## Step 3: Install Dependencies (2 minutes)

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

---

## Step 4: Seed Database (1 minute)

```bash
cd server
npm run seed
```

You should see:
```
✅ Database seeding completed successfully!

Test Users (all passwords: password123):
- admin@club.com
- manager@club.com
- coach@club.com
- player@club.com
```

---

## Step 5: Start Application (1 minute)

**Terminal 1 - Backend**:
```bash
cd server
npm start
```

Should show:
```
✓ MongoDB Connected
✓ Server running on port 5000
✓ All systems operational
```

**Terminal 2 - Frontend**:
```bash
cd client
npm run dev
```

Should show:
```
➜  Local:   http://localhost:5173/
```

---

## Step 6: Test Login (1 minute)

1. Open browser: http://localhost:5173
2. Login with:
   - Email: `admin@club.com`
   - Password: `password123`
3. Should redirect to Admin Panel
4. Navbar shows "Football Club Management System"
5. Logout button works

---

## Step 7: Push to GitHub (2 minutes)

```bash
# Initialize git (if not already done)
git init

# Add remote
git remote add origin https://github.com/greninja-op/FOOTBALL_CLUB.git

# Add all files
git add .

# Commit
git commit -m "Phase 1 Complete: Authentication & Frontend Foundation"

# Push
git push -u origin main
```

If you get authentication errors, use a GitHub Personal Access Token:
1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Use token as password when pushing

---

## Verification Checklist

- [ ] MongoDB connected successfully
- [ ] Database seeded with 4 test users
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Can login as admin@club.com
- [ ] Redirects to /admin panel
- [ ] Navbar displays club name
- [ ] Logout works
- [ ] Code pushed to GitHub

---

## Test All User Roles

```bash
# Login with each user to verify:
admin@club.com    → /admin panel
manager@club.com  → /manager panel
coach@club.com    → /coach panel
player@club.com   → /player panel

# All passwords: password123
```

---

## Troubleshooting

### MongoDB Connection Failed
- **Atlas**: Check IP whitelist and credentials
- **Local**: Ensure MongoDB service is running

### Port Already in Use
```bash
# Backend (port 5000)
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -ti:5000 | xargs kill

# Frontend (port 5173)
# Change port in vite.config.js or kill process
```

### Dependencies Not Installing
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Git Push Failed
```bash
# If remote already exists
git remote remove origin
git remote add origin https://github.com/greninja-op/FOOTBALL_CLUB.git

# If branch name mismatch
git branch -M main
git push -u origin main
```

---

## Next Steps

✅ **Phase 1 Complete!** You now have:
- Full authentication system
- Role-based access control
- 4 user roles with protected routes
- Database with test data
- Code on GitHub

📋 **Run Verification Tests**:
```bash
cd server
node test-phase1-verification.js
```

🚀 **Ready for Phase 2**: Admin Panel implementation
- User Management
- Club Settings
- System Logs

---

## Useful Commands

```bash
# Backend
cd server
npm start              # Start server
npm run seed           # Seed database
node test-auth.js      # Test authentication

# Frontend
cd client
npm run dev            # Start dev server
npm run build          # Build for production

# Git
git status             # Check changes
git add .              # Stage all changes
git commit -m "msg"    # Commit changes
git push               # Push to GitHub

# MongoDB
mongosh "connection-string"  # Connect to database
show dbs                     # List databases
use football-club            # Switch database
db.users.find()              # View users
```

---

## Support

- **Detailed MongoDB Setup**: See `MONGODB_SETUP_GUIDE.md`
- **Detailed Git Setup**: See `GIT_SETUP_GUIDE.md`
- **Phase 1 Verification**: See `TASK_9_INSTRUCTIONS.md`
- **Project Documentation**: See `README.md`

---

## Project Structure

```
football-club/
├── server/              # Backend (Node.js + Express)
│   ├── config/         # Database configuration
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Auth & logging middleware
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   ├── .env           # Environment variables (not in git)
│   └── server.js      # Entry point
├── client/             # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── contexts/   # React contexts
│   │   ├── pages/      # Page components
│   │   └── App.jsx     # Main app component
│   └── .env           # Environment variables (not in git)
└── .kiro/             # Spec files
    └── specs/
        └── football-club-management-system/
            ├── requirements.md
            ├── design.md
            └── tasks.md
```

---

**You're all set! 🎉**

Your Football Club Management System is now running locally and backed up on GitHub.
