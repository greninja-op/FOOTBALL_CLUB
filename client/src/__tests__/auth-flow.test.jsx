import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import ProtectedRoute from '../components/ProtectedRoute'

const mockNavigate = vi.fn()
const mockUseAuth = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}))

describe('Authentication Flow Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: null,
      token: null,
      loading: false,
      login: vi.fn(),
      logout: vi.fn()
    })
  })

  describe('LoginPage', () => {
    it('renders correctly', () => {
      render(
        <MemoryRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <LoginPage />
        </MemoryRouter>
      )

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('shows validation errors for empty fields', async () => {
      render(
        <MemoryRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <LoginPage />
        </MemoryRouter>
      )

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(screen.getByText(/please enter both email and password/i)).toBeInTheDocument()
      })
    })

    it('calls login and redirects on success', async () => {
      const login = vi.fn().mockResolvedValue({ success: true, role: 'admin' })
      mockUseAuth.mockReturnValue({
        user: null,
        token: null,
        loading: false,
        login
      })

      render(
        <MemoryRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <LoginPage />
        </MemoryRouter>
      )

      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'test@example.com' }
      })
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' }
      })
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(login).toHaveBeenCalledWith('test@example.com', 'password123')
        expect(mockNavigate).toHaveBeenCalledWith('/admin')
      })
    })

    it('shows auth errors from login failures', async () => {
      const login = vi.fn().mockResolvedValue({ success: false, error: 'Invalid credentials' })
      mockUseAuth.mockReturnValue({
        user: null,
        token: null,
        loading: false,
        login
      })

      render(
        <MemoryRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <LoginPage />
        </MemoryRouter>
      )

      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'test@example.com' }
      })
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'wrongpassword' }
      })
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
      })
    })
  })

  describe('ProtectedRoute', () => {
    it('redirects unauthenticated users to login', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        token: null,
        loading: false
      })

      render(
        <MemoryRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <ProtectedRoute allowedRoles={['admin']}>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      )

      expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument()
    })

    it('renders protected content for authorized users', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'u1', role: 'admin' },
        token: 'token',
        loading: false
      })

      render(
        <MemoryRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <ProtectedRoute allowedRoles={['admin']}>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      )

      expect(screen.getByText(/protected content/i)).toBeInTheDocument()
    })

    it('shows access denied for authenticated users with wrong role', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'u1', role: 'player' },
        token: 'token',
        loading: false
      })

      render(
        <MemoryRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <ProtectedRoute allowedRoles={['admin']}>
            <div>Admin Only Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      )

      expect(screen.getByText(/access denied/i)).toBeInTheDocument()
      expect(screen.queryByText(/admin only content/i)).not.toBeInTheDocument()
    })
  })
})
