# things that need to be fixed currently or checked 

### 1. Database & Backend Foundation (Node.js, Express, MongoDB Compass)

Before the UI can display real information, the backend engine needs to be running.

- **Authentication & Security:** Build the login system that issues JSON Web Tokens (JWT) to strictly enforce Role-Based Access Control so a Player cannot accidentally access Manager routes.
    
- **Schema Creation:** Set up the exact collections in MongoDB Compass: `Users`, `Profiles`, `Fixtures`, `TrainingSessions`, `Injuries`, `DisciplinaryActions`, `LeaveRequests`, and `Inventory`.
    
- **API Routing:** Write the Express REST API endpoints (GET, POST, PUT, DELETE) that the frontend will call to fetch and update data.
    

### 2. The Admin Module Integration

The UI layout is looking good, but it needs to be wired up to the database.

- **User Management Data Grid:** Connect the table to the database so you can actually create new users and use the dropdown to promote a Player to a Coach.
    
- **System Logs Dashboard:** Implement the backend middleware that tracks database changes and displays them chronologically in the Admin terminal view.
    

### 3. The Manager Module Build

This section needs high-density data visualization components.

- **Contract Countdown UI:** Build the progress bars that calculate the days left on a player's contract based on the database end date.
    
- **Document Vault:** Implement the file upload/preview grid for medical documents and staff IDs.
    
- **Fixture Scheduler:** Build the interactive React calendar for adding upcoming matches and opponents.
    

### 4. The Coach Module Build (The Heaviest UI Lift)

This module contains the most complex interactive elements.

- **Drag-and-Drop Tactical Pitch:** Use a library like `dnd-kit` to build the interactive football pitch where player avatars can be dragged into a Starting XI formation.
    
- **Discipline & Injury Forms:** Build the specific input forms to change a player's fitness status or issue internal fines.
    
- **Post-Match Ratings:** Create the input panel for raw stats (goals, minutes, cards) and private 1-on-1 feedback notes.
    

### 5. The Player Module Build

This needs to be the mobile-first, sleekest part of the app.

- **Bento Box Statistics Dashboard:** Build the read-only grid layout displaying the player's personal stats and current fitness status.
    
- **Leave Request System:** Implement the calendar form for players to request days off, which routes directly to the Coach's alert inbox.
    

### 6. The "Chain Reaction" Integrations

The final, most crucial step is making the modules talk to each other.

- Ensure that when a Coach marks a player "Injured," that player instantly becomes un-draggable on the Tactical Pitch and flags the Manager's contract dashboard.
    
- Ensure that equipment assigned by the Manager instantly populates the Player's personal inventory tab.


# Here are the missing UI components you should add to the project plan to make it top-tier (make sure about that if there are some elements that are already implimented pls ignore that so in order to do that pls scan the ui elements deeply before exicution):

### 1. The Global Command Palette (Cmd + K)

In modern web apps (like Vercel, Linear, or Stripe), users don't like clicking through five menus to find something.

- **The UI:** A hidden search bar that pops up in the center of the screen when the user presses `Ctrl+K` (or `Cmd+K` on Mac).
    
- **The Function:** It acts as a universal shortcut menu.
    
    - An Admin can type "Edit Messi" and jump straight to that user's profile.
        
    - A Manager can type "Contracts" to instantly navigate to the finance page.
        
- **How to build it:** Use the incredibly popular open-source React library called `cmdk`. It gives you that premium, instant-search feel with zero backend changes.
    

### 2. The Global Notification Drawer

We mentioned WebSockets for alerts (like a Coach issuing a fine), but we didn't design the UI for where those alerts live if the user is offline or looking away.

- **The UI:** A bell icon in the top right navbar with a red notification dot. Clicking it slides out a side-panel (a "Drawer" or "Sheet" component in Shadcn UI).
    
- **The Function:** It acts as an inbox for the app's chain-reaction events.
    
    - A Coach sees: _"Leave Request from [Player]"_
        
    - A Player sees: _"You have been fined $50 for late attendance"_ or _"Match time updated to 6:00 PM."_
        
- **Why it's needed:** Without this, users might miss critical updates unless they manually check every page.
    

### 3. Beautiful "Empty States" & Loading Skeletons

This is the number one thing developers forget, and it ruins the UX if ignored. What does the UI look like when there is no data?

- **The UI (Skeletons):** When the Manager clicks "Documents," instead of a frozen screen or a spinning circle, show gray, pulsing placeholder boxes (Skeleton loaders) while the images fetch from the database.
    
- **The UI (Empty States):** If a Coach has no players injured, the "Squad Health" page shouldn't just be a blank white screen. It needs an illustration (like a healthy heart icon) and text saying _"All players are fully fit!"_
    
- **Why it's needed:** It prevents the user from thinking the app is broken when the database is just empty or loading.
    

### 4. Data Export & "Print View" Modals

A football club operates in the physical world, meaning digital data often needs to become paper.

- **The UI:** An "Export" dropdown button on high-density data tables (Manager's Finance, Admin's Logs) and a "Print Layout" for the Coach's Tactical Pitch.
    
- **The Function:** * Uses a library like `react-to-print` or `jspdf`.
    
    - The Coach builds the starting XI on the app, clicks "Print," and it generates a clean, black-and-white PDF version of the pitch that they can physically tape to the locker room wall.
        
    - The Manager exports the "Player Contracts" table to a CSV file for their accountants.
        

### 5. Personal User Settings Modal (The "My Account" Dropdown)

We built an Admin panel to manage _other_ users, but individuals need a UI to manage themselves.

- **The UI:** Clicking their profile picture in the top right opens a small modal window.
    
- **The Function:** * **Theme Toggle:** Switch the app between Light Mode, Dark Mode, or System Default. (Tailwind makes this very easy).
    
    - **Change Password:** A secure form to update their own credentials.
        
    - **Avatar Upload:** Let players upload their own profile picture rather than making the Admin do it.

# solution for the above problems (make sure about that if there are some elements that are already implimented pls ignore that so in order to do that pls scan the ui elements deeply before exicution):

## phase 2
 ###  Prompt 1: Frontend API Client & Auth State (The Bridge)

_Use this prompt to connect your React app to the backend you just built, securely managing the user's login token._



> "We need to connect our React frontend to our Express backend. Please do the following:
> 
> 1. Install `axios` and `zustand` (or set up React Context) for global state management.
>     
> 2. Create an `api.js` (or `axiosInstance`) file configured to point to `http://localhost:5000/api`. It must include an interceptor that automatically attaches the JWT token from `localStorage` to the `Authorization` header of every request.
>     
> 3. Create a global Authentication State that stores the `user` object (containing their ID and role: admin, manager, coach, or player) and an `isAuthenticated` boolean.
>     
> 4. Create a protected route wrapper component that checks this state and redirects unauthorized users back to the login page."
>     

---

### Prompt 2: The Global Command Palette (UI Polish)

_Use this prompt to add the modern `Cmd+K` search bar we discussed earlier, elevating the UX without touching the database yet._



> "I want to implement a Global Command Palette for the application.
> 
> 1. Install the `cmdk` React library (or use the Shadcn UI Command component if available in the project).
>     
> 2. Create a `<CommandMenu />` component that opens a centered modal search bar when the user presses `Ctrl+K` (or `Cmd+K` on Mac).
>     
> 3. Populate this menu with static quick-action links based on roles (e.g., 'Go to Dashboard', 'Settings', 'Logout').
>     
> 4. Ensure the styling matches the dark, premium aesthetic of the project (dark background, subtle borders) and does not interfere with the existing animated background layout. Make sure it is accessible from anywhere in the app."
>     

---

### Prompt 3: Wiring the Admin User Management Table

_Use this prompt to make the Admin panel functional by hooking it up to the MongoDB database._



> "Let's make the Admin 'User Management' panel fully functional by connecting it to the backend.
> 
> 1. In the React component for the Admin User Management page, write a `useEffect` hook that uses our Axios instance to `GET /api/users` and store the data in local state.
>     
> 2. Update the existing UI data table to map over this fetched user data instead of hardcoded mock data.
>     
> 3. Build the 'Create User' form modal. When submitted, it should make a `POST /api/users` request with the new user's details and role, then automatically refresh the table data.
>     
> 4. Add a 'Delete' button to each row in the table that triggers a `DELETE /api/users/:id` request. Ensure there is a confirmation prompt before deleting."

## phase 3
### Prompt 4: Manager's Contract & Finance Dashboard

_This will build the UI that automatically calculates how many days are left on player contracts._



> "Let's build the Manager's 'Finance & Contracts' page.
> 
> 1. Create a React component for the Manager panel that fetches user data, specifically filtering for users with the 'player' role, and their associated profile data.
>     
> 2. Build a data grid or list UI to display these players.
>     
> 3. Write a JavaScript utility function that takes the `contract.endDate` from the database, compares it to today's date, and calculates the exact number of 'Days Left'.
>     
> 4. Display this 'Days Left' metric using a visual progress bar next to each player. Add a color-coded badge indicating if their contract type is 'Owned' or 'On Loan'.
>     
> 5. Ensure the styling strictly adheres to the project's existing dark theme and modern aesthetic."
>     

---

### Prompt 5: Manager's Fixture Scheduler

_This will build the interactive calendar/list where the manager plans the matches._



> "Now, build the Manager's 'Schedule Matches' page.
> 
> 1. Set up the backend CRUD routes (`GET`, `POST`, `PUT`, `DELETE`) in Express for the `Fixtures` schema we created earlier.
>     
> 2. Create a React component with a clean, modern UI to display upcoming matches in chronological order.
>     
> 3. Build a slide-out drawer or modal form to add a new fixture (inputs: Opponent, Date/Time, Location) that triggers the `POST` route.
>     
> 4. Add 'Edit' and 'Delete' action buttons to each existing fixture card, wiring them up to the respective API endpoints. Ensure the UI automatically refreshes the fixture list when a change is made."
>     

---

### Prompt 6: Logistics & Digital Gear Checkout

_This will build the inventory system to assign gear to players._



> "Next, build the Manager's 'Logistics & Inventory' page.
> 
> 1. Create an `Inventory` schema in Mongoose (fields: `itemName`, `serialNumber`, `assignedToPlayerId`, `status`) and the corresponding Express routes.
>     
> 2. Build a React UI with two main tabs: 'Stock Room' and 'Allocations'.
>     
> 3. Under 'Stock Room', add a form to register new club gear (like Training Kits or GPS Vests).
>     
> 4. Under 'Allocations', build an interface with a dropdown to select a specific Player and assign an available inventory item to them. Display a real-time table of all checked-out gear and the name of the player who currently holds it."

---
## phase 4
### Prompt 7: The Drag-and-Drop Tactical Pitch

_This will build the visual football pitch where the Coach plans the starting formation._



> "Let's build the Coach's 'Tactical Board' page.
> 
> 1. Install a modern drag-and-drop library like `@dnd-kit/core` and `@dnd-kit/sortable` (or use `framer-motion` if preferred).
>     
> 2. Build a React UI with two main sections: a 'Bench' sidebar containing player avatar cards, and a 'Pitch' area styled like a top-down football field.
>     
> 3. Fetch the players from the backend. **Crucial:** Filter the 'Bench' list so that any player with a `fitnessStatus` of 'Injured' or 'Suspended' is grayed out and cannot be dragged.
>     
> 4. Implement the drag-and-drop logic allowing the coach to drag 11 fit players onto the Pitch to set a formation.
>     
> 5. Add a 'Save Formation' button that sends an array of the selected `playerId`s and their X/Y pitch coordinates to the backend (you will need to create a `POST /api/tactics` Express route for this)."
>     

---

### Prompt 8: Squad Health & Disciplinary Actions

_This builds the control center for injuries and fines, which triggers chain reactions across the app._



> "Next, build the Coach's 'Squad Health & Discipline' page.
> 
> 1. Create a data table in React listing all active players.
>     
> 2. **Health Tracker:** Add a dropdown menu to each row to update a player's `fitnessStatus` (Fit, Injured, Suspended). When changed, make a `PUT` request to update the database. Use high-contrast color-coded tags for these statuses (Green/Red/Yellow).
>     
> 3. **Discipline Form:** Add an 'Issue Fine' button to each row. Clicking this should open a modal to input an `offenseType` (e.g., Late to Training) and a `fineAmount`.
>     
> 4. Submitting this modal should make a `POST` request to the `DisciplinaryActions` collection we created earlier.
>     
> 5. Ensure the UI feels highly responsive by refetching the player list immediately after a status update."
>     

---

### Prompt 9: Post-Match Ratings & Statistics Input

_This allows the coach to update the live stats that the players will see on their personal dashboards._



> "Finally, build the Coach's 'Post-Match Ratings' page.
> 
> 1. Create an interface displaying the roster of players.
>     
> 2. For each player, provide a quick-input row or expanding accordion to increment their raw statistics (Goals, Assists, Minutes Played, Yellow/Red Cards).
>     
> 3. Add a slider component (1-10) for 'Coach's Match Rating' and a text area for 'Private Feedback'.
>     
> 4. Create a `PUT` Express route to handle this data, updating the `statistics` object inside the player's `Profile` document.
>     
> 5. Ensure the styling remains consistent with our premium dark theme, utilizing Shadcn UI components (like Sliders, Textareas, and Accordions) if they are configured in the project."

## phase 5
### Prompt 10: The Mobile-First Player Dashboard

_This builds the home screen for the player, displaying their personal stats and health status._



> "Let's build the Player's 'Status & Profile' dashboard.
> 
> 1. Create a `GET /api/my-profile` Express route that uses the ID from the logged-in user's JWT to fetch only their specific document from the `Profile` collection (including their nested `statistics` and `fitnessStatus`).
>     
> 2. Build a React component tailored for mobile viewing (use Tailwind's responsive classes like `max-w-md mx-auto` or a mobile-app layout).
>     
> 3. Create a 'Hero Profile Header' component displaying the player's photo, name, position, and a color-coded status badge (e.g., Green for Fit, Red for Injured).
>     
> 4. Below the header, build a 'Bento Box' grid layout displaying their live statistics (Goals, Assists, Minutes, Cards). Make these metric cards visually punchy with large numbers and subtle borders."
>     

---

### Prompt 11: Logistics & Schedule View

_This builds the calendar view where players see when they need to show up._



> "Next, build the Player's 'Schedule & Logistics' page.
> 
> 1. Create a React component that fetches both upcoming `Fixtures` and `TrainingSessions` from the backend API.
>     
> 2. Display these events in a unified, vertically scrolling timeline or list UI.
>     
> 3. Use visual indicators (like icons or small colored dots) to distinguish between a Match Day and a Training Session.
>     
> 4. Under a separate tab or section called 'My Gear', fetch and display the items from the `Inventory` collection that are currently assigned to this specific user's ID."
>     

---

### Prompt 12: Leave Request System (Bi-Directional Workflow)

_This allows the player to request time off, which will ping the Coach's dashboard._



> "Finally, let's build the 'Leave Request' system for the Player panel.
> 
> 1. Create Express routes (`POST /api/leave-requests` and `GET /api/my-leave-requests`) interacting with the `LeaveRequests` schema.
>     
> 2. Build a clean UI form allowing the player to select a Date range and input a Reason for their absence.
>     
> 3. Below the form, display a 'History' list of their past and current requests.
>     
> 4. Use dynamic styling for the `approvalStatus` field: display a yellow 'Pending' badge when submitted, which changes to green 'Approved' or red 'Denied' based on the Coach's actions on the backend."

## phase 1

### Prompt 1: Server Initialization & Database Connection

_This prompt tells your agent to set up the core engine and connect to your local MongoDB Compass._



> "I am starting a new backend for a football club ERP system. Please initialize a new Node.js project using Express.js.
> 
> 1. Install the necessary dependencies: `express`, `mongoose`, `cors`, `dotenv`, `jsonwebtoken`, and `bcrypt`.
>     
> 2. Set up a clean folder structure: `/models`, `/routes`, `/controllers`, and `/middleware`.
>     
> 3. Create a `server.js` file as the entry point. Configure it to use CORS and parse JSON.
>     
> 4. Create a `.env` file with a `PORT` variable and a `MONGO_URI` pointing to a local MongoDB database named 'football-erp'.
>     
> 5. Write the Mongoose connection logic in `server.js` to connect to the database and start the server."
>     

---

### Prompt 2: Security & Role-Based Access Control (RBAC)

_This prompt builds the security system to ensure a Player can never access Admin or Manager routes._



> "Now, let's build the authentication and security layer.
> 
> 1. In the `/models` folder, create a `User.js` Mongoose schema. It should have `username`, `password`, and a `role` field. The `role` must be an Enum restricted to: 'admin', 'manager', 'coach', 'player'.
>     
> 2. Add a pre-save hook to the User schema that hashes the password using `bcrypt` before saving it to the database.
>     
> 3. In the `/controllers` folder, create an auth controller with a login function. It should verify the password and generate a JWT (JSON Web Token) that includes the user's ID and role. Create the corresponding route in `/routes/authRoutes.js`.
>     
> 4. In the `/middleware` folder, create an `authMiddleware.js` file. Write a function that verifies the JWT from the request headers, and another function called `verifyRole(allowedRoles)` that blocks access if the user's role is not in the allowed array."
>     

---

### Prompt 3: Core Database Schemas

_This prompt defines the exact structure for the data your frontend will eventually fetch._

**Copy and paste this:**

> "Next, let's create the remaining core database schemas in the `/models` directory to support the ERP features. Please create and export the following Mongoose models:
> 
> 1. **Profile:** Linked to a `User` ObjectId. Fields: `firstName`, `lastName`, `photoUrl`, `physicalStats` (height, weight, blood type), `contract` (startDate, endDate, type), `fitnessStatus` (Fit, Injured, Suspended), and a `statistics` object (goals, assists, minutes, cards).
>     
> 2. **Fixture:** Fields: `opponent`, `matchDate`, `location`, and `status`.
>     
> 3. **DisciplinaryAction:** Linked to a `User` ObjectId. Fields: `offenseType`, `fineAmount`, `dateIssued`, and `paymentStatus` (Pending, Paid).
>     
> 4. **LeaveRequest:** Linked to a `User` ObjectId. Fields: `startDate`, `endDate`, `reason`, and `approvalStatus` (Pending, Approved, Denied).
>     
> 5. **Inventory:** Fields: `itemName`, `serialNumber`, `assignedToPlayerId` (linked to User ObjectId), and `status`."

# all the prompts index 

- **Phase 1: The Backend (3 Prompts):** Server Setup, Security (JWT/RBAC), and Database Schemas.
    
- **Phase 2: Global UI & Admin (3 Prompts):** API Connection, Command Palette (Cmd+K), and User Management Table.
    
- **Phase 3: Manager Panel (3 Prompts):** Contract Progress Bars, Fixture Calendar, and Gear Inventory.
    
- **Phase 4: Coach Panel (3 Prompts):** Drag-and-Drop Pitch, Injury/Fine Tracking, and Post-Match Ratings.
    
- **Phase 5: Player Panel (3 Prompts):** Mobile Dashboard, Schedule Timeline, and Leave Requests.


> #  **POST-EXECUTION PROTOCOL:** After writing the code, you MUST perform the following steps before finishing your response:
> 
> 1. **Self-Verification & Debugging:** Review the generated code for syntax errors, missing imports, or conflicting variable names. Ensure the changes do not break the existing environment. If you detect any bugs in your initial approach, fix them silently before generating the final output.
>     
> 2. **Execution Report:** Generate a final summary report formatted exactly like this:
>     
>     - **[Added]:** (List of new files, routes, schemas, or components created)
>         
>     - **[Changed]:** (List of existing files modified)
>         
>     - **[Fixed/Debugged]:** (Briefly explain any errors you caught and fixed during generation)
>         
>     - **[Manual Verification Checklist]:** (Provide a bulleted list of 2-3 specific actions I need to take to test this—e.g., 'Open localhost:5000/api/users in your browser to verify the JSON response')."
>         

---

### Phase 1 Prompts (Updated with the Protocol)

## Here is how your Phase 1 prompts look with the new debugging and reporting engine attached.

#### Prompt 1: Server Initialization & Database Connection



> "I am starting a new backend for a football club ERP system. Please initialize a new Node.js project using Express.js.
> 
> 1. Install the necessary dependencies: `express`, `mongoose`, `cors`, `dotenv`, `jsonwebtoken`, and `bcrypt`.
>     
> 2. Set up a clean folder structure: `/models`, `/routes`, `/controllers`, and `/middleware`.
>     
> 3. Create a `server.js` file as the entry point. Configure it to use CORS and parse JSON.
>     
> 4. Create a `.env` file with a `PORT` variable and a `MONGO_URI` pointing to a local MongoDB database named 'football-erp'.
>     
> 5. Write the Mongoose connection logic in `server.js` to connect to the database and start the server.
>     
> 
> ---
> 
> **POST-EXECUTION PROTOCOL:** After writing the code, you MUST perform the following steps before finishing your response:
> 
> 6. **Self-Verification & Debugging:** Review the generated code for syntax errors, missing imports, or conflicting variable names. Ensure the changes do not break the existing environment. If you detect any bugs in your initial approach, fix them silently before generating the final output.
>     
> 7. **Execution Report:** Generate a final summary report formatted exactly like this:
>     
>     - **[Added]:** (List of new files, routes, schemas, or components created)
>         
>     - **[Changed]:** (List of existing files modified)
>         
>     - **[Fixed/Debugged]:** (Briefly explain any errors you caught and fixed during generation)
>         
>     - **[Manual Verification Checklist]:** (Provide a bulleted list of 2-3 specific actions I need to take to test this—e.g., 'Run `npm run dev` and check the console for the MongoDB connection message')."
>         

#### Prompt 2: Security & Role-Based Access Control (RBAC)



> "Now, let's build the authentication and security layer.
> 
> 1. In the `/models` folder, create a `User.js` Mongoose schema. It should have `username`, `password`, and a `role` field. The `role` must be an Enum restricted to: 'admin', 'manager', 'coach', 'player'.
>     
> 2. Add a pre-save hook to the User schema that hashes the password using `bcrypt` before saving it to the database.
>     
> 3. In the `/controllers` folder, create an auth controller with a login function. It should verify the password and generate a JWT (JSON Web Token) that includes the user's ID and role. Create the corresponding route in `/routes/authRoutes.js`.
>     
> 4. In the `/middleware` folder, create an `authMiddleware.js` file. Write a function that verifies the JWT from the request headers, and another function called `verifyRole(allowedRoles)` that blocks access if the user's role is not in the allowed array.
>     
> 
> ---
> 
> **POST-EXECUTION PROTOCOL:** After writing the code, you MUST perform the following steps before finishing your response:
> 
> 1. **Self-Verification & Debugging:** Review the generated code for syntax errors, missing imports, or conflicting variable names. Ensure the changes do not break the existing environment. If you detect any bugs in your initial approach, fix them silently before generating the final output.
>     
> 2. **Execution Report:** Generate a final summary report formatted exactly like this:
>     
>     - **[Added]:** (List of new files, routes, schemas, or components created)
>         
>     - **[Changed]:** (List of existing files modified)
>         
>     - **[Fixed/Debugged]:** (Briefly explain any errors you caught and fixed during generation)
>         
>     - **[Manual Verification Checklist]:** (Provide a bulleted list of 2-3 specific actions I need to take to test this—e.g., 'Use Postman to send a POST request to `/api/auth/login` and verify a JWT is returned')."
>         

#### Prompt 3: Core Database Schemas



> "Next, let's create the remaining core database schemas in the `/models` directory to support the ERP features. Please create and export the following Mongoose models:
> 
> 1. **Profile:** Linked to a `User` ObjectId. Fields: `firstName`, `lastName`, `photoUrl`, `physicalStats` (height, weight, blood type), `contract` (startDate, endDate, type), `fitnessStatus` (Fit, Injured, Suspended), and a `statistics` object (goals, assists, minutes, cards).
>     
> 2. **Fixture:** Fields: `opponent`, `matchDate`, `location`, and `status`.
>     
> 3. **DisciplinaryAction:** Linked to a `User` ObjectId. Fields: `offenseType`, `fineAmount`, `dateIssued`, and `paymentStatus` (Pending, Paid).
>     
> 4. **LeaveRequest:** Linked to a `User` ObjectId. Fields: `startDate`, `endDate`, `reason`, and `approvalStatus` (Pending, Approved, Denied).
>     
> 5. **Inventory:** Fields: `itemName`, `serialNumber`, `assignedToPlayerId` (linked to User ObjectId), and `status`.

**POST-EXECUTION PROTOCOL:** After writing the code, you MUST perform the following steps before finishing your response:

1. **Self-Verification & Debugging:** Review the generated code for syntax errors, missing imports, or conflicting variable names. Ensure the changes do not break the existing environment. If you detect any bugs in your initial approach, fix them silently before generating the final output.
    
2. **Execution Report:** Generate a final summary report formatted exactly like this:
    
    - **[Added]:** (List of new files, routes, schemas, or components created)
        
    - **[Changed]:** (List of existing files modified)
        
    - **[Fixed/Debugged]:** (Briefly explain any errors you caught and fixed during generation)
        
    - **[Manual Verification Checklist]:** (Provide a bulleted list of 2-3 specific actions I need to take to test this—e.g., 'Open MongoDB Compass and verify the new collections have been created')."

# Here are the exactly 3 prompts for **Phase 2: Global UI & Admin**, formatted with the debugging protocol ready for you to copy and paste.

### Prompt 1: Frontend API Client & Auth State



> "We need to connect our React frontend to our Express backend. Please do the following:
> 
> 1. Install `axios` and `zustand` (or set up React Context) for global state management.
>     
> 2. Create an `api.js` (or `axiosInstance`) file configured to point to `http://localhost:5000/api`. It must include an interceptor that automatically attaches the JWT token from `localStorage` to the `Authorization` header of every request.
>     
> 3. Create a global Authentication State that stores the `user` object (containing their ID and role: admin, manager, coach, or player) and an `isAuthenticated` boolean.
>     
> 4. Create a protected route wrapper component that checks this state and redirects unauthorized users back to the login page.
>     
> 
> ---
> 
> **POST-EXECUTION PROTOCOL:** After writing the code, you MUST perform the following steps before finishing your response:
> 
> 1. **Self-Verification & Debugging:** Review the generated code for syntax errors, missing imports, or conflicting variable names. Ensure the changes do not break the existing environment. If you detect any bugs in your initial approach, fix them silently before generating the final output.
>     
> 2. **Execution Report:** Generate a final summary report formatted exactly like this:
>     
>     - **[Added]:** (List of new files or components created)
>         
>     - **[Changed]:** (List of existing files modified)
>         
>     - **[Fixed/Debugged]:** (Briefly explain any errors you caught and fixed during generation)
>         
>     - **[Manual Verification Checklist]:** (Provide a bulleted list of 2-3 specific actions I need to take to test this)."
>         

---

### Prompt 2: The Global Command Palette (Cmd+K)



> "I want to implement a Global Command Palette for the application.
> 
> 1. Install the `cmdk` React library (or use the Shadcn UI Command component if available in the project).
>     
> 2. Create a `<CommandMenu />` component that opens a centered modal search bar when the user presses `Ctrl+K` (or `Cmd+K` on Mac).
>     
> 3. Populate this menu with static quick-action links based on roles (e.g., 'Go to Dashboard', 'Settings', 'Logout').
>     
> 4. Ensure the styling matches the dark, premium aesthetic of the project (dark background, subtle borders) and does not interfere with the existing animated background layout. Make sure it is accessible from anywhere in the app.
>     
> 
> ---
> 
> **POST-EXECUTION PROTOCOL:** After writing the code, you MUST perform the following steps before finishing your response:
> 
> 1. **Self-Verification & Debugging:** Review the generated code for syntax errors, missing imports, or conflicting variable names. Ensure the changes do not break the existing environment. If you detect any bugs in your initial approach, fix them silently before generating the final output.
>     
> 2. **Execution Report:** Generate a final summary report formatted exactly like this:
>     
>     - **[Added]:** (List of new files or components created)
>         
>     - **[Changed]:** (List of existing files modified)
>         
>     - **[Fixed/Debugged]:** (Briefly explain any errors you caught and fixed during generation)
>         
>     - **[Manual Verification Checklist]:** (Provide a bulleted list of 2-3 specific actions I need to take to test this)."
>         

---

### Prompt 3: Wiring the Admin User Management Table



> "Let's make the Admin 'User Management' panel fully functional by connecting it to the backend.
> 
> 1. In the React component for the Admin User Management page, write a `useEffect` hook that uses our Axios instance to `GET /api/users` and store the data in local state.
>     
> 2. Update the existing UI data table to map over this fetched user data instead of hardcoded mock data.
>     
> 3. Build the 'Create User' form modal. When submitted, it should make a `POST /api/users` request with the new user's details and role, then automatically refresh the table data.
>     
> 4. Add a 'Delete' button to each row in the table that triggers a `DELETE /api/users/:id` request. Ensure there is a confirmation prompt before deleting.
>     
> 
> ---
> 
> **POST-EXECUTION PROTOCOL:** After writing the code, you MUST perform the following steps before finishing your response:
> 
> 1. **Self-Verification & Debugging:** Review the generated code for syntax errors, missing imports, or conflicting variable names. Ensure the changes do not break the existing environment. If you detect any bugs in your initial approach, fix them silently before generating the final output.
>     
> 2. **Execution Report:** Generate a final summary report formatted exactly like this:
>     
>     - **[Added]:** (List of new files or components created)
>         
>     - **[Changed]:** (List of existing files modified)
>         
>     - **[Fixed/Debugged]:** (Briefly explain any errors you caught and fixed during generation)
>         
>     - **[Manual Verification Checklist]:** (Provide a bulleted list of 2-3 specific actions I need to take to test this)."

## Here are the exactly 3 prompts for **Phase 3: The Manager Panel**, fully loaded with the self-debugging and reporting protocol.

### Prompt 1: Manager's Contract & Finance Dashboard



> "Let's build the Manager's 'Finance & Contracts' page.
> 
> 1. Create a React component for the Manager panel that fetches user data, specifically filtering for users with the 'player' role, and their associated profile data.
>     
> 2. Build a data grid or list UI to display these players.
>     
> 3. Write a JavaScript utility function that takes the `contract.endDate` from the database, compares it to today's date, and calculates the exact number of 'Days Left'.
>     
> 4. Display this 'Days Left' metric using a visual progress bar next to each player. Add a color-coded badge indicating if their contract type is 'Owned' or 'On Loan'.
>     
> 5. Ensure the styling strictly adheres to the project's existing dark theme and modern aesthetic.
>     
> 
> ---
> 
> **POST-EXECUTION PROTOCOL:** After writing the code, you MUST perform the following steps before finishing your response:
> 
> 6. **Self-Verification & Debugging:** Review the generated code for syntax errors, missing imports, or conflicting variable names. Ensure the changes do not break the existing environment. If you detect any bugs in your initial approach, fix them silently before generating the final output.
>     
> 7. **Execution Report:** Generate a final summary report formatted exactly like this:
>     
>     - **[Added]:** (List of new files or components created)
>         
>     - **[Changed]:** (List of existing files modified)
>         
>     - **[Fixed/Debugged]:** (Briefly explain any errors you caught and fixed during generation)
>         
>     - **[Manual Verification Checklist]:** (Provide a bulleted list of 2-3 specific actions I need to take to test this)."
>         

---

### Prompt 2: Manager's Fixture Scheduler



> "Now, build the Manager's 'Schedule Matches' page.
> 
> 1. Set up the backend CRUD routes (`GET`, `POST`, `PUT`, `DELETE`) in Express for the `Fixtures` schema we created earlier.
>     
> 2. Create a React component with a clean, modern UI to display upcoming matches in chronological order.
>     
> 3. Build a slide-out drawer or modal form to add a new fixture (inputs: Opponent, Date/Time, Location) that triggers the `POST` route.
>     
> 4. Add 'Edit' and 'Delete' action buttons to each existing fixture card, wiring them up to the respective API endpoints. Ensure the UI automatically refreshes the fixture list when a change is made.
>     
> 
> ---
> 
> **POST-EXECUTION PROTOCOL:** After writing the code, you MUST perform the following steps before finishing your response:
> 
> 1. **Self-Verification & Debugging:** Review the generated code for syntax errors, missing imports, or conflicting variable names. Ensure the changes do not break the existing environment. If you detect any bugs in your initial approach, fix them silently before generating the final output.
>     
> 2. **Execution Report:** Generate a final summary report formatted exactly like this:
>     
>     - **[Added]:** (List of new files, routes, or components created)
>         
>     - **[Changed]:** (List of existing files modified)
>         
>     - **[Fixed/Debugged]:** (Briefly explain any errors you caught and fixed during generation)
>         
>     - **[Manual Verification Checklist]:** (Provide a bulleted list of 2-3 specific actions I need to take to test this)."
>         

---

### Prompt 3: Logistics & Digital Gear Checkout



> "Next, build the Manager's 'Logistics & Inventory' page.
> 
> 1. Set up the backend CRUD routes in Express for the `Inventory` schema we already created.
>     
> 2. Build a React UI with two main tabs: 'Stock Room' and 'Allocations'.
>     
> 3. Under 'Stock Room', add a form to register new club gear (like Training Kits or GPS Vests).
>     
> 4. Under 'Allocations', build an interface with a dropdown to select a specific Player and assign an available inventory item to them. Display a real-time table of all checked-out gear and the name of the player who currently holds it.
>     
> 
> ---
> 
> **POST-EXECUTION PROTOCOL:** After writing the code, you MUST perform the following steps before finishing your response:
> 
> 1. **Self-Verification & Debugging:** Review the generated code for syntax errors, missing imports, or conflicting variable names. Ensure the changes do not break the existing environment. If you detect any bugs in your initial approach, fix them silently before generating the final output.
>     
> 2. **Execution Report:** Generate a final summary report formatted exactly like this:
>     
>     - **[Added]:** (List of new files, routes, or components created)
>         
>     - **[Changed]:** (List of existing files modified)
>         
>     - **[Fixed/Debugged]:** (Briefly explain any errors you caught and fixed during generation)
>         
>     - **[Manual Verification Checklist]:** (Provide a bulleted list of 2-3 specific actions I need to take to test this)."

## Here are the exactly 3 prompts for **Phase 4: The Coach Panel**, complete with the self-debugging and reporting protocol.

### Prompt 1: The Drag-and-Drop Tactical Pitch



> "Let's build the Coach's 'Tactical Board' page.
> 
> 1. Install a modern drag-and-drop library like `@dnd-kit/core` and `@dnd-kit/sortable` (or use `framer-motion` if preferred).
>     
> 2. Build a React UI with two main sections: a 'Bench' sidebar containing player avatar cards, and a 'Pitch' area styled like a top-down football field.
>     
> 3. Fetch the players from the backend. **Crucial:** Filter the 'Bench' list so that any player with a `fitnessStatus` of 'Injured' or 'Suspended' is grayed out and cannot be dragged.
>     
> 4. Implement the drag-and-drop logic allowing the coach to drag 11 fit players onto the Pitch to set a formation.
>     
> 5. Add a 'Save Formation' button that sends an array of the selected `playerId`s and their X/Y pitch coordinates to the backend (you will need to create a `POST /api/tactics` Express route for this).
>     
> 
> ---
> 
> **POST-EXECUTION PROTOCOL:** After writing the code, you MUST perform the following steps before finishing your response:
> 
> 6. **Self-Verification & Debugging:** Review the generated code for syntax errors, missing imports, or conflicting variable names. Ensure the changes do not break the existing environment. If you detect any bugs in your initial approach, fix them silently before generating the final output.
>     
> 7. **Execution Report:** Generate a final summary report formatted exactly like this:
>     
>     - **[Added]:** (List of new files, routes, or components created)
>         
>     - **[Changed]:** (List of existing files modified)
>         
>     - **[Fixed/Debugged]:** (Briefly explain any errors you caught and fixed during generation)
>         
>     - **[Manual Verification Checklist]:** (Provide a bulleted list of 2-3 specific actions I need to take to test this)."
>         

---

### Prompt 2: Squad Health & Disciplinary Actions



> "Next, build the Coach's 'Squad Health & Discipline' page.
> 
> 1. Create a data table in React listing all active players.
>     
> 2. **Health Tracker:** Add a dropdown menu to each row to update a player's `fitnessStatus` (Fit, Injured, Suspended). When changed, make a `PUT` request to update the database. Use high-contrast color-coded tags for these statuses.
>     
> 3. **Discipline Form:** Add an 'Issue Fine' button to each row. Clicking this should open a modal to input an `offenseType` (e.g., Late to Training) and a `fineAmount`.
>     
> 4. Submitting this modal should make a `POST` request to the `DisciplinaryActions` collection we created earlier.
>     
> 5. Ensure the UI feels highly responsive by refetching the player list immediately after a status update.
>     
> 
> ---
> 
> **POST-EXECUTION PROTOCOL:** After writing the code, you MUST perform the following steps before finishing your response:
> 
> 6. **Self-Verification & Debugging:** Review the generated code for syntax errors, missing imports, or conflicting variable names. Ensure the changes do not break the existing environment. If you detect any bugs in your initial approach, fix them silently before generating the final output.
>     
> 7. **Execution Report:** Generate a final summary report formatted exactly like this:
>     
>     - **[Added]:** (List of new files, routes, or components created)
>         
>     - **[Changed]:** (List of existing files modified)
>         
>     - **[Fixed/Debugged]:** (Briefly explain any errors you caught and fixed during generation)
>         
>     - **[Manual Verification Checklist]:** (Provide a bulleted list of 2-3 specific actions I need to take to test this)."
>         

---

### Prompt 3: Post-Match Ratings & Statistics Input



> "Finally, build the Coach's 'Post-Match Ratings' page.
> 
> 1. Create an interface displaying the roster of players.
>     
> 2. For each player, provide a quick-input row or expanding accordion to increment their raw statistics (Goals, Assists, Minutes Played, Yellow/Red Cards).
>     
> 3. Add a slider component (1-10) for 'Coach's Match Rating' and a text area for 'Private Feedback'.
>     
> 4. Create a `PUT` Express route to handle this data, updating the `statistics` object inside the player's `Profile` document.
>     
> 5. Ensure the styling remains consistent with our premium dark theme, utilizing UI components like Sliders and Textareas.
>     
> 
> ---
> 
> **POST-EXECUTION PROTOCOL:** After writing the code, you MUST perform the following steps before finishing your response:
> 
> 6. **Self-Verification & Debugging:** Review the generated code for syntax errors, missing imports, or conflicting variable names. Ensure the changes do not break the existing environment. If you detect any bugs in your initial approach, fix them silently before generating the final output.
>     
> 7. **Execution Report:** Generate a final summary report formatted exactly like this:
>     
>     - **[Added]:** (List of new files, routes, or components created)
>         
>     - **[Changed]:** (List of existing files modified)
>         
>     - **[Fixed/Debugged]:** (Briefly explain any errors you caught and fixed during generation)
>         
>     - **[Manual Verification Checklist]:** (Provide a bulleted list of 2-3 specific actions I need to take to test this)."

## Here are the exactly 3 prompts for **Phase 5: The Player Panel**, complete with the self-debugging and reporting protocol. This is the final core module of your football club ERP!

### Prompt 1: The Mobile-First Player Dashboard

> "Let's build the Player's 'Status & Profile' dashboard.
> 
> 1. Create a `GET /api/my-profile` Express route that uses the ID from the logged-in user's JWT to fetch only their specific document from the `Profile` collection (including their nested `statistics` and `fitnessStatus`).
>     
> 2. Build a React component tailored for mobile viewing (use Tailwind's responsive classes like `max-w-md mx-auto` or a mobile-app layout).
>     
> 3. Create a 'Hero Profile Header' component displaying the player's photo, name, position, and a color-coded status badge (e.g., Green for Fit, Red for Injured).
>     
> 4. Below the header, build a 'Bento Box' grid layout displaying their live statistics (Goals, Assists, Minutes, Cards). Make these metric cards visually punchy with large numbers and subtle borders.
>     
> 
> ---
> 
> **POST-EXECUTION PROTOCOL:** After writing the code, you MUST perform the following steps before finishing your response:
> 
> 1. **Self-Verification & Debugging:** Review the generated code for syntax errors, missing imports, or conflicting variable names. Ensure the changes do not break the existing environment. If you detect any bugs in your initial approach, fix them silently before generating the final output.
>     
> 2. **Execution Report:** Generate a final summary report formatted exactly like this:
>     
>     - **[Added]:** (List of new files, routes, or components created)
>         
>     - **[Changed]:** (List of existing files modified)
>         
>     - **[Fixed/Debugged]:** (Briefly explain any errors you caught and fixed during generation)
>         
>     - **[Manual Verification Checklist]:** (Provide a bulleted list of 2-3 specific actions I need to take to test this)."
>         

---

### Prompt 2: Logistics & Schedule View


> "Next, build the Player's 'Schedule & Logistics' page.
> 
> 1. Create a React component that fetches both upcoming `Fixtures` and `TrainingSessions` from the backend API.
>     
> 2. Display these events in a unified, vertically scrolling timeline or list UI.
>     
> 3. Use visual indicators (like icons or small colored dots) to distinguish between a Match Day and a Training Session.
>     
> 4. Under a separate tab or section called 'My Gear', fetch and display the items from the `Inventory` collection that are currently assigned to this specific user's ID.
>     
> 
> ---
> 
> **POST-EXECUTION PROTOCOL:** After writing the code, you MUST perform the following steps before finishing your response:
> 
> 1. **Self-Verification & Debugging:** Review the generated code for syntax errors, missing imports, or conflicting variable names. Ensure the changes do not break the existing environment. If you detect any bugs in your initial approach, fix them silently before generating the final output.
>     
> 2. **Execution Report:** Generate a final summary report formatted exactly like this:
>     
>     - **[Added]:** (List of new files, routes, or components created)
>         
>     - **[Changed]:** (List of existing files modified)
>         
>     - **[Fixed/Debugged]:** (Briefly explain any errors you caught and fixed during generation)
>         
>     - **[Manual Verification Checklist]:** (Provide a bulleted list of 2-3 specific actions I need to take to test this)."
>         

---

### Prompt 3: Leave Request System (Bi-Directional Workflow)


> "Finally, let's build the 'Leave Request' system for the Player panel.
> 
> 1. Create Express routes (`POST /api/leave-requests` and `GET /api/my-leave-requests`) interacting with the `LeaveRequests` schema.
>     
> 2. Build a clean UI form allowing the player to select a Date range and input a Reason for their absence.
>     
> 3. Below the form, display a 'History' list of their past and current requests.
>     
> 4. Use dynamic styling for the `approvalStatus` field: display a yellow 'Pending' badge when submitted, which changes to green 'Approved' or red 'Denied' based on the Coach's actions on the backend.
>     
> 
> ---
> 
> **POST-EXECUTION PROTOCOL:** After writing the code, you MUST perform the following steps before finishing your response:
> 
> 1. **Self-Verification & Debugging:** Review the generated code for syntax errors, missing imports, or conflicting variable names. Ensure the changes do not break the existing environment. If you detect any bugs in your initial approach, fix them silently before generating the final output.
>     
> 2. **Execution Report:** Generate a final summary report formatted exactly like this:
>     
>     - **[Added]:** (List of new files, routes, or components created)
>         
>     - **[Changed]:** (List of existing files modified)
>         
>     - **[Fixed/Debugged]:** (Briefly explain any errors you caught and fixed during generation)
>         
>     - **[Manual Verification Checklist]:** (Provide a bulleted list of 2-3 specific actions I need to take to test this)."
>


# We have completed the core development of the football club ERP across all modules. Now, perform a deep, comprehensive codebase scan and UI cleanup.

Please execute the following checks without adding any new major features:

1. **Deduplication Scan:** Deeply scan the React component tree and routing setup. Ensure there are no duplicate UI elements (e.g., ensure the Global Navigation Bar and the Cmd+K Command Palette are implemented only once at the layout level, not duplicated inside individual page components). If you find duplicates, remove them.
    
2. **Animated Background Verification:** Verify that the `AnimatedBackgroundLayout` (with the red glow and floating elements) is correctly wrapping the required pages, and ensure it is not fighting with or overlapping any hardcoded background colors in the child components.
    
3. **Mock Data Cleanup:** Scan all UI components in the Admin, Manager, Coach, and Player panels. Ensure no hardcoded mock data or placeholder text remains. Everything must be wired up to the respective `api.js` Axios calls.
    
4. **Console Error Check:** Identify and fix any silent React warnings (e.g., missing `key` props in mapped lists, or unused imports).
    

---

**POST-EXECUTION PROTOCOL:** After executing this scan and making the necessary code adjustments, you MUST perform the following steps before finishing your response:

1. **Self-Verification & Debugging:** Ensure your cleanup did not accidentally break any working API calls or routing.
    
2. **Execution Report:** Generate a final summary report formatted exactly like this:
    
    - **[Removed/Cleaned]:** (List the specific duplicate elements or dead code you removed)
        
    - **[Fixed/Debugged]:** (Briefly explain any UI overlaps or React warnings you caught and fixed)
        
    - **[Final Manual Verification Checklist]:** (Provide a bulleted list of 2-3 specific pages I should click through to verify the UI is clean and data is flowing correctly)."