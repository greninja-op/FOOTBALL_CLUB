# ⚽ Football Club Management System

A comprehensive full-stack web application for managing football club operations, built with modern technologies and best practices.

![Phase](https://img.shields.io/badge/Phase-1%20Complete-success)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)
![Frontend](https://img.shields.io/badge/Frontend-React%2018-blue)
![Database](https://img.shields.io/badge/Database-MongoDB-brightgreen)

## 🎯 Overview

This system provides role-based management for football clubs with four distinct user roles:
- **Admin**: Full system access, user management, club settings
- **Manager**: Fixtures, contracts, documents, inventory, finance
- **Coach**: Tactical board, training, injuries, discipline, performance tracking
- **Player**: Personal dashboard, calendar, leave requests

## ✨ Features

### Phase 1 (Complete)
- ✅ JWT-based authentication with 8-hour token expiry
- ✅ Role-based access control with protected routes
- ✅ 10 comprehensive Mongoose schemas with validation
- ✅ React frontend with routing and authentication context
- ✅ Shared navigation component with club branding
- ✅ Database seeding with 4 test users
- ✅ Comprehensive verification tests

### Coming Soon
- 🔄 Admin Panel (User Management, Settings, Logs)
- 🔄 Manager Panel (Fixtures, Contracts, Documents, Inventory)
- 🔄 Coach Panel (Tactics, Training, Health, Discipline)
- 🔄 Player Panel (Dashboard, Calendar, Leave Requests)
- 🔄 Real-time updates with Socket.io
- 🔄 File uploads and document management

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.io
- **File Upload**: Multer

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **State Management**: React Context API

### Development
- **Testing**: Jest + fast-check (property-based testing)
- **Code Quality**: ESLint
- **Version Control**: Git + GitHub

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Atlas or local installation)
- Git

### 1. Clone Repository
```bash
git clone https://github.com/greninja-op/FOOTBALL_CLUB.git
cd FOOTBALL_CLUB
```

### 2. Setup MongoDB
Choose one option:

**Option A: MongoDB Atlas (Recommended)**
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create cluster and database user
3. Get connection string

**Option B: Local MongoDB**
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 3. Configure Environment Variables

**server/.env**:
```env
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**client/.env**:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Install Dependencies
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 5. Seed Database
```bash
cd server
npm run seed
```

### 6. Start Application
```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
cd client
npm run dev
```

### 7. Access Application
Open http://localhost:5173 and login with:
- **Admin**: admin@club.com / password123
- **Manager**: manager@club.com / password123
- **Coach**: coach@club.com / password123
- **Player**: player@club.com / password123

## 📁 Project Structure

```
football-club/
├── server/                 # Backend application
│   ├── config/            # Database configuration
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Auth, logging, role guards
│   ├── models/            # Mongoose schemas (10 models)
│   ├── routes/            # API routes
│   ├── .env              # Environment variables (not in git)
│   ├── seed.js           # Database seeding script
│   └── server.js         # Entry point
├── client/                # Frontend application
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # React contexts (Auth)
│   │   ├── pages/        # Page components (panels)
│   │   ├── App.jsx       # Main app component
│   │   └── main.jsx      # Entry point
│   └── .env             # Environment variables (not in git)
├── .kiro/               # Spec files
│   └── specs/
│       └── football-club-management-system/
│           ├── requirements.md  # 25 requirements
│           ├── design.md        # System architecture
│           └── tasks.md         # 42 implementation tasks
└── docs/                # Documentation
    ├── QUICK_START.md
    ├── MONGODB_SETUP_GUIDE.md
    └── GIT_SETUP_GUIDE.md
```

## 🗄️ Database Schema

10 Mongoose models with comprehensive validation:
- **User**: Authentication and role management
- **Profile**: User profiles with stats and contracts
- **Fixture**: Match scheduling and lineups
- **TrainingSession**: Training management and attendance
- **Injury**: Injury tracking and recovery
- **DisciplinaryAction**: Fines and disciplinary records
- **LeaveRequest**: Leave request workflow
- **Inventory**: Equipment assignment tracking
- **Settings**: Club configuration (singleton)
- **SystemLog**: Audit trail (immutable)

## 🔐 Security Features

- JWT tokens with 8-hour expiry
- bcrypt password hashing (cost factor 10)
- Role-based authorization middleware
- Protected API routes
- Audit logging for all write operations
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## 🧪 Testing

### Run Backend Tests
```bash
cd server
node test-phase1-verification.js
```

### Run Authentication Tests
```bash
cd server
node test-auth.js
```

### Manual Testing
See `TASK_9_INSTRUCTIONS.md` for comprehensive testing guide.

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)**: Get running in 10 minutes
- **[MONGODB_SETUP_GUIDE.md](MONGODB_SETUP_GUIDE.md)**: Detailed MongoDB setup
- **[GIT_SETUP_GUIDE.md](GIT_SETUP_GUIDE.md)**: Git and GitHub instructions
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)**: Complete setup guide
- **[PROJECT_LOG.md](PROJECT_LOG.md)**: Development history

## 🗺️ Roadmap

### Phase 1: Foundation ✅ (Complete)
- Authentication system
- Database schemas
- Frontend routing
- Role-based access control

### Phase 2: Admin Panel 🔄 (Next)
- User management CRUD
- Club settings with logo upload
- System logs viewer

### Phase 3: Manager Panel
- Fixture calendar
- Contract management
- Document vault
- Inventory tracking
- Finance dashboard

### Phase 4: Coach Panel
- Tactical board with drag-and-drop
- Training scheduler
- Squad health monitoring
- Disciplinary actions
- Performance tracking

### Phase 5: Player Panel
- Personal dashboard
- Calendar view
- Leave request submission

### Phase 6: Real-time Features
- Socket.io integration
- Live notifications
- Real-time updates across panels

### Phase 7: Production Ready
- Security audit
- Performance optimization
- Backup procedures
- Deployment documentation

## 🤝 Contributing

This is a learning project. Contributions, issues, and feature requests are welcome!

## 📝 License

This project is for educational purposes.

## 👤 Author

**greninja-op**
- GitHub: [@greninja-op](https://github.com/greninja-op)
- Repository: [FOOTBALL_CLUB](https://github.com/greninja-op/FOOTBALL_CLUB)

## 🙏 Acknowledgments

- Built with modern web development best practices
- Follows RESTful API design principles
- Implements property-based testing methodology
- Uses spec-driven development approach

---

**Status**: Phase 1 Complete | Ready for Phase 2 Development

For detailed setup instructions, see [QUICK_START.md](QUICK_START.md)
