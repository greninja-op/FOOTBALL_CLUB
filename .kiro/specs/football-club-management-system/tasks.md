# Implementation Plan: Football Club Management System

## Overview

This implementation plan breaks down the Football Club Management System into 7 sequential phases, following strict dependency order. Each phase must be fully functional and tested before proceeding to the next. The system uses Node.js/Express backend with MongoDB, React frontend with Tailwind CSS, JWT authentication, and Socket.io for real-time updates.

## Critical Implementation Rules

1. DO NOT proceed to Phase N+1 until Phase N is fully functional
2. Each phase includes checkpoint tasks to validate completion
3. Cross-panel dependencies must be respected (e.g., Manager creates fixtures before Coach assigns lineups)
4. All 41 correctness properties from design must be testable
5. Property-based tests use fast-check with 100+ iterations per property
6. Testing tasks are marked optional with "*" postfix

## Tech Stack

- Backend: Node.js + Express.js + MongoDB + Mongoose
- Frontend: React 18 + React Router v6 + Tailwind CSS (Vite)
- Auth: JWT + bcrypt
- File Storage: Multer
- Real-time: Socket.io
- State: React Context API
- Testing: Jest + fast-check + React Testing Library

## Tasks

### Phase 1: Global Architecture & Authentication Foundation

This phase establishes the foundation that all other phases depend on. Nothing can proceed until authentication, database schemas, and basic routing are functional.

- [x] 1. Initialize project structure and dependencies
  - Create backend directory with Express.js setup
  - Create frontend directory with Vite + React + Tailwind
  - Install all dependencies: express, mongoose, jsonwebtoken, bcrypt, socket.io, multer, cors, dotenv
  - Install frontend dependencies: react, react-router-dom, socket.io-client, tailwindcss
  - Create .env.example files for both backend and frontend
  - Set up ESLint configuration for both projects
  - _Requirements: 19.1, 19.2, 19.3_

- [x] 2. Configure MongoDB connection and environment variables
  - Create backend/config/database.js with MongoDB connection logic
  - Implement connection error handling and reconnection strategy
  - Create .env file with MONGODB_URI, JWT_SECRET, PORT, CLIENT_URL
  - Test database connection on server startup
  - _Requirements: 19.1, 25.1_

- [x] 3. Create all 10 Mongoose schemas with validation
  - [x] 3.1 Create User schema (email, passwordHash, role, createdAt)
    - Add email validation regex and unique constraint
    - Add role enum validation ['admin', 'manager', 'coach', 'player']
    - Add indexes for email and role fields
    - _Requirements: 3.1, 3.2, 3.5, 22.1_
  
  - [x] 3.2 Create Profile schema (userId, fullName, position, fitness, stats, contract)
    - Add userId reference to User with unique constraint
    - Add fitness status enum ['Green', 'Yellow', 'Red']
    - Add position enum ['Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Staff']
    - Add contract fields (contractType, contractStart, contractEnd)
    - Add stats object (goals, assists, appearances, rating with 0-10 range)
    - Add performanceNotes array with createdBy reference
    - Add indexes for userId, fitnessStatus, contractEnd
    - _Requirements: 3.6, 7.1, 13.1, 16.5, 22.1_
  
  - [x] 3.3 Create Fixture schema (opponent, date, location, matchType, lineup, createdBy)
    - Add date validation to prevent past dates
    - Add matchType enum ['League', 'Cup', 'Friendly', 'Tournament']
    - Add lineup array with Profile references (max 18 validation)
    - Add createdBy reference to User
    - Add indexes for date and createdBy
    - _Requirements: 6.1, 6.4, 10.6, 22.1, 22.3_
  
  - [x] 3.4 Create TrainingSession schema (date, drillDescription, duration, attendees, createdBy)
    - Add date validation to prevent past dates
    - Add duration range validation (30-300 minutes)
    - Add attendees array with playerId and status enum ['Present', 'Absent', 'Excused']
    - Add createdBy reference to User
    - Add indexes for date and createdBy
    - _Requirements: 11.1, 11.2, 11.5, 22.1_
  
  - [x] 3.5 Create Injury schema (playerId, injuryType, severity, expectedRecovery, resolved, loggedBy)
    - Add playerId reference to Profile
    - Add severity enum ['Minor', 'Moderate', 'Severe']
    - Add resolved boolean with default false
    - Add loggedBy reference to User
    - Add indexes for playerId, resolved, dateLogged
    - _Requirements: 14.1, 22.1_
  
  - [x] 3.6 Create DisciplinaryAction schema (playerId, offense, fineAmount, isPaid, issuedBy)
    - Add playerId reference to Profile
    - Add fineAmount range validation (0-100000)
    - Add isPaid boolean with default false
    - Add issuedBy reference to User
    - Add indexes for playerId, isPaid, dateIssued
    - _Requirements: 15.1, 22.1_
  
  - [x] 3.7 Create LeaveRequest schema (playerId, startDate, endDate, reason, status, reviewedBy)
    - Add playerId reference to Profile
    - Add date range validation (endDate >= startDate)
    - Add status enum ['Pending', 'Approved', 'Denied'] with default 'Pending'
    - Add reviewedBy reference to User
    - Add indexes for playerId, status, startDate
    - _Requirements: 12.1, 12.2, 12.7, 22.1_
  
  - [x] 3.8 Create Inventory schema (itemName, itemType, assignedTo, assignedAt, returnedAt)
    - Add itemType enum ['Jersey', 'Boots', 'Training Equipment', 'Medical', 'Other']
    - Add assignedTo reference to Profile (nullable)
    - Add virtual property isAssigned (assignedTo !== null && returnedAt === null)
    - Add indexes for assignedTo and itemType
    - _Requirements: 9.1, 22.1_
  
  - [x] 3.9 Create Settings schema (clubName, logoUrl, updatedBy)
    - Add clubName length validation (3-100 characters)
    - Add singleton pattern static method getSingleton()
    - Add updatedBy reference to User
    - _Requirements: 4.1, 4.5, 22.1_
  
  - [x] 3.10 Create SystemLog schema (action, performedBy, targetCollection, targetId, timestamp)
    - Add action enum ['CREATE', 'UPDATE', 'DELETE']
    - Add performedBy reference to User
    - Add timestamp with immutable flag
    - Add pre-hooks to prevent updates and deletes
    - Add indexes for timestamp (descending), performedBy, targetCollection
    - _Requirements: 5.1, 5.3, 22.1_

- [ ]* 3.11 Write property tests for schema validation
  - **Property 7: Role Enumeration Validation**
  - **Property 13: Club Name Length Validation**
  - **Property 14: Date Range Validation**
  - **Property 22: Fitness Status Enumeration**
  - **Property 24: Player Rating Range Validation**
  - **Property 28: Numeric Range Validation**
  - **Property 32: Schema Validation Enforcement**
  - _Validates: Requirements 3.2, 4.5, 7.4, 12.7, 13.1, 16.5, 20.3, 20.4, 22.1_

- [x] 4. Implement authentication middleware and JWT utilities
  - [x] 4.1 Create authMiddleware.js to validate JWT tokens
    - Extract Bearer token from Authorization header
    - Verify JWT using secret from environment
    - Decode payload to get {id, role}
    - Attach req.user = {id, role} to request
    - Return 401 if token is missing, invalid, or expired
    - _Requirements: 1.3, 2.1, 21.1_
  
  - [x] 4.2 Create roleGuard.js factory function for role-based protection
    - Implement requireRole(allowedRoles) middleware factory
    - Check if req.user.role is in allowedRoles array
    - Return 403 if unauthorized
    - Call next() if authorized
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_
  
  - [x] 4.3 Create loggerMiddleware.js for audit trail
    - Intercept POST, PUT, PATCH, DELETE requests
    - After controller execution, create SystemLog entry
    - Log: action, performedBy, targetCollection, targetId, timestamp
    - Handle errors gracefully without blocking requests
    - _Requirements: 3.3, 3.4, 5.1, 5.4_

- [ ]* 4.4 Write property tests for authentication and authorization
  - **Property 1: JWT Token Generation and Expiry**
  - **Property 2: Authentication Error Handling**
  - **Property 3: Password Storage Security**
  - **Property 4: Role-Based Route Authorization**
  - **Property 5: Protected Route Authentication**
  - _Validates: Requirements 1.1, 1.2, 1.3, 1.4, 2.1, 2.2-2.9, 21.1, 21.6_

- [x] 5. Implement authentication controller and routes
  - [x] 5.1 Create authController.js with login, logout, verifyToken functions
    - Implement login(email, password): validate credentials, generate JWT with 8hr expiry
    - Use bcrypt.compare() for password verification
    - Return {token, role, userId} on success
    - Return authentication error without revealing email existence
    - Implement verifyToken(token): validate JWT and return user data
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [x] 5.2 Create auth routes (POST /api/auth/login, POST /api/auth/logout, GET /api/auth/verify)
    - POST /api/auth/login: no authentication required
    - GET /api/auth/verify: requires authMiddleware
    - Return appropriate HTTP status codes (200, 401)
    - _Requirements: 1.1, 1.2, 23.4_

- [ ]* 5.3 Write unit tests for authentication controller
  - Test login with valid credentials returns token
  - Test login with invalid credentials returns 401
  - Test token expiry after 8 hours
  - Test password hashing with bcrypt cost factor 10
  - _Validates: Requirements 1.1, 1.2, 1.3, 1.4_

- [x] 6. Create database seeding script with 4 test users
  - Create seed.js script to populate initial data
  - Create 4 users: admin@club.com, manager@club.com, coach@club.com, player@club.com
  - Hash all passwords with bcrypt (use "password123" for testing)
  - Create associated Profile for each user
  - Create initial Settings document with default club name
  - Log all seeded user credentials to console
  - _Requirements: 3.1, 3.6, 4.1_

- [x] 7. Set up React frontend with routing and authentication context
  - [x] 7.1 Initialize Vite React project with Tailwind CSS
    - Configure Tailwind CSS with custom theme
    - Set up React Router v6 with route definitions
    - Create basic folder structure (components, pages, contexts, hooks, utils)
    - _Requirements: 19.1_
  
  - [x] 7.2 Create AuthContext and AuthProvider
    - Manage authentication state (token, user, role, loading)
    - Implement login(email, password) function
    - Implement logout() function to clear localStorage
    - Store token in localStorage with key 'authToken'
    - Verify token on mount using /api/auth/verify
    - Redirect to login if token is invalid
    - _Requirements: 1.1, 1.5_
  
  - [x] 7.3 Create ProtectedRoute component
    - Check for valid token before rendering route
    - Redirect to /login if unauthenticated
    - Optionally check role permissions
    - Show loading spinner while verifying token
    - _Requirements: 2.1_
  
  - [x] 7.4 Create LoginPage component
    - Email and password input fields with validation
    - Submit button that calls AuthContext.login()
    - Display error messages for authentication failures
    - Redirect to role-specific panel on success (Admin → /admin, Manager → /manager, Coach → /coach, Player → /player)
    - _Requirements: 1.1, 1.2, 1.5_
  
  - [x] 7.5 Create role-specific panel placeholder pages
    - Create AdminPanel.jsx with "Admin Panel" heading
    - Create ManagerPanel.jsx with "Manager Panel" heading
    - Create CoachPanel.jsx with "Coach Panel" heading
    - Create PlayerPanel.jsx with "Player Panel" heading
    - Wrap each with ProtectedRoute checking appropriate role
    - _Requirements: 2.3, 2.4, 2.5, 2.6_

- [ ]* 7.6 Write unit tests for authentication flow
  - Test LoginPage renders correctly
  - Test successful login redirects to correct panel
  - Test failed login shows error message
  - Test ProtectedRoute redirects unauthenticated users
  - _Validates: Requirements 1.1, 1.2, 1.5, 2.1_

- [x] 8. Create shared Navbar component with club logo display
  - Display club name and logo from Settings
  - Show current user role badge
  - Include logout button that calls AuthContext.logout()
  - Fetch settings from /api/settings on mount
  - Style with Tailwind CSS for responsive design
  - _Requirements: 4.3_

- [x] 9. Checkpoint - Phase 1 Complete
  - Verify all 4 seeded users can log in successfully
  - Verify each user lands on correct role-locked panel
  - Verify unauthenticated users are redirected to login
  - Verify role guards prevent unauthorized access (e.g., player cannot access /admin)
  - Verify Navbar displays club name and logout button
  - Ensure all tests pass, ask the user if questions arise.

### Phase 2: Admin Panel (Depends on Phase 1)

This phase implements admin-specific features. Requires Phase 1 authentication and schemas to be complete.

- [ ] 10. Implement User Management backend
  - [ ] 10.1 Create userController.js with CRUD operations
    - Implement createUser(email, password, role): create User and Profile atomically
    - Implement getAllUsers(page, limit): return paginated user list
    - Implement updateUser(id, updates): update email or role
    - Implement deleteUser(id): remove User and Profile, log operation
    - Validate email uniqueness on create and update
    - Hash passwords with bcrypt on creation
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  
  - [ ] 10.2 Create user routes with role guards
    - POST /api/users: requireRole(['admin']), loggerMiddleware
    - GET /api/users: requireRole(['admin'])
    - PUT /api/users/:id: requireRole(['admin']), loggerMiddleware
    - DELETE /api/users/:id: requireRole(['admin']), loggerMiddleware
    - Return appropriate HTTP status codes (200, 201, 400, 403, 404)
    - _Requirements: 2.6, 3.1, 3.3, 3.4, 23.4_

- [ ]* 10.3 Write property tests for user management
  - **Property 6: User Creation with Profile**
  - **Property 8: Email Uniqueness Constraint**
  - **Property 9: Audit Logging for Write Operations**
  - _Validates: Requirements 3.1, 3.3, 3.4, 3.5, 3.6, 22.2_

- [ ] 11. Implement Club Settings backend
  - [ ] 11.1 Create settingsController.js
    - Implement getSettings(): return singleton Settings document
    - Implement updateSettings(data): update clubName and/or logoUrl, emit settings:updated event
    - Implement uploadLogo(file): handle Multer upload, validate size (5MB) and type (JPEG, PNG)
    - Optimize uploaded logo to max 1920px width using sharp library
    - _Requirements: 4.1, 4.2, 4.4, 24.5_
  
  - [ ] 11.2 Create settings routes with file upload
    - GET /api/settings: authMiddleware (all roles can read)
    - PUT /api/settings: requireRole(['admin']), loggerMiddleware
    - POST /api/settings/logo: requireRole(['admin']), multer.single('logo')
    - Validate file type and size before storage
    - Clean up failed uploads
    - _Requirements: 4.1, 4.2, 4.4, 23.3_

- [ ]* 11.3 Write property tests for settings management
  - **Property 12: Settings Update Broadcasting**
  - **Property 13: Club Name Length Validation**
  - **Property 16: File Upload Validation**
  - **Property 39: Image Optimization**
  - _Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 24.5_

- [ ] 12. Implement System Logs backend
  - [ ] 12.1 Create systemLogController.js
    - Implement getAllLogs(page, limit, startDate, endDate): return paginated logs sorted by timestamp descending
    - Read-only controller (no create, update, delete methods)
    - Support date range filtering
    - _Requirements: 5.2, 5.5_
  
  - [ ] 12.2 Create system logs routes
    - GET /api/logs: requireRole(['admin'])
    - Support query parameters: page, limit, startDate, endDate
    - Return logs with user population (performedBy field)
    - _Requirements: 5.2, 5.5_

- [ ]* 12.3 Write property tests for system logs
  - **Property 10: System Log Immutability**
  - **Property 11: System Log Chronological Ordering**
  - _Validates: Requirements 5.3, 5.5_

- [ ] 13. Build Admin Panel frontend components
  - [ ] 13.1 Create UserManagement component
    - Display paginated user list with email, role, createdAt
    - Add "Create User" button that opens modal
    - Add edit and delete buttons for each user
    - Implement CreateUserForm modal with email, password, role fields
    - Implement EditUserModal with email and role fields
    - Show success/error toast notifications
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ] 13.2 Create ClubSettings component
    - Display current club name and logo
    - Add form to update club name with validation (3-100 chars)
    - Add logo upload with drag-and-drop support
    - Show file size and type validation errors
    - Preview uploaded logo before submission
    - _Requirements: 4.1, 4.4, 4.5_
  
  - [ ] 13.3 Create SystemLogs component
    - Display paginated log table with columns: timestamp, user, action, collection, targetId
    - Sort by timestamp descending (newest first)
    - Add date range filter inputs
    - Style with Tailwind CSS for readability
    - Make table read-only (no edit/delete buttons)
    - _Requirements: 5.2, 5.5_
  
  - [ ] 13.4 Integrate components into AdminPanel
    - Add tab navigation for User Management, Club Settings, System Logs
    - Ensure all components use AuthContext for token
    - Handle 403 errors by showing "Access Denied" message
    - _Requirements: 2.6_

- [ ]* 13.5 Write unit tests for Admin Panel components
  - Test UserManagement renders user list
  - Test CreateUserForm validates inputs
  - Test ClubSettings validates club name length
  - Test SystemLogs displays logs in correct order
  - _Validates: Requirements 3.1, 4.5, 5.5_

- [ ] 14. Checkpoint - Phase 2 Complete
  - Verify Admin can create users with all 4 roles
  - Verify Admin can update user roles
  - Verify Admin can delete users
  - Verify Admin can change club name and logo
  - Verify System Logs show all write operations
  - Verify non-admin users cannot access admin routes (403 errors)
  - Ensure all tests pass, ask the user if questions arise.

### Phase 3: Manager Panel (Depends on Phase 1 auth + Phase 2 users)

This phase implements manager-specific features. Requires authentication and user management to be functional.

- [ ] 15. Implement Fixture Management backend
  - [ ] 15.1 Create fixtureController.js
    - Implement createFixture(data): create fixture, emit fixture:created event via Socket.io
    - Implement getAllFixtures(page, limit, startDate, endDate): return paginated fixtures
    - Implement updateFixture(id, updates): update fixture details, log operation
    - Implement deleteFixture(id): remove fixture, log operation
    - Validate date is not in the past
    - Validate lineup size (max 18 players)
    - _Requirements: 6.1, 6.2, 6.4, 6.5, 10.6_
  
  - [ ] 15.2 Create fixture routes
    - POST /api/fixtures: requireRole(['manager', 'admin']), loggerMiddleware
    - GET /api/fixtures: authMiddleware (all roles can read)
    - PUT /api/fixtures/:id: requireRole(['manager', 'coach', 'admin']), loggerMiddleware
    - DELETE /api/fixtures/:id: requireRole(['manager', 'admin']), loggerMiddleware
    - Note: Only coach can update lineup field (validate in controller)
    - _Requirements: 2.7, 6.1, 6.5, 6.6_

- [ ]* 15.3 Write property tests for fixture management
  - **Property 15: Future Date Validation**
  - **Property 19: Lineup Size Constraint**
  - **Property 33: Referential Integrity for Lineups**
  - _Validates: Requirements 6.4, 10.6, 22.3_

- [ ] 16. Implement Document Vault backend
  - [ ] 16.1 Create documentController.js
    - Implement uploadDocument(playerId, file): store document with Multer, validate type (PDF, JPEG, PNG) and size (10MB)
    - Implement getPlayerDocuments(playerId): return all documents for a player
    - Implement downloadDocument(documentId): stream file for download
    - Implement deleteDocument(documentId): remove file and database record, log operation
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ] 16.2 Create document routes with file upload
    - POST /api/documents: requireRole(['manager', 'admin']), multer.single('document'), loggerMiddleware
    - GET /api/documents/:playerId: requireRole(['manager', 'admin'])
    - GET /api/documents/download/:documentId: requireRole(['manager', 'admin'])
    - DELETE /api/documents/:documentId: requireRole(['manager', 'admin']), loggerMiddleware
    - Clean up failed uploads
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 23.3_

- [ ]* 16.3 Write property tests for document vault
  - **Property 16: File Upload Validation**
  - **Property 17: Document Deletion with Cleanup**
  - **Property 35: File Upload Cleanup on Failure**
  - _Validates: Requirements 8.1, 8.2, 8.5, 20.5, 23.3_

- [ ] 17. Implement Inventory Management backend
  - [ ] 17.1 Create inventoryController.js
    - Implement createItem(data): create inventory item
    - Implement assignItem(itemId, playerId): assign to player, emit inventory:assigned event
    - Implement unassignItem(itemId, returnDate): record return
    - Implement getAllItems(page, limit, assigned): return inventory with assignment status
    - _Requirements: 9.1, 9.2, 9.4, 9.5_
  
  - [ ] 17.2 Create inventory routes
    - POST /api/inventory: requireRole(['manager', 'admin']), loggerMiddleware
    - GET /api/inventory: authMiddleware (all roles can read)
    - PUT /api/inventory/:id/assign: requireRole(['manager', 'admin']), loggerMiddleware
    - PUT /api/inventory/:id/return: requireRole(['manager', 'admin']), loggerMiddleware
    - _Requirements: 9.1, 9.2, 9.4_

- [ ]* 17.3 Write property tests for inventory management
  - **Property 18: Real-Time Event Broadcasting** (inventory:assigned event)
  - _Validates: Requirements 9.2, 18.6_

- [ ] 18. Implement Profile and Contract Management backend
  - [ ] 18.1 Create profileController.js
    - Implement getProfile(userId): return profile with user data
    - Implement updateProfile(userId, updates): update profile fields, log operation
    - Implement updateFitnessStatus(userId, status, notes): update fitness (coach/admin only)
    - Implement updateStats(userId, stats): update performance metrics, emit stats:updated event
    - Validate rating is 0-10 range
    - _Requirements: 7.1, 7.2, 13.2, 13.3, 16.5_
  
  - [ ] 18.2 Create profile routes
    - GET /api/profiles/:userId: authMiddleware (admin/manager/coach see all, player sees own only)
    - PUT /api/profiles/:userId: requireRole(['admin', 'manager']), loggerMiddleware
    - PUT /api/profiles/:userId/fitness: requireRole(['coach', 'admin']), loggerMiddleware
    - PUT /api/profiles/:userId/stats: requireRole(['coach', 'admin']), loggerMiddleware
    - Validate player can only access own profile
    - _Requirements: 6.6, 13.2, 13.3, 16.4, 17.4_

- [ ]* 18.3 Write property tests for profile management
  - **Property 18: Real-Time Event Broadcasting** (stats:updated event)
  - _Validates: Requirements 16.2, 18.5_

- [ ] 19. Implement Disciplinary Actions backend
  - [ ] 19.1 Create disciplinaryController.js
    - Implement logAction(data): create disciplinary action, emit fine:issued event
    - Implement getAllActions(page, limit, isPaid): return disciplinary records
    - Implement markPaid(actionId, paymentDate): update payment status, log operation
    - Implement getPendingFines(): return unpaid fines with totals
    - _Requirements: 15.1, 15.2, 15.3, 15.4_
  
  - [ ] 19.2 Create disciplinary routes
    - POST /api/disciplinary: requireRole(['coach', 'admin']), loggerMiddleware
    - GET /api/disciplinary: requireRole(['coach', 'manager', 'admin'])
    - PUT /api/disciplinary/:id/pay: requireRole(['manager', 'admin']), loggerMiddleware
    - _Requirements: 15.1, 15.2, 15.3_

- [ ]* 19.3 Write property tests for disciplinary actions
  - **Property 18: Real-Time Event Broadcasting** (fine:issued event)
  - _Validates: Requirements 15.2, 18.4_

- [ ] 20. Build Manager Panel frontend components
  - [ ] 20.1 Create FixtureCalendar component
    - Display fixtures in calendar view with date, opponent, location
    - Add "Create Fixture" button that opens modal
    - Implement CreateFixtureModal with opponent, date, location, matchType fields
    - Validate date is not in the past
    - Show success/error toast notifications
    - _Requirements: 6.1, 6.4_
  
  - [ ] 20.2 Create ContractManagement component
    - Display player contracts with countdown timers
    - Calculate days remaining until contract expiry
    - Show warning indicator for contracts with < 90 days remaining
    - Display contract details: player name, start date, end date, type
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [ ] 20.3 Create DocumentVault component
    - Display documents grouped by player
    - Add upload button with file input (PDF, JPEG, PNG)
    - Validate file size (10MB) and type before upload
    - Add download button for each document
    - Add delete button with confirmation dialog
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ] 20.4 Create InventoryManagement component
    - Display inventory table with item name, type, assigned to, assignment date
    - Add "Create Item" button that opens modal
    - Add "Assign" button for unassigned items
    - Add "Return" button for assigned items
    - Show assignment status indicator (assigned/available)
    - _Requirements: 9.1, 9.4, 9.5_
  
  - [ ] 20.5 Create FinanceDashboard component
    - Display pending fines table with player name, offense, amount, date issued
    - Calculate total pending fines amount
    - Add "Mark Paid" button for each fine
    - Show payment date for paid fines
    - _Requirements: 15.3, 15.4_
  
  - [ ] 20.6 Integrate components into ManagerPanel
    - Add tab navigation for Fixtures, Contracts, Documents, Inventory, Finance
    - Ensure all components use AuthContext for token
    - Handle 403 errors appropriately
    - _Requirements: 2.7_

- [ ]* 20.7 Write unit tests for Manager Panel components
  - Test FixtureCalendar validates past dates
  - Test ContractManagement shows warning for expiring contracts
  - Test DocumentVault validates file types
  - Test InventoryManagement displays assignment status
  - _Validates: Requirements 6.4, 7.3, 8.1, 9.5_

- [ ] 21. Checkpoint - Phase 3 Complete
  - Verify Manager can create fixtures that appear in calendar
  - Verify Manager can upload and download player documents
  - Verify Manager can assign inventory to players
  - Verify Manager can mark fines as paid
  - Verify contract countdown timers display correctly
  - Verify non-manager users cannot access manager-only routes
  - Ensure all tests pass, ask the user if questions arise.

### Phase 4: Coach Panel (Depends on Phase 1 auth + Phase 3 fixtures)

This phase implements coach-specific features. Requires fixtures to exist before lineups can be assigned.

- [ ] 22. Implement Training Session Management backend
  - [ ] 22.1 Create trainingController.js
    - Implement createSession(data): create training session, validate date not in past
    - Implement markAttendance(sessionId, playerId, status): record attendance with enum validation
    - Implement getAllSessions(page, limit, startDate, endDate): return paginated sessions
    - _Requirements: 11.1, 11.2, 11.3, 11.5_
  
  - [ ] 22.2 Create training routes
    - POST /api/training: requireRole(['coach', 'admin']), loggerMiddleware
    - GET /api/training: authMiddleware (all roles can read)
    - PUT /api/training/:id/attendance: requireRole(['coach', 'admin']), loggerMiddleware
    - _Requirements: 11.1, 11.2, 11.3_

- [ ]* 22.3 Write property tests for training management
  - **Property 15: Future Date Validation** (training sessions)
  - _Validates: Requirements 11.5_

- [ ] 23. Implement Injury Tracking backend
  - [ ] 23.1 Create injuryController.js
    - Implement logInjury(data): create injury record, set player fitness to Red, emit injury:logged event
    - Implement getAllInjuries(page, limit, resolved): return injury records with player data
    - Implement markRecovered(injuryId, recoveryDate): update injury status, reset fitness
    - Implement getActiveInjuries(): return unresolved injuries
    - _Requirements: 14.1, 14.2, 14.3, 14.4_
  
  - [ ] 23.2 Create injury routes
    - POST /api/injuries: requireRole(['coach', 'admin']), loggerMiddleware
    - GET /api/injuries: requireRole(['coach', 'manager', 'admin'])
    - PUT /api/injuries/:id/recover: requireRole(['coach', 'admin']), loggerMiddleware
    - _Requirements: 14.1, 14.2, 14.4_

- [ ]* 23.3 Write property tests for injury tracking
  - **Property 18: Real-Time Event Broadcasting** (injury:logged event)
  - **Property 23: Injury Logging Side Effect** (fitness set to Red)
  - _Validates: Requirements 14.2, 14.3, 18.4_

- [ ] 24. Implement Leave Request Management backend
  - [ ] 24.1 Create leaveController.js
    - Implement submitRequest(playerId, data): create leave request with status 'Pending'
    - Implement approveRequest(requestId, coachId): update status, emit leave:approved event
    - Implement denyRequest(requestId, coachId): update status, emit leave:denied event
    - Implement getPlayerRequests(playerId): return player's leave history
    - Implement getPendingRequests(): return all pending requests for coach
    - Validate date range (endDate >= startDate)
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.7_
  
  - [ ] 24.2 Create leave request routes
    - POST /api/leave: requireRole(['player'])
    - GET /api/leave: authMiddleware (coach/admin see all, player sees own only)
    - PUT /api/leave/:id/approve: requireRole(['coach', 'admin']), loggerMiddleware
    - PUT /api/leave/:id/deny: requireRole(['coach', 'admin']), loggerMiddleware
    - _Requirements: 12.1, 12.3, 12.4_

- [ ]* 24.3 Write property tests for leave requests
  - **Property 14: Date Range Validation** (leave requests)
  - **Property 18: Real-Time Event Broadcasting** (leave:approved, leave:denied events)
  - **Property 21: Leave Request Status Initialization**
  - _Validates: Requirements 12.2, 12.3, 12.4, 12.7, 18.2, 18.3_

- [ ] 25. Build Coach Panel frontend components
  - [ ] 25.1 Create TacticalBoard component
    - Display formation selector (4-4-2, 4-3-3, 3-5-2)
    - Implement drag-and-drop interface using HTML5 Drag API
    - Display all players with current fitness status
    - Filter out players with Red fitness status from selection
    - Validate max 11 starters + 7 substitutes
    - Add "Save Lineup" button that assigns lineup to selected fixture
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_
  
  - [ ] 25.2 Create TrainingSchedule component
    - Display training sessions in calendar view
    - Add "Create Session" button that opens modal
    - Implement CreateSessionForm with date, drills, duration fields
    - Add attendance tracker with Present/Absent/Excused radio buttons
    - Show approved leave requests as "Excused" markers on calendar
    - _Requirements: 11.1, 11.2, 11.4_
  
  - [ ] 25.3 Create SquadHealth component
    - Display fitness status grid for all players (Green/Yellow/Red indicators)
    - Add "Update Fitness" button for each player
    - Implement InjuryLogger form with injury type, severity, expected recovery
    - Display active injuries list with recovery dates
    - Add "Mark Recovered" button for each injury
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 14.1, 14.4_
  
  - [ ] 25.4 Create DisciplinaryPanel component
    - Implement LogFineForm with player selector, offense, fine amount fields
    - Display action history table with player, offense, amount, date, payment status
    - Show only coach's logged actions
    - _Requirements: 15.1, 15.2_
  
  - [ ] 25.5 Create LeaveApproval component
    - Display pending leave requests table with player, dates, reason
    - Add "Approve" and "Deny" buttons for each request
    - Show confirmation dialog before approval/denial
    - Update UI after approval/denial
    - _Requirements: 12.3, 12.4_
  
  - [ ] 25.6 Create PerformanceTracking component
    - Display player stats form with goals, assists, appearances, rating fields
    - Validate rating is 0-10 range
    - Add private notes editor for coach observations
    - Show notes history with timestamps
    - _Requirements: 16.1, 16.3, 16.5_
  
  - [ ] 25.7 Integrate components into CoachPanel
    - Add tab navigation for Tactical Board, Training, Squad Health, Discipline, Leave Approval, Performance
    - Ensure all components use AuthContext for token
    - Handle 403 errors appropriately
    - _Requirements: 2.8_

- [ ]* 25.8 Write unit tests for Coach Panel components
  - Test TacticalBoard filters out Red fitness players
  - Test TacticalBoard validates lineup size (max 18)
  - Test SquadHealth displays fitness indicators
  - Test PerformanceTracking validates rating range
  - _Validates: Requirements 10.2, 10.6, 13.4, 16.5_

- [ ] 26. Checkpoint - Phase 4 Complete
  - Verify Coach can create lineups with drag-and-drop
  - Verify Red fitness players are excluded from lineup selection
  - Verify Coach can schedule training sessions
  - Verify Coach can log injuries (sets fitness to Red)
  - Verify Coach can approve/deny leave requests
  - Verify Coach can update player stats and add notes
  - Verify non-coach users cannot access coach-only routes
  - Ensure all tests pass, ask the user if questions arise.

### Phase 5: Player Panel (Depends on ALL previous phases)

This phase implements player-specific features. Requires all other panels to be functional for cross-panel data visibility.

- [ ] 27. Build Player Panel frontend components
  - [ ] 27.1 Create PlayerDashboard component
    - Display profile card with photo, name, position, contract details
    - Show fitness status indicator (Green/Yellow/Red) as read-only
    - Display performance stats (goals, assists, appearances, rating) as read-only
    - Show assigned equipment list
    - Display active injuries with recovery dates
    - Display pending fines with amounts
    - _Requirements: 13.5, 16.6, 17.1, 17.2_
  
  - [ ] 27.2 Create PlayerCalendar component
    - Display fixtures list with date, opponent, location
    - Display training sessions list with date, drills
    - Show approved leave requests as "Excused" markers
    - All data is read-only (no create/edit/delete)
    - _Requirements: 6.3, 11.4, 12.6_
  
  - [ ] 27.3 Create LeaveRequestForm component
    - Implement form with start date, end date, reason fields
    - Validate date range (endDate >= startDate)
    - Submit button calls POST /api/leave
    - Show submission success message
    - Display leave request history with status (Pending/Approved/Denied)
    - _Requirements: 12.1, 12.5, 12.7_
  
  - [ ] 27.4 Integrate components into PlayerPanel
    - Add tab navigation for Dashboard, Calendar, Leave Requests
    - Ensure player can only see their own data
    - Verify player cannot access other panels (403 errors)
    - _Requirements: 2.9, 17.3_

- [ ]* 27.5 Write unit tests for Player Panel components
  - Test PlayerDashboard displays read-only data
  - Test PlayerCalendar shows fixtures and training
  - Test LeaveRequestForm validates date range
  - Test player cannot access other user profiles
  - _Validates: Requirements 12.7, 17.1, 17.2, 17.3_

- [ ] 28. Checkpoint - Phase 5 Complete
  - Verify Player can view their own profile and stats (read-only)
  - Verify Player can see fixtures and training sessions
  - Verify Player can submit leave requests
  - Verify Player can see their equipment assignments
  - Verify Player cannot access admin/manager/coach routes (403 errors)
  - Verify Player cannot see other players' data
  - Ensure all tests pass, ask the user if questions arise.

### Phase 6: Socket.io Integration (After all panels exist)

This phase implements real-time updates across all panels. Requires all panels to be functional before events can propagate.

- [ ] 29. Set up Socket.io server with authentication
  - [ ] 29.1 Create socketServer.js
    - Initialize Socket.io server with CORS configuration
    - Implement authentication middleware for socket connections
    - Verify JWT token from socket.handshake.auth.token
    - Attach userId and userRole to socket instance
    - Handle connection and disconnection events
    - _Requirements: 18.8, 21.1_
  
  - [ ] 29.2 Export io instance for use in controllers
    - Make io instance available to all controllers
    - Ensure controllers can emit events via io.emit()
    - _Requirements: 18.1_

- [ ] 30. Implement all 8 real-time event emissions in controllers
  - [ ] 30.1 Add fixture:created event to fixtureController.createFixture()
    - Emit event with fixtureId, opponent, date, location
    - _Requirements: 6.2, 18.1_
  
  - [ ] 30.2 Add leave:approved event to leaveController.approveRequest()
    - Emit event with requestId, playerId
    - _Requirements: 12.3, 18.2_
  
  - [ ] 30.3 Add leave:denied event to leaveController.denyRequest()
    - Emit event with requestId, playerId
    - _Requirements: 12.4, 18.3_
  
  - [ ] 30.4 Add fine:issued event to disciplinaryController.logAction()
    - Emit event with actionId, playerId, amount, offense
    - _Requirements: 15.2, 18.4_
  
  - [ ] 30.5 Add injury:logged event to injuryController.logInjury()
    - Emit event with injuryId, playerId, injuryType, status
    - _Requirements: 14.3, 18.4_
  
  - [ ] 30.6 Add stats:updated event to profileController.updateStats()
    - Emit event with playerId, stats
    - _Requirements: 16.2, 18.5_
  
  - [ ] 30.7 Add inventory:assigned event to inventoryController.assignItem()
    - Emit event with itemId, playerId, itemName
    - _Requirements: 9.2, 18.6_
  
  - [ ] 30.8 Add settings:updated event to settingsController.updateSettings()
    - Emit event with clubName, logoUrl
    - _Requirements: 4.2, 18.7_

- [ ]* 30.9 Write property tests for real-time events
  - **Property 18: Real-Time Event Broadcasting** (all 8 events)
  - _Validates: Requirements 6.2, 9.2, 12.3, 12.4, 14.3, 15.2, 16.2, 18.1-18.7_

- [ ] 31. Create SocketContext and SocketProvider for frontend
  - [ ] 31.1 Implement SocketProvider component
    - Establish Socket.io connection with JWT authentication
    - Listen for all 8 real-time event types
    - Store events in state array with timestamps
    - Implement reconnection logic with exponential backoff (max 5 attempts)
    - Handle connect, disconnect, reconnect_attempt, reconnect_failed events
    - _Requirements: 18.8, 23.5_
  
  - [ ] 31.2 Create useSocket custom hook
    - Provide socket instance, connected status, events array
    - Expose reconnectAttempts count
    - _Requirements: 18.8_

- [ ]* 31.3 Write property tests for socket reconnection
  - **Property 36: Socket Reconnection with Exponential Backoff**
  - _Validates: Requirements 23.5_

- [ ] 32. Implement event listeners in all panel components
  - [ ] 32.1 Update FixtureCalendar to listen for fixture:created
    - Refetch fixtures when event received
    - Show toast notification "New fixture created"
    - _Requirements: 6.3, 18.1_
  
  - [ ] 32.2 Update PlayerDashboard to listen for player-specific events
    - Listen for fine:issued, injury:logged, stats:updated, inventory:assigned
    - Filter events by playerId === user.id
    - Show toast notifications for each event type
    - Refetch player data when events received
    - _Requirements: 9.3, 12.5, 14.5, 15.5, 16.6, 18.2-18.6_
  
  - [ ] 32.3 Update Navbar to listen for settings:updated
    - Refetch settings when event received
    - Update club name and logo without page refresh
    - _Requirements: 4.3, 18.7_
  
  - [ ] 32.4 Update LeaveRequestForm to listen for leave:approved and leave:denied
    - Filter events by playerId === user.id
    - Show toast notification with approval/denial status
    - Refetch leave requests to update status
    - _Requirements: 12.5, 18.2, 18.3_
  
  - [ ] 32.5 Update TrainingSchedule to listen for leave:approved
    - Show approved leave requests as "Excused" markers on calendar
    - _Requirements: 11.4, 18.2_

- [ ]* 32.6 Write unit tests for event listeners
  - Test FixtureCalendar refetches on fixture:created
  - Test PlayerDashboard filters events by playerId
  - Test Navbar updates on settings:updated
  - Test LeaveRequestForm shows notification on leave:approved
  - _Validates: Requirements 4.3, 6.3, 9.3, 12.5, 18.1-18.7_

- [ ] 33. Create NotificationCenter component
  - Display toast notifications for all Socket.io events
  - Auto-dismiss notifications after 5 seconds
  - Show notification history (last 10 events)
  - Style with Tailwind CSS for visibility
  - Position in top-right corner of screen
  - _Requirements: 18.8_

- [ ] 34. Checkpoint - Phase 6 Complete
  - Verify fixture:created event updates all panels in real-time
  - Verify leave:approved event shows notification to player
  - Verify fine:issued event updates player dashboard
  - Verify injury:logged event updates fitness status across panels
  - Verify stats:updated event refreshes player stats
  - Verify inventory:assigned event updates player equipment list
  - Verify settings:updated event refreshes Navbar without page reload
  - Verify socket reconnection works after disconnect
  - Ensure all tests pass, ask the user if questions arise.

### Phase 7: Final Security Audit and Validation

This phase validates all security requirements and ensures the system is production-ready.

- [ ] 35. Implement input validation and sanitization
  - [ ] 35.1 Add email format validation to all email inputs
    - Use validator library for RFC 5322 compliance
    - Apply to user creation, update, and login
    - _Requirements: 20.2, 21.5_
  
  - [ ] 35.2 Add text input sanitization across all controllers
    - Use sanitize-html library to strip HTML tags
    - Escape special characters to prevent XSS
    - Apply to all text fields (names, descriptions, reasons, notes)
    - _Requirements: 21.5_
  
  - [ ] 35.3 Add numeric range validation to all numeric inputs
    - Validate fine amounts (0-100000)
    - Validate ratings (0-10)
    - Validate weight (40-150), height (150-220)
    - Validate duration (30-300)
    - Return descriptive error messages
    - _Requirements: 20.4, 20.6_

- [ ]* 35.4 Write property tests for input validation
  - **Property 27: Email Format Validation**
  - **Property 28: Numeric Range Validation**
  - **Property 29: Validation Error Messages**
  - **Property 30: Input Sanitization**
  - _Validates: Requirements 20.2, 20.4, 20.6, 21.5, 22.5_

- [ ] 36. Implement rate limiting and security headers
  - [ ] 36.1 Add express-rate-limit middleware
    - Configure 100 requests per 15-minute window per IP
    - Apply to all /api/* routes
    - Return 429 status code when limit exceeded
    - _Requirements: 21.4_
  
  - [ ] 36.2 Add helmet middleware for security headers
    - Enable HTTPS enforcement in production
    - Set Content-Security-Policy headers
    - Enable XSS protection headers
    - _Requirements: 21.2, 21.3_
  
  - [ ] 36.3 Configure CORS with strict origin policy
    - Allow only CLIENT_URL from environment
    - Enable credentials for cookie/auth headers
    - _Requirements: 21.3_

- [ ]* 36.4 Write property tests for rate limiting
  - **Property 31: Rate Limiting Enforcement**
  - _Validates: Requirements 21.4_

- [ ] 37. Implement comprehensive error handling
  - [ ] 37.1 Create global error handler middleware
    - Handle Mongoose validation errors (400)
    - Handle JWT errors (401)
    - Handle Multer file upload errors (400)
    - Handle authorization errors (403)
    - Handle not found errors (404)
    - Handle server errors (500)
    - Return consistent error response format
    - Log errors with context (user, path, method, timestamp)
    - _Requirements: 23.1, 23.2, 23.4_
  
  - [ ] 37.2 Add database error handling with reconnection
    - Handle connection errors with retry logic
    - Handle disconnection events
    - Log reconnection attempts
    - _Requirements: 23.2_
  
  - [ ] 37.3 Add transaction rollback for atomic operations
    - Use Mongoose sessions for user deletion (User + Profile)
    - Use sessions for injury logging (Injury + Profile fitness update)
    - Rollback on any error
    - _Requirements: 23.2_

- [ ]* 37.4 Write property tests for error handling
  - **Property 34: HTTP Status Code Correctness**
  - _Validates: Requirements 23.1, 23.4_

- [ ] 38. Verify all authorization rules
  - [ ] 38.1 Test Admin access to all routes
    - Verify Admin can access /api/users, /api/settings, /api/logs
    - Verify Admin can access all other routes
    - _Requirements: 2.6_
  
  - [ ] 38.2 Test Manager access restrictions
    - Verify Manager can access /api/fixtures, /api/documents, /api/inventory
    - Verify Manager cannot access /api/users, /api/settings, /api/logs
    - Verify Manager cannot approve leave requests
    - _Requirements: 2.7_
  
  - [ ] 38.3 Test Coach access restrictions
    - Verify Coach can access /api/training, /api/injuries, /api/disciplinary, /api/leave (approve)
    - Verify Coach cannot access /api/users, /api/settings, /api/documents
    - _Requirements: 2.8_
  
  - [ ] 38.4 Test Player access restrictions
    - Verify Player can only access /api/leave (submit), /api/profiles/:ownId
    - Verify Player cannot access any admin/manager/coach routes
    - Verify Player cannot see other players' profiles
    - _Requirements: 2.9, 17.3_

- [ ]* 38.5 Write property tests for authorization matrix
  - **Property 4: Role-Based Route Authorization** (comprehensive test)
  - _Validates: Requirements 2.2-2.9, 6.6, 16.4, 17.4_

- [ ] 39. Implement performance optimizations
  - [ ] 39.1 Add pagination to all list endpoints
    - Enforce max 50 items per page
    - Support page and limit query parameters
    - Return total count for pagination UI
    - _Requirements: 24.1_
  
  - [ ] 39.2 Add database indexes for query optimization
    - Verify indexes on User.email, User.role
    - Verify indexes on Profile.userId, Profile.fitnessStatus, Profile.contractEnd
    - Verify indexes on Fixture.date, TrainingSession.date
    - Verify indexes on SystemLog.timestamp (descending)
    - _Requirements: 24.2_
  
  - [ ] 39.3 Add response compression middleware
    - Use compression middleware for responses > 1KB
    - Apply gzip compression
    - _Requirements: 24.4_
  
  - [ ] 39.4 Optimize image uploads with sharp
    - Resize logos to max 1920px width
    - Maintain aspect ratio
    - Compress with 90% quality
    - _Requirements: 24.5_

- [ ]* 39.5 Write property tests for performance features
  - **Property 37: Pagination Limit Enforcement**
  - **Property 38: Response Compression**
  - **Property 39: Image Optimization**
  - _Validates: Requirements 24.1, 24.4, 24.5_

- [ ] 40. Implement backup and recovery procedures
  - [ ] 40.1 Create backup script for MongoDB
    - Use mongodump to create database backups
    - Schedule daily backups via cron job
    - Store backups with timestamp in filename
    - Retain last 7 days of backups
    - _Requirements: 25.1, 25.2_
  
  - [ ] 40.2 Create restore script for MongoDB
    - Use mongorestore to restore from backup
    - Verify backup integrity before restore
    - Log restore operations
    - _Requirements: 25.3_
  
  - [ ] 40.3 Add backup verification and alerting
    - Verify backup integrity after creation
    - Send email alert to admins on backup failure
    - Log all backup operations to SystemLog
    - _Requirements: 25.4, 25.5_

- [ ]* 40.4 Write property tests for backup procedures
  - **Property 40: Backup Integrity Verification**
  - **Property 41: Backup Failure Notification**
  - _Validates: Requirements 25.4, 25.5_

- [ ] 41. Create deployment documentation
  - Document environment variables required (.env.example)
  - Document database setup and seeding process
  - Document backup and restore procedures
  - Document API endpoints and authorization matrix
  - Document Socket.io event types and payloads
  - _Requirements: 19.1, 19.2, 19.3_

- [ ] 42. Final Checkpoint - Phase 7 Complete
  - Verify all 41 correctness properties are testable
  - Verify all authorization rules are enforced
  - Verify input validation and sanitization work correctly
  - Verify rate limiting blocks excessive requests
  - Verify error handling returns appropriate status codes
  - Verify pagination limits are enforced
  - Verify backup and restore procedures work
  - Run full test suite (unit tests + property tests)
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at the end of each phase
- Property tests validate universal correctness properties using fast-check (100+ iterations)
- Unit tests validate specific examples and edge cases
- All 41 correctness properties from the design document are covered by property test tasks
- Phase dependencies are strictly enforced - do not skip ahead
