# Football Club Management System - Deployment Guide

## Overview
This guide provides comprehensive instructions for deploying the Football Club Management System to production.

## Prerequisites

### Required Software
- Node.js 18+ and npm
- MongoDB 6.0+ (local or MongoDB Atlas)
- Git
- PM2 (for process management)

### Required Accounts
- MongoDB Atlas account (for cloud database) OR local MongoDB installation
- GitHub account (for version control)
- Domain name and hosting provider (optional)

## Environment Variables

### Backend (.env)
Create `server/.env` file with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/football_club_db
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/football_club_db

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY=8h

# Server Configuration
PORT=5000
NODE_ENV=production
CLIENT_URL=http://localhost:5173

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Backup Configuration
BACKUP_DIR=./backups
```

### Frontend (.env)
Create `client/.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Database Setup

### Option 1: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Create database user with read/write permissions
4. Whitelist your IP address (or 0.0.0.0/0 for all IPs)
5. Get connection string and update MONGODB_URI in .env

### Option 2: Local MongoDB
1. Install MongoDB Community Server
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/football_club_db`

### Database Seeding
```bash
cd server
npm install
node seed.js
```

This creates 4 test users:
- admin@club.com (Admin)
- manager@club.com (Manager)
- coach@club.com (Coach)
- player@club.com (Player)

All passwords: `password123`

## Installation

### 1. Clone Repository
```bash
git clone https://github.com/your-username/football-club-management.git
cd football-club-management
```

### 2. Install Dependencies

Backend:
```bash
cd server
npm install
```

Frontend:
```bash
cd client
npm install
```

### 3. Build Frontend
```bash
cd client
npm run build
```

## Running the Application

### Development Mode

Backend:
```bash
cd server
npm run dev
```

Frontend:
```bash
cd client
npm run dev
```

### Production Mode

#### Using PM2 (Recommended)

Install PM2 globally:
```bash
npm install -g pm2
```

Start backend:
```bash
cd server
pm2 start server.js --name football-club-api
```

Serve frontend (using serve package):
```bash
npm install -g serve
cd client
pm2 start "serve -s dist -l 5173" --name football-club-client
```

View logs:
```bash
pm2 logs
```

Stop services:
```bash
pm2 stop all
```

#### Using Node directly
```bash
cd server
NODE_ENV=production node server.js
```

## Security Checklist

### Before Deployment
- [ ] Change JWT_SECRET to a strong random string
- [ ] Update CLIENT_URL to production domain
- [ ] Enable HTTPS in production
- [ ] Set NODE_ENV=production
- [ ] Review and update CORS settings
- [ ] Change default user passwords
- [ ] Enable MongoDB authentication
- [ ] Set up firewall rules
- [ ] Configure rate limiting
- [ ] Enable helmet security headers
- [ ] Set up SSL/TLS certificates

### Security Features Implemented
✓ JWT authentication with 8-hour expiry
✓ Password hashing with bcrypt (cost factor 10)
✓ Role-based authorization (Admin/Manager/Coach/Player)
✓ Input validation and sanitization (XSS prevention)
✓ Rate limiting (100 requests per 15 minutes)
✓ Helmet security headers
✓ CORS with strict origin policy
✓ File upload validation (type and size)
✓ Audit logging for all write operations
✓ Global error handling
✓ Database connection encryption

## API Endpoints

### Authentication
- POST /api/auth/login - User login
- GET /api/auth/verify - Verify JWT token

### User Management (Admin only)
- POST /api/users - Create user
- GET /api/users - Get all users (paginated)
- PUT /api/users/:id - Update user
- DELETE /api/users/:id - Delete user

### Settings (Admin only)
- GET /api/settings - Get club settings
- PUT /api/settings - Update club settings
- POST /api/settings/logo - Upload club logo

### Fixtures (Manager/Admin create, All read)
- POST /api/fixtures - Create fixture
- GET /api/fixtures - Get all fixtures (paginated)
- PUT /api/fixtures/:id - Update fixture
- DELETE /api/fixtures/:id - Delete fixture

### Training (Coach/Admin create, All read)
- POST /api/training - Create training session
- GET /api/training - Get all sessions (paginated)
- PUT /api/training/:id/attendance - Mark attendance

### Injuries (Coach/Admin manage)
- POST /api/injuries - Log injury
- GET /api/injuries - Get all injuries (paginated)
- PUT /api/injuries/:id/recover - Mark recovered

### Leave Requests (Player submit, Coach/Admin approve)
- POST /api/leave - Submit leave request
- GET /api/leave - Get leave requests
- PUT /api/leave/:id/approve - Approve request
- PUT /api/leave/:id/deny - Deny request

### Profiles (Admin/Manager update, All read own)
- GET /api/profiles/:userId - Get profile
- PUT /api/profiles/:userId - Update profile
- PUT /api/profiles/:userId/fitness - Update fitness status
- PUT /api/profiles/:userId/stats - Update statistics

### Disciplinary (Coach/Admin log, Manager/Admin mark paid)
- POST /api/disciplinary - Log disciplinary action
- GET /api/disciplinary - Get all actions (paginated)
- PUT /api/disciplinary/:id/pay - Mark fine as paid

### Inventory (Manager/Admin manage)
- POST /api/inventory - Create inventory item
- GET /api/inventory - Get all items (paginated)
- PUT /api/inventory/:id/assign - Assign item to player
- PUT /api/inventory/:id/return - Return item

### Documents (Manager/Admin manage)
- POST /api/documents - Upload document
- GET /api/documents/:playerId - Get player documents
- GET /api/documents/download/:documentId - Download document
- DELETE /api/documents/:documentId - Delete document

### System Logs (Admin only)
- GET /api/logs - Get system logs (paginated)

## Socket.io Events

### Real-time Events
- `fixture:created` - New fixture created
- `leave:approved` - Leave request approved
- `leave:denied` - Leave request denied
- `fine:issued` - Disciplinary fine issued
- `injury:logged` - Injury logged
- `stats:updated` - Player stats updated
- `inventory:assigned` - Equipment assigned
- `settings:updated` - Club settings updated

## Backup and Recovery

### Create Backup
```bash
cd server
node scripts/backup.js
```

Backups are stored in `./backups` directory with timestamp.
Retention: Last 7 days (automatic cleanup).

### Restore from Backup
```bash
cd server
node scripts/restore.js backup_2026-03-11_14-30-00
```

### Automated Backups (Linux/Mac)
Add to crontab for daily backups at 2 AM:
```bash
crontab -e
```

Add line:
```
0 2 * * * cd /path/to/server && node scripts/backup.js >> /var/log/football-club-backup.log 2>&1
```

### Automated Backups (Windows)
Use Task Scheduler to run backup script daily.

## Monitoring

### Health Check
```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "status": "ok",
  "message": "Server is running",
  "database": {
    "connected": true,
    "state": "connected"
  }
}
```

### PM2 Monitoring
```bash
pm2 monit
pm2 status
pm2 logs
```

## Troubleshooting

### Database Connection Issues
- Verify MONGODB_URI is correct
- Check MongoDB service is running
- Verify network connectivity
- Check firewall rules
- Verify MongoDB authentication credentials

### Authentication Issues
- Verify JWT_SECRET is set
- Check token expiry (8 hours)
- Verify user credentials
- Check role permissions

### File Upload Issues
- Verify UPLOAD_DIR exists and is writable
- Check MAX_FILE_SIZE setting
- Verify file type is allowed (JPEG, PNG, PDF)
- Check disk space

### Socket.io Connection Issues
- Verify CORS settings
- Check CLIENT_URL matches frontend URL
- Verify Socket.io server is running
- Check firewall rules for WebSocket connections

## Performance Optimization

### Implemented Optimizations
✓ Database connection pooling (5-20 connections)
✓ Response compression (gzip)
✓ Image optimization (max 1920px, 85% quality)
✓ Pagination (max 50 items per page)
✓ Database indexes on frequently queried fields
✓ Efficient query patterns with population

### Additional Recommendations
- Use CDN for static assets
- Enable HTTP/2
- Implement caching (Redis)
- Use load balancer for horizontal scaling
- Monitor performance with APM tools

## Support

For issues and questions:
- Check documentation in `/docs` directory
- Review error logs in PM2 or console
- Check MongoDB logs
- Verify environment variables
- Test with health check endpoint

## License
ISC
