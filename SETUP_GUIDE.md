# Setup Guide - Football Club Management System

## Prerequisites Installation

This project requires Node.js and MongoDB to be installed on your system.

### 1. Install Node.js

**Windows:**
1. Download Node.js LTS from https://nodejs.org/
2. Run the installer and follow the installation wizard
3. Verify installation by opening a new terminal and running:
   ```bash
   node --version
   npm --version
   ```

**macOS:**
```bash
# Using Homebrew
brew install node
```

**Linux:**
```bash
# Using apt (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Using yum (CentOS/RHEL)
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install -y nodejs
```

### 2. Install MongoDB

**Windows:**
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Run the installer and choose "Complete" installation
3. Install MongoDB as a Windows Service
4. Verify installation:
   ```bash
   mongod --version
   ```

**macOS:**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
# Ubuntu/Debian
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

## Project Setup

Once Node.js and MongoDB are installed, follow these steps:

### 1. Install Backend Dependencies

```bash
cd server
npm install
```

This will install:
- express (^4.18.2) - Web framework
- mongoose (^8.0.0) - MongoDB ODM
- jsonwebtoken (^9.0.2) - JWT authentication
- bcrypt (^5.1.1) - Password hashing
- socket.io (^4.6.0) - Real-time communication
- multer (^1.4.5-lts.1) - File upload handling
- cors (^2.8.5) - CORS middleware
- dotenv (^16.3.1) - Environment variables
- nodemon (^3.0.1) - Development auto-reload

### 2. Install Frontend Dependencies

```bash
cd ../client
npm install
```

This will install:
- react (^18.2.0) - UI library
- react-dom (^18.2.0) - React DOM renderer
- react-router-dom (^6.20.0) - Routing
- socket.io-client (^4.6.0) - Real-time client
- vite (^5.0.8) - Build tool
- tailwindcss (^3.3.6) - CSS framework
- ESLint and related plugins - Code quality

### 3. Configure Environment Variables

**Backend (.env):**
```bash
cd server
cp .env.example .env
```

Edit `server/.env` with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/football-club
JWT_SECRET=your-secure-secret-key-change-this
JWT_EXPIRY=8h
CLIENT_URL=http://localhost:5173
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

**Frontend (.env):**
```bash
cd ../client
cp .env.example .env
```

Edit `client/.env` with your configuration:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Create Upload Directories

```bash
cd ../server
mkdir -p uploads/logos uploads/documents
```

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

**Terminal 3 - MongoDB (if not running as service):**
```bash
mongod
```

## Verification

1. Backend should be running at: http://localhost:5000
   - Test health endpoint: http://localhost:5000/api/health

2. Frontend should be running at: http://localhost:5173
   - Open in browser to see the welcome page

3. MongoDB should be running on: mongodb://localhost:27017

## Troubleshooting

### Port Already in Use
If you get "port already in use" errors:
- Backend: Change `PORT` in `server/.env`
- Frontend: Change port in `client/vite.config.js`

### MongoDB Connection Failed
- Ensure MongoDB service is running
- Check connection string in `server/.env`
- Verify MongoDB is accessible: `mongosh` or `mongo`

### Module Not Found Errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

### ESLint Errors
- Run `npm run lint` to see all linting issues
- Most issues can be auto-fixed with `npm run lint -- --fix`

## Next Steps

After successful setup:
1. Review the requirements document: `.kiro/specs/football-club-management-system/requirements.md`
2. Review the design document: `.kiro/specs/football-club-management-system/design.md`
3. Check the tasks list: `.kiro/specs/football-club-management-system/tasks.md`
4. Start implementing Task 2: Database setup and Mongoose models

## Development Commands

### Backend
- `npm run dev` - Start development server with auto-reload
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure Created

```
football-club/
├── server/
│   ├── server.js           ✓ Basic Express + Socket.io setup
│   ├── package.json        ✓ All backend dependencies configured
│   ├── .env.example        ✓ Environment variables template
│   ├── .eslintrc.json      ✓ ESLint configuration
│   └── .gitignore          ✓ Git ignore rules
├── client/
│   ├── src/
│   │   ├── main.jsx        ✓ React entry point
│   │   ├── App.jsx         ✓ Main component with routing
│   │   └── index.css       ✓ Tailwind CSS imports
│   ├── index.html          ✓ HTML template
│   ├── package.json        ✓ All frontend dependencies configured
│   ├── vite.config.js      ✓ Vite with proxy configuration
│   ├── tailwind.config.js  ✓ Tailwind CSS configuration
│   ├── postcss.config.js   ✓ PostCSS configuration
│   ├── .env.example        ✓ Environment variables template
│   ├── .eslintrc.cjs       ✓ ESLint configuration
│   └── .gitignore          ✓ Git ignore rules
├── README.md               ✓ Project documentation
└── SETUP_GUIDE.md          ✓ This file
```

## Task 1 Completion Checklist

- [x] Created backend directory with Express.js setup
- [x] Created frontend directory with Vite + React + Tailwind
- [x] Configured all backend dependencies (express, mongoose, jsonwebtoken, bcrypt, socket.io, multer, cors, dotenv)
- [x] Configured all frontend dependencies (react, react-router-dom, socket.io-client, tailwindcss)
- [x] Created .env.example files for both backend and frontend
- [x] Set up ESLint configuration for both projects
- [x] Created basic Express server with Socket.io integration
- [x] Created React app with Tailwind CSS configured
- [x] Added comprehensive documentation

## Important Notes

⚠️ **Node.js Installation Required**: This system does not have Node.js installed. Please install Node.js LTS from https://nodejs.org/ before proceeding.

⚠️ **MongoDB Installation Required**: MongoDB must be installed and running. Download from https://www.mongodb.com/try/download/community

⚠️ **Security**: Change the JWT_SECRET in production to a strong, random value.

⚠️ **File Uploads**: Ensure the uploads directory has proper write permissions.
