# Football Club Management System - Startup Script
# Run this script to start both backend and frontend servers

Write-Host "🏟️  Football Club Management System - Starting..." -ForegroundColor Green
Write-Host ""

# Check MongoDB
Write-Host "Checking MongoDB..." -ForegroundColor Yellow
$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if ($mongoService) {
    if ($mongoService.Status -ne "Running") {
        Write-Host "Starting MongoDB service..." -ForegroundColor Yellow
        try {
            Start-Service -Name "MongoDB"
            Start-Sleep -Seconds 2
            Write-Host "✓ MongoDB started" -ForegroundColor Green
        } catch {
            Write-Host "⚠ Could not start MongoDB. Please start it manually." -ForegroundColor Red
        }
    } else {
        Write-Host "✓ MongoDB is running" -ForegroundColor Green
    }
} else {
    Write-Host "⚠ MongoDB service not found." -ForegroundColor Red
    Write-Host "Please install MongoDB from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

Write-Host ""

# Check if dependencies are installed
Write-Host "Checking dependencies..." -ForegroundColor Yellow

if (-not (Test-Path "server/node_modules")) {
    Write-Host "Installing server dependencies (this may take a few minutes)..." -ForegroundColor Yellow
    Set-Location server
    npm install
    Set-Location ..
    Write-Host "✓ Server dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✓ Server dependencies already installed" -ForegroundColor Green
}

if (-not (Test-Path "client/node_modules")) {
    Write-Host "Installing client dependencies (this may take a few minutes)..." -ForegroundColor Yellow
    Set-Location client
    npm install
    Set-Location ..
    Write-Host "✓ Client dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✓ Client dependencies already installed" -ForegroundColor Green
}

Write-Host ""

# Check if database is seeded
Write-Host "Database Setup" -ForegroundColor Yellow
$seedCheck = Read-Host "Have you seeded the database with test users? (y/n)"
if ($seedCheck -eq "n" -or $seedCheck -eq "N") {
    Write-Host "Seeding database with test users..." -ForegroundColor Yellow
    Set-Location server
    node seed.js
    Set-Location ..
    Write-Host "✓ Database seeded with 4 test users" -ForegroundColor Green
} else {
    Write-Host "✓ Database already seeded" -ForegroundColor Green
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 Starting Football Club Management System..." -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend Server:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend App:    http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test User Credentials:" -ForegroundColor Yellow
Write-Host "  👤 Admin:   admin@club.com / password123" -ForegroundColor White
Write-Host "  👤 Manager: manager@club.com / password123" -ForegroundColor White
Write-Host "  👤 Coach:   coach@club.com / password123" -ForegroundColor White
Write-Host "  👤 Player:  player@club.com / password123" -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠  Press Ctrl+C in each window to stop the servers" -ForegroundColor Yellow
Write-Host ""

# Start backend in new window
Write-Host "Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\server'; Write-Host '🔧 Backend Server Starting...' -ForegroundColor Green; npm run dev"

# Wait for backend to start
Write-Host "Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start frontend in new window
Write-Host "Starting frontend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\client'; Write-Host '⚛️  Frontend Server Starting...' -ForegroundColor Green; npm run dev"

Write-Host ""
Write-Host "✓ Servers started in separate windows" -ForegroundColor Green
Write-Host ""
Write-Host "Opening browser in 5 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Open browser
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "✅ Application is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Tips:" -ForegroundColor Yellow
Write-Host "  - Login with any test user above" -ForegroundColor White
Write-Host "  - Each role has different permissions" -ForegroundColor White
Write-Host "  - Real-time notifications work via Socket.io" -ForegroundColor White
Write-Host "  - Close server windows to stop the application" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "  - START_PROJECT.md - This startup guide" -ForegroundColor White
Write-Host "  - DEPLOYMENT_GUIDE.md - Production deployment" -ForegroundColor White
Write-Host "  - RUN_ALL_TESTS.md - Testing guide" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
