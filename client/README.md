# Football Club Management System - Frontend

React-based frontend for the Football Club Management System with role-based authentication and routing.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file in the client directory:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## Project Structure

```
src/
├── components/       # Reusable React components
│   └── ProtectedRoute.jsx
├── contexts/         # React Context providers
│   └── AuthContext.jsx
├── pages/           # Route-level page components
│   ├── LoginPage.jsx
│   ├── AdminPanel.jsx
│   ├── ManagerPanel.jsx
│   ├── CoachPanel.jsx
│   └── PlayerPanel.jsx
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
├── App.jsx          # Main app component with routing
├── main.jsx         # React entry point
└── index.css        # Global styles with Tailwind
```

## Authentication

The app uses JWT-based authentication with role-based access control.

### Using the Auth Context

```jsx
import { useAuth } from './contexts/AuthContext'

function MyComponent() {
  const { user, token, loading, login, logout } = useAuth()

  // user: { id, role } or null
  // token: JWT string or null
  // loading: boolean
  // login: async (email, password) => { success, role, error }
  // logout: () => void
}
```

### Protected Routes

```jsx
import ProtectedRoute from './components/ProtectedRoute'

<Route 
  path="/admin" 
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminPanel />
    </ProtectedRoute>
  } 
/>
```

## User Roles

- **Admin**: Full system access (user management, settings, logs)
- **Manager**: Fixtures, contracts, documents, inventory, finances
- **Coach**: Tactics, training, player health, discipline, performance
- **Player**: Read-only access to personal data, leave requests

## Routes

| Path | Component | Access | Description |
|------|-----------|--------|-------------|
| `/` | Redirect | Public | Redirects to `/login` |
| `/login` | LoginPage | Public | User authentication |
| `/admin` | AdminPanel | Admin only | Admin dashboard |
| `/manager` | ManagerPanel | Manager only | Manager dashboard |
| `/coach` | CoachPanel | Coach only | Coach dashboard |
| `/player` | PlayerPanel | Player only | Player dashboard |

## API Integration

The frontend communicates with the backend API at `http://localhost:5000/api`.

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Token verification

### Request Headers

All authenticated requests include:
```
Authorization: Bearer <jwt_token>
```

## Styling

The app uses Tailwind CSS with a custom theme:

- Primary colors: Blue palette (50-900)
- Success: Green (#10b981)
- Warning: Orange (#f59e0b)
- Danger: Red (#ef4444)

## Development

### Adding a New Page

1. Create component in `src/pages/`
2. Add route in `src/App.jsx`
3. Wrap with `ProtectedRoute` if authentication required

### Adding a New Context

1. Create context in `src/contexts/`
2. Export provider and custom hook
3. Wrap app or specific routes in provider

### Adding a New Component

1. Create component in `src/components/`
2. Export as default or named export
3. Import where needed

## Testing

### Manual Testing

1. Start backend server: `cd server && npm start`
2. Start frontend: `cd client && npm run dev`
3. Navigate to `http://localhost:5173`
4. Test authentication with seeded users
5. Test role-based access control

### Test Users (from seed data)

Check `server/seed.js` for test user credentials.

## Build

```bash
npm run build
```

Builds the app for production to the `dist` folder.

## Troubleshooting

### "Cannot connect to API"
- Ensure backend server is running on port 5000
- Check `.env` file has correct `VITE_API_URL`

### "Token verification failed"
- Clear localStorage in browser DevTools
- Log in again to get fresh token

### "Access Denied"
- Verify user role matches route requirements
- Check backend role guard middleware

## Next Steps

- [ ] Implement Socket.io for real-time updates
- [ ] Build out panel functionality
- [ ] Add loading states and error boundaries
- [ ] Implement toast notifications
- [ ] Add form validation library
- [ ] Add unit tests with Vitest
- [ ] Add E2E tests with Playwright

## License

Private - Football Club Management System
