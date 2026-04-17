import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SocketProvider } from './contexts/SocketContext'
import ProtectedRoute from './components/ProtectedRoute'
import NotificationCenter from './components/NotificationCenter'
import CommandMenu from './components/CommandMenu'
import PageTransition from './components/PageTransition'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import AdminPanel from './pages/AdminPanel'
import ManagerPanel from './pages/ManagerPanel'
import CoachPanel from './pages/CoachPanel'
import PlayerPanel from './pages/PlayerPanel'
import MatchDetailPage from './pages/MatchDetailPage'
import PublicSquadPage from './pages/PublicSquadPage'
import PublicPlayerPage from './pages/PublicPlayerPage'

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          {/* Global NotificationCenter - available across all panels */}
          <NotificationCenter />
          <CommandMenu />
          
          {/* Cinematic page transition wraps all routes */}
          <PageTransition>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/squad" element={<PublicSquadPage />} />
              <Route path="/players/:id" element={<PublicPlayerPage />} />
              <Route path="/match/:id" element={<MatchDetailPage />} />
              
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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </PageTransition>
        </Router>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App
