import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import FixtureCalendar from './FixtureCalendar'

const mockUseAuth = vi.fn()
const mockUseSocket = vi.fn()

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}))

vi.mock('../contexts/SocketContext', () => ({
  useSocket: () => mockUseSocket()
}))

describe('FixtureCalendar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      token: 'mock-token',
      user: { id: '123', role: 'manager' }
    })
    mockUseSocket.mockReturnValue({
      socket: null,
      events: []
    })

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        fixtures: [],
        pagination: { total: 0, page: 1, limit: 50, pages: 0 }
      })
    })
  })

  it('renders fixture calendar and create button', async () => {
    render(<FixtureCalendar />)

    await waitFor(() => {
      expect(screen.getByText(/fixture calendar/i)).toBeInTheDocument()
      expect(screen.getAllByText(/create fixture/i).length).toBeGreaterThan(0)
    })
  })

  it('opens the create fixture modal', async () => {
    render(<FixtureCalendar />)

    await waitFor(() => {
      expect(screen.getByText(/fixture calendar/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getAllByText(/create fixture/i)[0])

    expect(screen.getByText(/opponent/i)).toBeInTheDocument()
    expect(screen.getByText(/location/i)).toBeInTheDocument()
  })

  it('blocks submission when required fields are invalid', async () => {
    render(<FixtureCalendar />)

    await waitFor(() => {
      expect(screen.getByText(/fixture calendar/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getAllByText(/create fixture/i)[0])

    fireEvent.change(screen.getByPlaceholderText(/enter opponent name/i), {
      target: { value: 'Test Team' }
    })

    fireEvent.click(screen.getAllByText(/create fixture/i)[1])

    await waitFor(() => {
      expect(screen.getAllByText(/create fixture/i).length).toBeGreaterThan(1)
    })

    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('renders existing fixtures from the API', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        fixtures: [
          {
            id: 'fixture-1',
            opponent: 'Liverpool',
            date: new Date().toISOString(),
            location: 'Anfield',
            matchType: 'League',
            lineup: []
          }
        ]
      })
    })

    render(<FixtureCalendar />)

    await waitFor(() => {
      expect(screen.getByText(/vs liverpool/i)).toBeInTheDocument()
      expect(screen.getByText(/anfield/i)).toBeInTheDocument()
    })
  })
})
