import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { SocketProvider, useSocket } from './SocketContext'
import { AuthProvider } from './AuthContext'

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    connected: false,
    id: 'test-socket-id'
  }))
}))

// Test component that uses the socket context
const TestComponent = () => {
  const { socket, connected, events, reconnectAttempts } = useSocket()
  
  return (
    <div>
      <div data-testid="socket-status">{connected ? 'connected' : 'disconnected'}</div>
      <div data-testid="socket-exists">{socket ? 'exists' : 'null'}</div>
      <div data-testid="events-count">{events.length}</div>
      <div data-testid="reconnect-attempts">{reconnectAttempts}</div>
    </div>
  )
}

describe('SocketContext', () => {
  beforeEach(() => {
    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn(() => 'mock-token'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    }

    // Mock fetch for auth verification
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ user: { id: '123', role: 'admin' } })
      })
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should provide socket context values', async () => {
    render(
      <AuthProvider>
        <SocketProvider>
          <TestComponent />
        </SocketProvider>
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('socket-status')).toBeInTheDocument()
    })

    // Initially disconnected
    expect(screen.getByTestId('socket-status').textContent).toBe('disconnected')
    expect(screen.getByTestId('events-count').textContent).toBe('0')
    expect(screen.getByTestId('reconnect-attempts').textContent).toBe('0')
  })

  it('should throw error when useSocket is used outside SocketProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useSocket must be used within a SocketProvider')

    consoleSpy.mockRestore()
  })

  it('should initialize socket when user is authenticated', async () => {
    const { io } = await import('socket.io-client')
    
    render(
      <AuthProvider>
        <SocketProvider>
          <TestComponent />
        </SocketProvider>
      </AuthProvider>
    )

    await waitFor(() => {
      expect(io).toHaveBeenCalled()
    })
  })
})
