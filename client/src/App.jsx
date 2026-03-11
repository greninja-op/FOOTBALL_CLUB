import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import AdminPanel from './pages/AdminPanel'
import ManagerPanel from './pages/ManagerPanel'
import CoachPanel from './pages/CoachPanel'
import PlayerPanel from './pages/PlayerPanel'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Public route */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes with role-based access */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/manager" 
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <ManagerPanel />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/coach" 
            element={
              <ProtectedRoute allowedRoles={['coach']}>
                <CoachPanel />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/player" 
            element={
              <ProtectedRoute allowedRoles={['player']}>
                <PlayerPanel />
              </ProtectedRoute>
            } 
          />

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
