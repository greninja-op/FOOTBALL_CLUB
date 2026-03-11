
# ⚽ Football Club Management System — Agentic Execution Prompt

---

## YOUR ROLE & OPERATING RULES

You are a senior full-stack engineer tasked with building a **production-grade, role-based Football Club Management Web Application** from scratch. You will build this system phase by phase, in strict dependency order. You must not skip phases or build out of sequence — later features are architecturally dependent on earlier ones.

**Before writing any code for a phase, state:**

1. What you are about to build
2. Which files you will create or modify
3. What the expected output/result is

**After completing each phase, confirm:**

- All files created and their paths
- Any environment variables added
- The API endpoints now available
- What the next phase unlocks

---

## TECH STACK (NON-NEGOTIABLE)

|Layer|Technology|
|---|---|
|Frontend|React 18 + React Router v6 + Tailwind CSS|
|Backend|Node.js + Express.js|
|Database|MongoDB (via Mongoose ODM)|
|Auth|JSON Web Tokens (JWT) + bcrypt|
|File Storage|Multer (local) or Cloudinary (for documents/images)|
|Real-time|Socket.io (for push notifications and live dashboard updates)|
|State Management|React Context API (global auth/settings state)|

**Project Structure to scaffold first:**

```
/client          → React frontend (Vite)
/server          → Express backend
/server/models   → Mongoose schemas
/server/routes   → Express route files
/server/middleware → Auth, logging, role-guard middleware
/server/controllers → Business logic
.env             → All secrets (NEVER hardcode)
```

---

## MONGODB SCHEMAS (Build these first, before any routes)

Define and export all Mongoose models before any route or controller references them. Here are the required collections and their minimum fields:

### `Users`

```js
{ email, passwordHash, role: enum['admin','manager','coach','player'], createdAt }
```

### `Profiles`

```js
{ userId (ref: Users), fullName, photo, position, weight, height,
  contractType: enum['Owned','On Loan'], contractStart, contractEnd,
  fitnessStatus: enum['Fit','Injured','Suspended'],
  stats: { goals, assists, cards, minutesPlayed, offsides },
  performanceNotes: [{ date, note, coachId }] }
```

### `Fixtures`

```js
{ opponent, date, location, matchType, createdBy (ref: Users), lineup: [userId] }
```

### `TrainingSessions`

```js
{ date, drillDescription, attendees: [userId], createdBy (ref: Users) }
```

### `Injuries`

```js
{ playerId (ref: Users), description, dateLogged, loggedBy (ref: Users), resolved: Boolean }
```

### `DisciplinaryActions`

```js
{ playerId (ref: Users), offense, fineAmount, dateIssued, issuedBy (ref: Users), isPaid: Boolean }
```

### `LeaveRequests`

```js
{ playerId (ref: Users), dateRequested, reason, status: enum['Pending','Approved','Denied'],
  reviewedBy (ref: Users), reviewedAt }
```

### `Inventory`

```js
{ itemName, itemType, assignedTo (ref: Users), assignedAt, returnedAt }
```

### `Settings`

```js
{ clubName, logoUrl, updatedAt }
```

### `SystemLogs`

```js
{ action, performedBy (ref: Users), targetCollection, targetId, timestamp }
```

---

## MIDDLEWARE TO BUILD (in /server/middleware)

### 1. `authMiddleware.js`

- Reads the `Authorization: Bearer <token>` header on every protected route
- Verifies the JWT, attaches `req.user = { id, role }` to the request
- Returns 401 if token is missing or invalid

### 2. `roleGuard.js`

- A factory function: `requireRole('admin')` or `requireRole(['manager','admin'])`
- Returns 403 Forbidden if `req.user.role` does not match
- Use this on EVERY protected route. No exceptions.

### 3. `loggerMiddleware.js`

- Intercepts POST, PUT, PATCH, DELETE requests that hit the database
- Writes a new `SystemLog` document after every successful DB write
- Log format: `{ action: "Coach updated fixture", performedBy: userId, targetCollection: "Fixtures", targetId, timestamp: Date.now() }`

---

## PHASE 1 — GLOBAL ARCHITECTURE & AUTH

**Goal:** Establish the secure foundation that every other feature depends on.

### Backend Tasks:

1. Initialize Express app with CORS, JSON body parser, and dotenv
2. Connect to MongoDB using Mongoose (`MONGO_URI` from `.env`)
3. Create all 10 Mongoose schemas listed above
4. Build `POST /api/auth/login`:
    - Accepts `{ email, password }`
    - Compares password with bcrypt hash
    - Returns a signed JWT containing `{ id, role, email }`
    - JWT secret stored in `.env` as `JWT_SECRET`
5. Build `POST /api/auth/register` (Admin-only, for seeding initial accounts):
    - Hashes password with bcrypt before saving
    - Assigns role from request body
6. Seed script: Create one account for each role (admin, manager, coach, player) for testing

### Frontend Tasks:

1. Scaffold React app with Vite + Tailwind CSS
2. Build a clean Login Page (`/login`) with email + password form
3. On successful login, decode the JWT (using `jwt-decode`) and store it in React Context
4. Implement **role-based routing**:
    - `role === 'admin'` → redirect to `/admin/users`
    - `role === 'manager'` → redirect to `/manager/finance`
    - `role === 'coach'` → redirect to `/coach/tactical`
    - `role === 'player'` → redirect to `/player/status`
5. Build a `<ProtectedRoute>` component that reads role from Context and blocks unauthorized URL access
6. Build a shared `<NavBar>` component that only renders nav links appropriate for the current role

**✅ Phase 1 is complete when:** Any of the 4 seeded users can log in and land on their correct, role-locked panel.

---

## PHASE 2 — ADMIN PANEL

**Depends on:** Phase 1 JWT + role middleware

### Page 1: User Management (`/admin/users`)

**Backend:**

- `GET /api/users` — returns all users (admin only)
- `POST /api/users` — creates new user with hashed password and assigned role
- `PUT /api/users/:id` — updates role or email
- `DELETE /api/users/:id` — soft-deletes or removes user

All routes protected by `requireRole('admin')`.

**Frontend:**

- A sortable data table listing all users (name, email, role, created date)
- A "New User" modal form with inputs: name, email, password, role dropdown
- An inline role dropdown per row that fires a PUT request on change
- A delete button with a confirmation dialog

### Page 2: Site Settings (`/admin/settings`)

**Backend:**

- `GET /api/settings` — returns current Settings document
- `PUT /api/settings` — updates clubName and/or logoUrl (admin only)
- Use Multer to handle logo image upload; store path or Cloudinary URL

**Frontend:**

- A form with a text input for club name and a file uploader for logo
- On save, dispatch updated settings to **global React Context** so the NavBar logo updates instantly across all panels without a page refresh

### Page 3: System Logs (`/admin/logs`)

**Backend:**

- `GET /api/logs` — returns all SystemLog documents, sorted by timestamp descending

**Frontend:**

- A read-only, terminal-style dark UI panel
- Each log entry shows: timestamp, action description, performed by (user name), target
- Auto-scrolls to bottom. Add a "Clear View" button (frontend only, does not delete DB records)

**✅ Phase 2 is complete when:** Admin can create users, change roles, update branding (with live NavBar update), and see a live audit trail.

---

## PHASE 3 — MANAGER PANEL

**Depends on:** Phase 1 auth, Phase 2 user accounts existing

### Page 1: Finance & Contracts (`/manager/finance`)

**Backend:**

- `GET /api/profiles` — returns all player profiles (manager + admin only)
- `GET /api/disciplinary/fines` — returns all unpaid DisciplinaryAction records

**Frontend:**

- A card/table view of all players showing: name, photo, contractType (Owned/On Loan), contractEnd date
- Compute and display a **"Days Left"** countdown badge: `Math.ceil((contractEnd - Date.now()) / 86400000)`
- Color coding: Green (>90 days), Amber (30–90 days), Red (<30 days)
- A separate "Pending Fines" section showing fine amounts from DisciplinaryActions — these are read-only here; the Coach creates them

### Page 2: Documents Vault (`/manager/documents`)

**Backend:**

- `POST /api/documents/upload` — Multer-powered upload, saves file path linked to a `userId`
- `GET /api/documents/:userId` — returns all documents for a player

**Frontend:**

- A player selector dropdown
- A file upload area (accepts PDF and images)
- A grid preview of uploaded files with thumbnails for images and PDF icons for PDFs
- Click to open in a new tab

### Page 3: Schedule Matches (`/manager/fixtures`)

**Backend:**

- `GET /api/fixtures` — all fixtures
- `POST /api/fixtures` — create fixture (manager only)
- `PUT /api/fixtures/:id` — edit fixture
- `DELETE /api/fixtures/:id` — cancel fixture

**Frontend:**

- An interactive calendar (use `react-big-calendar` or `react-calendar`)
- Click a date to open a modal: inputs for opponent, location, matchType
- On save, emit a Socket.io event `fixture:created` — this is what updates the Player panel in real-time

**⚡ Cross-panel dependency:** Creating a fixture here must:

1. Appear in the Player's schedule calendar automatically
2. Generate a blank lineup entry in the Coach's Tactical Board

### Page 4: Inventory (`/manager/inventory`)

**Backend:**

- `GET /api/inventory` — all items
- `POST /api/inventory` — add new item
- `PUT /api/inventory/:id` — assign to a player (set `assignedTo`, `assignedAt`)
- `PUT /api/inventory/:id/return` — mark item as returned

**Frontend:**

- A table of all inventory items with status (Assigned / Available)
- An "Assign" button that opens a player selector dropdown
- Assigned items must appear on the specific player's dashboard (Player Panel, Phase 5)

**✅ Phase 3 is complete when:** Manager can see all contracts with live countdowns, upload documents per player, create fixtures that propagate to other panels, and manage gear assignment.

---

## PHASE 4 — COACH PANEL

**Depends on:** Phase 1 auth, Phase 3 fixtures existing

### Page 1: Tactical Board (`/coach/tactical`)

**Backend:**

- `GET /api/fixtures/upcoming` — fixtures with no lineup yet
- `PUT /api/fixtures/:id/lineup` — saves the array of player userIds as the lineup

**Frontend:**

- A **drag-and-drop football pitch UI** (use `react-dnd` or `@dnd-kit/core`)
- Left sidebar: list of all players as draggable avatar cards
- Right: SVG or CSS football pitch with position slots
- Players with `fitnessStatus: 'Injured'` or `'Suspended'` are **grayed out and non-draggable**
- A "Save Lineup" button that PUTs the lineup to the selected fixture

### Page 2: Training Management (`/coach/training`)

**Backend:**

- `GET /api/training` — all training sessions
- `POST /api/training` — create session with drill description and date
- `GET /api/leave-requests?status=Pending` — pending leave requests
- `PUT /api/leave-requests/:id` — approve or deny (sets status, reviewedBy, reviewedAt)

**Frontend:**

- A weekly view calendar of training sessions
- A form to add a new drill session
- An "Inbox" section showing pending LeaveRequests with Approve / Deny buttons

**⚡ Cross-panel dependency:** Approving a leave request must:

1. Remove the player from that day's attendance checklist
2. Emit Socket.io event `leave:approved` → Player's dashboard updates to show "Excused"

### Page 3: Squad Health & Discipline (`/coach/health`)

**Backend:**

- `PUT /api/profiles/:id/fitness` — updates fitnessStatus field
- `POST /api/disciplinary` — logs a new DisciplinaryAction with fineAmount
- `POST /api/injuries` — logs a new Injury record

**Frontend:**

- A player selector with current fitnessStatus shown
- Buttons to set status: Fit / Injured / Suspended
- A "Log Discipline" form: offense description, fine amount
- On submitting a fine: emit Socket.io event `fine:issued` → Player receives push notification

**⚡ Cross-panel dependency:**

- Marking a player Injured: their dashboard status indicator turns **Red**
- Logging a fine: amount appears on **Manager's Finance page** as pending revenue

### Page 4: Player Stats & Ratings (`/coach/stats`)

**Backend:**

- `PUT /api/profiles/:id/stats` — updates the stats sub-document (goals, assists, cards, minutes, offsides)
- `POST /api/profiles/:id/notes` — appends a performance review note

**Frontend:**

- A player selector dropdown
- Stat input fields: Goals, Assists, Yellow Cards, Red Cards, Minutes Played, Offsides
- A private text area for the 1-on-1 performance review note (only Coach and Manager can read this)
- On save, the stats immediately update on that Player's personal dashboard (via Socket.io or re-fetch)

**✅ Phase 4 is complete when:** Coach can set lineups with fitness-aware player filtering, manage training with leave approvals, log injuries/fines that trigger cross-panel updates, and update player stats.

---

## PHASE 5 — PLAYER PANEL

**Depends on:** All previous phases (Player is a consumer of all data produced above)

### Page 1: Player Status Dashboard (`/player/status`)

**Backend:**

- `GET /api/profiles/me` — returns ONLY the logged-in player's Profile document (enforced by JWT `id`)

**Frontend:**

- Mobile-first, responsive layout
- **Hero section:** Player photo, full name, position, fitnessStatus indicator (Green = Fit, Red = Injured, Orange = Suspended)
- **Physical stats row:** Height, Weight
- **Bento-box stats grid:** Goals | Assists | Cards | Minutes Played | Offsides — each in its own card
- **"My Equipment" section:** fetches `GET /api/inventory?assignedTo=me` and lists gear
- **THIS PAGE IS READ-ONLY.** No edit controls exist here.
- Listen for Socket.io events to update fitnessStatus and stats in real-time without page refresh

### Page 2: Schedule & Leave (`/player/schedule`)

**Backend:**

- `GET /api/fixtures` — all upcoming fixtures
- `GET /api/training` — all training sessions
- `POST /api/leave-requests` — submit a new leave request
- `GET /api/leave-requests?playerId=me` — player's own leave request history

**Frontend:**

- A unified calendar showing both Fixtures (match days) and Training Sessions with different color coding
- A "Request Leave" form: date picker + reason text area
- A "My Requests" table showing status of submitted leave requests (Pending / Approved / Denied)
- If denied, the calendar reverts that day back to "Mandatory Training" label

**✅ Phase 5 is complete when:** A player logging in sees only their own data, cannot access any other panel, and can submit leave requests that ping the coach.

---

## REAL-TIME EVENTS REFERENCE (Socket.io)

Set up a Socket.io server alongside Express. All events below must be implemented:

|Event Name|Emitted By|Received By|Effect|
|---|---|---|---|
|`fixture:created`|Manager|Players, Coaches|New fixture appears on calendars|
|`leave:approved`|Coach|Player|Player dashboard shows "Excused"|
|`leave:denied`|Coach|Player|Player calendar reverts to Mandatory|
|`fine:issued`|Coach|Player|Push notification alert|
|`injury:logged`|Coach|Player|Status indicator turns Red|
|`stats:updated`|Coach|Player|Bento-box stats refresh|
|`inventory:assigned`|Manager|Player|"My Equipment" list updates|
|`settings:updated`|Admin|All roles|NavBar logo/name refreshes|

---

## SECURITY RULES (ENFORCE ON EVERY ROUTE)

- Every non-auth route must pass through `authMiddleware`
- Every sensitive route must pass through `requireRole()`
- Players can NEVER call PUT/POST/DELETE on their own Profile, Stats, or Fixtures
- A Coach cannot access `/api/users` or `/api/settings`
- A Manager cannot approve leave requests (Coach-only action)
- All passwords stored as bcrypt hashes — never plain text, never returned in API responses
- JWT expiry: 8 hours. Expired tokens must force re-login.

---

## EXECUTION ORDER (STRICT)

```
1. Scaffold /server and /client folder structure
2. Set up MongoDB connection + all 10 Mongoose models
3. Build authMiddleware + roleGuard + loggerMiddleware
4. Build Auth routes (login, register, seed)
5. Build React login + ProtectedRoute + role redirect
6. Build Admin Panel (users, settings, logs)
7. Build Manager Panel (finance, documents, fixtures, inventory)
8. Build Coach Panel (tactical, training, health, stats)
9. Build Player Panel (status, schedule)
10. Integrate Socket.io events across all panels
11. Final security audit — verify every route has correct role guard
```

Do not proceed to step N+1 until step N is fully functional and tested.

---

## DEFINITION OF DONE

The system is complete when:

- [ ] All 4 roles can log in and are locked to their own panel
- [ ] A fixture created by Manager appears on Player and Coach panels
- [ ] An injury logged by Coach turns the Player's status Red in real-time
- [ ] A fine logged by Coach appears on Manager's Finance page
- [ ] A leave request approved by Coach shows "Excused" on Player's calendar
- [ ] Admin can change the logo and it updates live in all panels
- [ ] System Logs capture every write action with user attribution
- [ ] No player can access any URL outside `/player/*`