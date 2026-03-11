# 🚀 Start Football Club Management System

## Quick Start Guide

Follow these steps to run the project:

### Step 1: Install MongoDB (if not already installed)

**Check if MongoDB is installed:**
```powershell
mongod --version
```

**If not installed, download and install:**
1. Visit: https://www.mongodb.com/try/download/community
2. Download MongoDB Community Server for Windows
3. Install with "Install as Service" option checked
4. Verify installation: `mongod --version`

**Start MongoDB Service:**
```powershell
net start MongoDB
```

### Step 2: Install Dependencies

**Backend (Server):**
```powershell
cd server
npm install
```

This installs:
- express, mongoose, jsonwebtoken, bcrypt
- socket.io, multer, sharp, cors, dotenv
- validator, sanitize-html, express-rate-limit, helmet, compression
- jest, fast-check, supertest (for testing)

**Frontend (Client):**
```powershell
cd client
npm install
```

This installs:
- react, react-dom, react-router-dom
- socket.io-client, tailwindcss
- vitest, @testing-library/react, fast-check (for testing)

### Step 3: Seed the Database

**Create initial data (4 test users + settings):**
```powershell
cd server
node seed.js
```

This creates:
- **Admin**: admin@club.com / password123
- **Manager**: manager@club.com / password123
- **Coach**: coach@club.com / password123
- **Player**: player@club.com / password123

### Step 4: Start the Servers

**Option A: Manual Start (2 terminals)**

Terminal 1 - Backend:
```powershell
cd server
npm run dev
```
Server runs on: http://localhost:5000

Terminal 2 - Frontend:
```powershell
cd client
npm run dev
```
Client runs on: http://localhost:5173

**Option B: Use the startup script below**

### Step 5: Access the Application

Open your browser and go to:
```
http://localhost:5173
```

Login with any test user:
- Email: admin@club.com (or manager/coach/player)
- Password: password123

## Automated Startup Script

Save this as `start.ps1` in the project root:

```powershell
# Football Club Management System - Startup Script

Write-Host "🏟️  Football Club Management System - Starting..." -ForegroundColor Green
Write-Host ""

# Check MongoDB
Write-Host "Checking MongoDB..." -ForegroundColor Yellow
$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if ($mongoService) {
    if ($mongoService.Status -ne "Running") {
        Write-Host "Starting MongoDB service..." -ForegroundColor Yellow
        Start-Service -Name "MongoDB"
        Start-Sleep -Seconds 2
    }
    Write-Host "✓ MongoDB is running" -ForegroundColor Green
} else {
    Write-Host "⚠ MongoDB service not found. Please install MongoDB." -ForegroundColor Red
    Write-Host "Download from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check if dependencies are installed
Write-Host "Checking dependencies..." -ForegroundColor Yellow

if (-not (Test-Path "server/node_modules")) {
    Write-Host "Installing server dependencies..." -ForegroundColor Yellow
    Set-Location server
    npm install
    Set-Location ..
}

if (-not (Test-Path "client/node_modules")) {
    Write-Host "Installing client dependencies..." -ForegroundColor Yellow
    Set-Location client
    npm install
    Set-Location ..
}

Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Check if database is seeded
Write-Host "Checking database..." -ForegroundColor Yellow
$seedCheck = Read-Host "Have you seeded the database? (y/n)"
if ($seedCheck -eq "n") {
    Write-Host "Seeding database..." -ForegroundColor Yellow
    Set-Location server
    node seed.js
    Set-Location ..
    Write-Host "✓ Database seeded" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Starting servers..." -ForegroundColor Green
Write-Host ""
Write-Host "Backend will run on: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend will run on: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test Users:" -ForegroundColor Yellow
Write-Host "  Admin:   admin@club.com / password123" -ForegroundColor White
Write-Host "  Manager: manager@club.com / password123" -ForegroundColor White
Write-Host "  Coach:   coach@club.com / password123" -ForegroundColor White
Write-Host "  Player:  player@club.com / password123" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the servers" -ForegroundColor Yellow
Write-Host ""

# Start backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\server'; npm run dev"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\client'; npm run dev"

Write-Host "✓ Servers started in separate windows" -ForegroundColor Green
Write-Host ""
Write-Host "Opening browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "✓ Application is ready!" -ForegroundColor Green
Write-Host "Close the server windows to stop the application" -ForegroundColor Yellow
```

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Start MongoDB service
```powershell
net start MongoDB
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Kill the process using the port
```powershell
# Find process on port 5000
netstat -ano | findstr :5000
# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Dependencies Not Found
```
Error: Cannot find module 'express'
```
**Solution**: Install dependencies
```powershell
cd server
npm install
```

### Database Not Seeded
```
No users found in database
```
**Solution**: Run seed script
```powershell
cd server
node seed.js
```

## Running Tests

**Backend Tests:**
```powershell
cd server
npm test
```

**Frontend Tests:**
```powershell
cd client
npm test
```

**Watch Mode (Development):**
```powershell
# Backend
cd server
npm run test:watch

# Frontend
cd client
npm run test:watch
```

## Stopping the Application

1. Close both terminal windows (backend and frontend)
2. Or press `Ctrl+C` in each terminal

## Next Steps

After starting the application:

1. **Login** with any test user
2. **Explore** the different panels based on role
3. **Test** real-time features (Socket.io notifications)
4. **Review** the documentation in DEPLOYMENT_GUIDE.md
5. **Run tests** to verify everything works

## Production Deployment

For production deployment, see:
- `DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `DEPLOYMENT_CHECKLIST.md` - Pre-deployment checklist

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review `QUICK_START.md` for detailed setup
3. Check `MONGODB_SETUP_GUIDE.md` for MongoDB help
4. Review error logs in terminal windows

---

**Ready to start? Run the commands in Step 2-4 above!** 🚀
