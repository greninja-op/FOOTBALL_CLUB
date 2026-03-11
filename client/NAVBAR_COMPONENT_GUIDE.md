# Navbar Component Usage Guide

## Overview
The Navbar component is a shared navigation bar used across all panel pages (Admin, Manager, Coach, Player). It provides consistent branding, user identification, and logout functionality.

## Visual Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo] Football Club                              [ADMIN] [Logout] │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Structure

```jsx
<Navbar />
```

No props required - the component is fully self-contained.

## Features

### 1. Club Branding
- **Club Logo**: Displays if `logoUrl` is set in settings
- **Club Name**: Always displays, defaults to "Football Club" if not set
- **Responsive**: Logo and name scale appropriately on different screen sizes

### 2. User Role Badge
Color-coded badges for easy role identification:
- **Admin**: Purple badge (`bg-purple-100 text-purple-800`)
- **Manager**: Blue badge (`bg-blue-100 text-blue-800`)
- **Coach**: Green badge (`bg-green-100 text-green-800`)
- **Player**: Yellow badge (`bg-yellow-100 text-yellow-800`)

### 3. Logout Button
- Red button with hover effect
- Calls `AuthContext.logout()`
- Redirects to `/login` page
- Clears authentication token

## Usage in Panel Pages

### Before (Old Implementation)
```jsx
const AdminPanel = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        {/* Inline navbar code */}
      </nav>
      <main>{/* Content */}</main>
    </div>
  )
}
```

### After (New Implementation)
```jsx
import Navbar from '../components/Navbar'

const AdminPanel = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{/* Content */}</main>
    </div>
  )
}
```

## API Integration

### Settings Endpoint
The Navbar fetches club settings on mount:

```javascript
GET /api/settings
Authorization: Bearer <token>

Response:
{
  "success": true,
  "settings": {
    "clubName": "My Football Club",
    "logoUrl": "https://example.com/logo.png"
  }
}
```

### AuthContext Integration
The Navbar uses the following from AuthContext:
- `user.role` - For displaying the role badge
- `logout()` - For logout functionality

## Styling Details

### Container
- Max width: `max-w-7xl`
- Horizontal padding: `px-4 sm:px-6 lg:px-8`
- Height: `h-16`
- Background: White with shadow and bottom border

### Logo
- Size: `h-10 w-10`
- Object fit: `object-contain`
- Only displays if `logoUrl` exists

### Club Name
- Font: `text-xl font-bold`
- Color: `text-gray-800`

### Role Badge
- Padding: `px-3 py-1`
- Border radius: `rounded-full`
- Font: `text-sm font-medium`
- Color-coded by role

### Logout Button
- Padding: `px-4 py-2`
- Font: `text-sm`
- Background: `bg-red-600` (hover: `bg-red-700`)
- Text: White
- Border radius: `rounded`
- Transition: Smooth color change

## Error Handling

### API Failure
If the settings API fails:
- Component continues to render
- Shows default "Football Club" name
- No logo is displayed
- Error is logged to console

### Missing User Data
If user data is unavailable:
- Role badge is not displayed
- Logout button still functions

### Invalid Logo URL
If logo URL is invalid or image fails to load:
- Only club name is displayed
- No broken image icon shown

## Responsive Design

### Desktop (≥1024px)
```
[Logo] Club Name                    [ROLE BADGE] [Logout]
```

### Tablet (768px - 1023px)
```
[Logo] Club Name              [ROLE] [Logout]
```

### Mobile (<768px)
```
[Logo] Club Name
                    [ROLE] [Logout]
```

## Future Enhancements

### 1. Real-time Settings Updates
```jsx
// Listen for settings:updated Socket.io event
useEffect(() => {
  socket.on('settings:updated', (data) => {
    setSettings(data)
  })
}, [socket])
```

### 2. Mobile Hamburger Menu
```jsx
const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

// Add hamburger icon for mobile
<button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
  <MenuIcon />
</button>
```

### 3. User Profile Dropdown
```jsx
<div className="relative">
  <button onClick={() => setDropdownOpen(!dropdownOpen)}>
    {user.role}
  </button>
  {dropdownOpen && (
    <div className="absolute right-0 mt-2">
      <Link to="/profile">Profile</Link>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )}
</div>
```

### 4. Notification Bell
```jsx
<button className="relative">
  <BellIcon />
  {unreadCount > 0 && (
    <span className="absolute top-0 right-0 bg-red-500">
      {unreadCount}
    </span>
  )}
</button>
```

## Testing

### Manual Testing Checklist
- [ ] Navbar renders on all panel pages
- [ ] Club name displays correctly
- [ ] Club logo displays when set
- [ ] Role badge shows correct color for each role
- [ ] Logout button redirects to login page
- [ ] Token is cleared on logout
- [ ] Component handles API errors gracefully
- [ ] Responsive design works on mobile/tablet/desktop

### Automated Testing (Future)
```jsx
describe('Navbar Component', () => {
  it('renders club name', () => {
    render(<Navbar />)
    expect(screen.getByText(/Football Club/i)).toBeInTheDocument()
  })

  it('displays user role badge', () => {
    render(<Navbar />)
    expect(screen.getByText(/ADMIN/i)).toBeInTheDocument()
  })

  it('calls logout on button click', () => {
    const mockLogout = jest.fn()
    render(<Navbar />)
    fireEvent.click(screen.getByText(/Logout/i))
    expect(mockLogout).toHaveBeenCalled()
  })
})
```

## Troubleshooting

### Issue: Navbar not displaying club name
**Solution**: Check if settings API is accessible and returning data

### Issue: Logo not showing
**Solution**: Verify `logoUrl` is set in database and URL is accessible

### Issue: Role badge not showing
**Solution**: Ensure user is authenticated and `user.role` exists in AuthContext

### Issue: Logout not working
**Solution**: Check AuthContext implementation and navigation setup

## Related Files
- Component: `client/src/components/Navbar.jsx`
- Context: `client/src/contexts/AuthContext.jsx`
- API Controller: `server/controllers/settingsController.js`
- API Routes: `server/routes/settingsRoutes.js`
- Model: `server/models/Settings.js`

## Support
For issues or questions, refer to:
- Task 8 completion documentation: `TASK_8_COMPLETION.md`
- Design document: `.kiro/specs/football-club-management-system/design.md`
- Requirements: `.kiro/specs/football-club-management-system/requirements.md`
