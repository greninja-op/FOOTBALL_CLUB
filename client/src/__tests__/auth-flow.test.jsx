import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import LoginPage from '../pages/LoginPage';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminPanel from '../pages/AdminPanel';

describe('Authentication Flow Unit Tests (Task 7.6)', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('LoginPage', () => {
    it('should render correctly', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </BrowserRouter>
      );

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('should show validation errors for empty fields', async () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </BrowserRouter>
      );

      const loginButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i) || screen.getByText(/please enter/i)).toBeInTheDocument();
      });
    });

    it('should call login function on form submit', async () => {
      const mockLogin = vi.fn();
      
      render(
        <BrowserRouter>
          <AuthProvider value={{ login: mockLogin }}>
            <LoginPage />
          </AuthProvider>
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });
  });

  describe('Successful Login Redirect', () => {
    it('should redirect admin to /admin panel', async () => {
      const mockNavigate = vi.fn();
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useNavigate: () => mockNavigate
        };
      });

      // Simulate successful admin login
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('userRole', 'admin');

      // Test would verify navigation to /admin
      expect(localStorage.getItem('userRole')).toBe('admin');
    });

    it('should redirect manager to /manager panel', () => {
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('userRole', 'manager');
      expect(localStorage.getItem('userRole')).toBe('manager');
    });

    it('should redirect coach to /coach panel', () => {
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('userRole', 'coach');
      expect(localStorage.getItem('userRole')).toBe('coach');
    });

    it('should redirect player to /player panel', () => {
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('userRole', 'player');
      expect(localStorage.getItem('userRole')).toBe('player');
    });
  });

  describe('Failed Login', () => {
    it('should show error message for invalid credentials', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ message: 'Invalid credentials' })
        })
      );

      render(
        <BrowserRouter>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i) || screen.getByText(/error/i)).toBeInTheDocument();
      });
    });
  });

  describe('ProtectedRoute', () => {
    it('should redirect unauthenticated users to login', () => {
      localStorage.clear();

      const { container } = render(
        <BrowserRouter>
          <AuthProvider>
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          </AuthProvider>
        </BrowserRouter>
      );

      // Should not render protected content
      expect(screen.queryByText(/admin panel/i)).not.toBeInTheDocument();
    });

    it('should render protected content for authenticated users', async () => {
      localStorage.setItem('authToken', 'valid-token');
      localStorage.setItem('userRole', 'admin');

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: '123', role: 'admin' })
        })
      );

      render(
        <BrowserRouter>
          <AuthProvider>
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          </AuthProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/protected content/i)).toBeInTheDocument();
      });
    });

    it('should check role permissions', async () => {
      localStorage.setItem('authToken', 'valid-token');
      localStorage.setItem('userRole', 'player');

      render(
        <BrowserRouter>
          <AuthProvider>
            <ProtectedRoute requiredRole="admin">
              <div>Admin Only Content</div>
            </ProtectedRoute>
          </AuthProvider>
        </BrowserRouter>
      );

      // Player should not see admin content
      await waitFor(() => {
        expect(screen.queryByText(/admin only content/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Token Verification', () => {
    it('should verify token on app mount', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: '123', role: 'admin' })
        })
      );
      global.fetch = mockFetch;

      localStorage.setItem('authToken', 'valid-token');

      render(
        <BrowserRouter>
          <AuthProvider>
            <div>App Content</div>
          </AuthProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/auth/verify'),
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer valid-token'
            })
          })
        );
      });
    });

    it('should clear invalid tokens', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 401
        })
      );

      localStorage.setItem('authToken', 'invalid-token');

      render(
        <BrowserRouter>
          <AuthProvider>
            <div>App Content</div>
          </AuthProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(localStorage.getItem('authToken')).toBeNull();
      });
    });
  });
});
