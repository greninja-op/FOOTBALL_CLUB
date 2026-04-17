import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NotificationCenter from './NotificationCenter'

const mockUseAuth = vi.fn()
const mockUseSocket = vi.fn()

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}))

vi.mock('../contexts/SocketContext', () => ({
  useSocket: () => mockUseSocket()
}))

describe('NotificationCenter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', role: 'player' },
      token: 'token'
    })
    mockUseSocket.mockReturnValue({
      events: [],
      socket: null,
      connected: true,
      reconnectAttempts: 0
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('renders nothing when the user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      token: null
    })

    const { container } = render(<NotificationCenter />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the history toggle for authenticated users', () => {
    render(<NotificationCenter />)
    expect(screen.getByLabelText(/toggle notification history/i)).toBeInTheDocument()
  })

  it('displays a toast for the latest incoming event', () => {
    mockUseSocket.mockReturnValue({
      events: [
        {
          type: 'fixture:created',
          data: { opponent: 'Manchester United' },
          timestamp: new Date().toISOString()
        }
      ],
      socket: null,
      connected: true,
      reconnectAttempts: 0
    })

    render(<NotificationCenter />)
    expect(screen.getByText(/new fixture: manchester united/i)).toBeInTheDocument()
  })

  it('auto-dismisses notifications after 5 seconds', () => {
    mockUseSocket.mockReturnValue({
      events: [
        {
          type: 'leave:approved',
          data: {},
          timestamp: new Date().toISOString()
        }
      ],
      socket: null,
      connected: true,
      reconnectAttempts: 0
    })

    render(<NotificationCenter />)
    expect(screen.getByText(/approved/i)).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(screen.queryByText(/approved/i)).not.toBeInTheDocument()
  })

  it('opens the history panel and shows recent events', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    mockUseSocket.mockReturnValue({
      events: [
        {
          type: 'fixture:created',
          data: { opponent: 'Arsenal' },
          timestamp: new Date().toISOString()
        },
        {
          type: 'leave:denied',
          data: {},
          timestamp: new Date().toISOString()
        }
      ],
      socket: null,
      connected: true,
      reconnectAttempts: 0
    })

    render(<NotificationCenter />)

    await act(async () => {
      await user.click(screen.getByLabelText(/toggle notification history/i))
    })

    expect(screen.getByText(/notification history/i)).toBeInTheDocument()
    expect(screen.getAllByText(/just now/i).length).toBeGreaterThan(0)
  })
})
