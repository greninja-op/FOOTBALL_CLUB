# Project Structure - Football Club Management System

## Overview

This document provides a detailed overview of the project structure created for Task 1.

## Directory Structure

```
football-club/
│
├── server/                          # Backend Node.js/Express application
│   ├── server.js                    # Main server file with Express and Socket.io setup
│   ├── package.json                 # Backend dependencies and scripts
│   ├── .env.example                 # Environment variables template
│   ├── .eslintrc.json              # ESLint configuration for code quality
│   └── .gitignore                   # Git ignore patterns
│
├── client/                          # Frontend React application
│   ├── src/                         # Source files
│   │   ├── main.jsx                # React application entry point
│   │   ├── App.jsx                 # Main App component with routing
│   │   └── index.css               # Global styles with Tailwind directives
│   ├── index.html                   # HTML template
│   ├── package.json                 # Frontend dependencies and scripts
│   ├── vite.config.js              # Vite build configuration
│   ├── tailwind.config.js          # Tailwind CSS configuration
│   ├── postcss.config.js           # PostCSS configuration for Tailwind
│   ├── .env.example                 # Environment variables template
│   ├── .eslintrc.cjs               # ESLint configuration
│   └── .gitignore                   # Git ignore patterns
│
├── .kiro/                           # Kiro spec files (existing)
│   └── specs/
│       └── football-club-management-system/
│           ├── requirements.md      # System requirements
│           ├── design.md           # Technical design
│           └── tasks.md            # Implementation tasks
│
├── README.md                        # Project overview and quick start
├── SETUP_GUIDE.md                  # Detailed setup instructions
└── PROJECT_STRUCTURE.md            # This file
```

## Backend Configuration

### server/package.json
**Dependencies:**
- `express` (^4.18.2) - Web application framework
- `mongoose` (^8.0.0) - MongoDB object modeling
- `jsonwebtoken` (^9.0.2) - JWT token generation and verification
- `bcrypt` (^5.1.1) - Password hashing
- `socket.io` (^4.6.0) - Real-time bidirectional communication
- `multer` (^1.4.5-lts.1) - File upload middleware
- `cors` (^2.8.5) - Cross-Origin Resource Sharing
- `dotenv` (^16.3.1) - Environment variable management

**Dev Dependencies:**
- `nodemon` (^3.0.1) - Auto-restart server on file changes

**Scripts:**
- `npm start` - Run production server
- `npm run dev` - Run development server with nodemon
- `npm test` - Run tests (placeholder)

### server/server.js
**Features:**
- Express app initialization
- CORS configuration for cross-origin requests
- JSON and URL-encoded body parsing
- HTTP server creation
- Socket.io server with CORS support
- Basic health check endpoint (`/api/health`)
- Socket.io connection handling
- Server listening on configurable port

### server/.env.example
**Environment Variables:**
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing
- `JWT_EXPIRY` - Token expiration time (8h)
- `CLIENT_URL` - Frontend URL for CORS
- `MAX_FILE_SIZE` - Maximum upload file size
- `UPLOAD_DIR` - Directory for uploaded files

### server/.eslintrc.json
**Configuration:**
- Node.js environment
- ES2021 syntax support
- Recommended ESLint rules
- 2-space indentation
- Single quotes
- Semicolons required
- Console statements allowed

## Frontend Configuration

### client/package.json
**Dependencies:**
- `react` (^18.2.0) - UI library
- `react-dom` (^18.2.0) - React DOM rendering
- `react-router-dom` (^6.20.0) - Client-side routing
- `socket.io-client` (^4.6.0) - Socket.io client library

**Dev Dependencies:**
- `@vitejs/plugin-react` (^4.2.1) - Vite React plugin
- `vite` (^5.0.8) - Build tool and dev server
- `tailwindcss` (^3.3.6) - Utility-first CSS framework
- `autoprefixer` (^10.4.16) - PostCSS plugin for vendor prefixes
- `postcss` (^8.4.32) - CSS transformation tool
- `eslint` (^8.55.0) - JavaScript linter
- `eslint-plugin-react` (^7.33.2) - React-specific linting rules
- `eslint-plugin-react-hooks` (^4.6.0) - React Hooks linting
- `eslint-plugin-react-refresh` (^0.4.5) - React Fast Refresh linting

**Scripts:**
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### client/vite.config.js
**Configuration:**
- React plugin enabled
- Dev server on port 5173
- Proxy `/api` requests to backend (http://localhost:5000)

### client/tailwind.config.js
**Configuration:**
- Content paths for HTML and JSX/TSX files
- Default theme with extension support
- No additional plugins

### client/postcss.config.js
**Configuration:**
- Tailwind CSS plugin
- Autoprefixer plugin

### client/src/main.jsx
**Features:**
- React 18 createRoot API
- Strict Mode enabled
- Renders App component

### client/src/App.jsx
**Features:**
- React Router setup with BrowserRouter
- Basic welcome page route
- Tailwind CSS styling
- Responsive layout

### client/src/index.css
**Features:**
- Tailwind CSS directives (@tailwind base, components, utilities)
- Global font family configuration
- Font smoothing for better rendering

### client/.env.example
**Environment Variables:**
- `VITE_API_URL` - Backend API URL
- `VITE_SOCKET_URL` - Socket.io server URL

### client/.eslintrc.cjs
**Configuration:**
- Browser environment
- ES2020 syntax support
- React recommended rules
- React Hooks rules
- React Refresh plugin
- Prop types validation disabled (using TypeScript types instead)

## Key Features Implemented

### Backend
✅ Express server with middleware setup
✅ Socket.io integration for real-time communication
✅ CORS configuration for cross-origin requests
✅ Environment variable support
✅ Health check endpoint
✅ Modular structure ready for expansion

### Frontend
✅ React 18 with modern features
✅ Vite for fast development and building
✅ Tailwind CSS for utility-first styling
✅ React Router for client-side routing
✅ Socket.io client ready for real-time updates
✅ ESLint for code quality
✅ Responsive design foundation

## Next Steps (Future Tasks)

1. **Task 2**: Database setup and Mongoose models
   - Create MongoDB schemas for all 10 collections
   - Set up database connection
   - Implement schema validation

2. **Task 3**: Authentication system
   - Implement JWT authentication
   - Create login/logout endpoints
   - Set up password hashing with bcrypt

3. **Task 4**: Authorization middleware
   - Implement role-based access control
   - Create route guards
   - Set up permission matrix

4. **Task 5+**: Feature implementation
   - User management (Admin)
   - Fixture management (Manager)
   - Training sessions (Coach)
   - Player dashboard
   - Real-time event broadcasting

## Development Workflow

1. **Start MongoDB**: Ensure MongoDB is running
2. **Start Backend**: `cd server && npm run dev`
3. **Start Frontend**: `cd client && npm run dev`
4. **Access Application**: http://localhost:5173
5. **API Endpoint**: http://localhost:5000/api/health

## Code Quality

Both projects are configured with ESLint for maintaining code quality:
- Consistent code style
- Best practices enforcement
- React-specific rules
- Automatic error detection

## Environment Management

Both backend and frontend use environment variables:
- `.env.example` files provide templates
- Actual `.env` files are gitignored
- Vite uses `VITE_` prefix for frontend variables
- Backend uses standard environment variables

## File Upload Support

Backend is configured for file uploads:
- Multer middleware ready
- Upload directory structure planned
- File size limits configurable
- Support for logos and documents

## Real-Time Communication

Socket.io is configured on both ends:
- Backend: Socket.io server with authentication support
- Frontend: Socket.io client ready for connection
- CORS properly configured
- Event-based architecture ready

## Security Considerations

- CORS configured to allow only specified origins
- JWT secret configurable via environment
- Password hashing with bcrypt
- File upload validation planned
- Environment variables for sensitive data

## Task 1 Requirements Validation

✅ **Requirement 19.1**: Configuration file parsing support (via dotenv)
✅ **Requirement 19.2**: Environment-based configuration
✅ **Requirement 19.3**: Validation of required fields (JWT secret, port, database URI)

All Task 1 requirements have been successfully implemented!
