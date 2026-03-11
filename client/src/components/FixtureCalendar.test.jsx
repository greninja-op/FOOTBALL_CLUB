import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import FixtureCalendar from './FixtureCalendar'
import { AuthProvider } from '../contexts/AuthContext'

// Mock the AuthContext
vi.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    token: 'mock-token',
    user: { id: '123', role: 'manager' }
  })
}))

// Mock fetch
global.fetch = vi.fn()

describe('FixtureCalendar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock successful fixtures fetch
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        fixtures: [],
        pagination: { total: 0, page: 1, limit: 50, pages: 0 }
      })
    })
  })

  it('renders fixture calendar with create button', async () => {
    render(<FixtureCalendar />)
    
    await waitFor(() => {
      expect(screen.getByText('Fixture Calendar')).toBeInTheDocument()
      expect(screen.getByText('Create Fixture')).toBeInTheDocument()
    })
  })

  it('opens create fixture modal when button is clicked', async () => {
    render(<FixtureCalendar />)
    
    await waitFor(() => {
      expect(screen.getByText('Create Fixture')).toBeInTheDocument()
    })

    const createButton = screen.getByText('Create Fixture')
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByText('Opponent')).toBeInTheDocument()
      expect(screen.getByText('Date')).toBeInTheDocument()
      expect(screen.getByText('Location')).toBeInTheDocument()
      expect(screen.getByText('Match Type')).toBeInTheDocument()
    })
  })

  it('validates that date cannot be in the past', async () => {
    render(<FixtureCalendar />)
    
    await waitFor(() => {
      expect(screen.getByText('Create Fixture')).toBeInTheDocument()
    })

    // Open modal
    const createButton = screen.getByText('Create Fixture')
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByLabelText(/Opponent/)).toBeInTheDocument()
    })

    // Fill in form with past date
    const opponentInput = screen.getByLabelText(/Opponent/)
    const dateInput = screen.getByLabelText(/Date/)
    const locationInput = screen.getByLabelText(/Location/)

    fireEvent.change(opponentInput, { target: { value: 'Test Team' } })
    
    // Set date to yesterday
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const pastDate = yesterday.toISOString().slice(0, 16)
    
    fireEvent.change(dateInput, { target: { value: pastDate } })
    fireEvent.change(locationInput, { target: { value: 'Test Stadium' } })

    // Submit form
    const submitButton = screen.getByText('Create Fixture')
    fireEvent.click(submitButton)

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText('Fixture date cannot be in the past')).toBeInTheDocument()
    })

    // Verify fetch was not called
    expect(global.fetch).toHaveBeenCalledTimes(1) // Only the initial fixtures fetch
  })

  it('validates required fields', async () => {
    render(<FixtureCalendar />)
    
    await waitFor(() => {
      expect(screen.getByText('Create Fixture')).toBeInTheDocument()
    })

    // Open modal
    const createButton = screen.getByText('Create Fixture')
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByLabelText(/Opponent/)).toBeInTheDocument()
    })

    // Submit form without filling fields
    const submitButton = screen.getByText('Create Fixture')
    fireEvent.click(submitButton)

    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText('Opponent is required')).toBeInTheDocument()
      expect(screen.getByText('Date is required')).toBeInTheDocument()
      expect(screen.getByText('Location is required')).toBeInTheDocument()
    })
  })

  it('successfully creates fixture with valid data', async () => {
    // Mock successful fixture creation
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/fixtures') && url.split('?')[0].endsWith('/api/fixtures')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            fixtures: [],
            pagination: { total: 0, page: 1, limit: 50, pages: 0 }
          })
        })
      }
      // POST request
      return Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Fixture created successfully',
          fixture: {
            id: '123',
            opponent: 'Test Team',
            date: new Date().toISOString(),
            location: 'Test Stadium',
            matchType: 'League'
          }
        })
      })
    })

    render(<FixtureCalendar />)
    
    await waitFor(() => {
      expect(screen.getByText('Create Fixture')).toBeInTheDocument()
    })

    // Open modal
    const createButton = screen.getByText('Create Fixture')
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByLabelText(/Opponent/)).toBeInTheDocument()
    })

    // Fill in form with valid future date
    const opponentInput = screen.getByLabelText(/Opponent/)
    const dateInput = screen.getByLabelText(/Date/)
    const locationInput = screen.getByLabelText(/Location/)

    fireEvent.change(opponentInput, { target: { value: 'Test Team' } })
    
    // Set date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const futureDate = tomorrow.toISOString().slice(0, 16)
    
    fireEvent.change(dateInput, { target: { value: futureDate } })
    fireEvent.change(locationInput, { target: { value: 'Test Stadium' } })

    // Submit form
    const submitButton = screen.getByText('Create Fixture')
    fireEvent.click(submitButton)

    // Wait for success toast
    await waitFor(() => {
      expect(screen.getByText('Fixture created successfully')).toBeInTheDocument()
    })
  })

  it('displays fixtures in calendar view', async () => {
    const mockFixtures = [
      {
        id: '1',
        opponent: 'Team A',
        date: new Date('2024-12-25T15:00:00').toISOString(),
        location: 'Stadium A',
        matchType: 'League',
        lineup: []
      },
      {
        id: '2',
        opponent: 'Team B',
        date: new Date('2024-12-30T18:00:00').toISOString(),
        location: 'Stadium B',
        matchType: 'Cup',
        lineup: []
      }
    ]

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        fixtures: mockFixtures,
        pagination: { total: 2, page: 1, limit: 50, pages: 1 }
      })
    })

    render(<FixtureCalendar />)
    
    await waitFor(() => {
      expect(screen.getByText('vs Team A')).toBeInTheDocument()
      expect(screen.getByText('vs Team B')).toBeInTheDocument()
      expect(screen.getByText('Stadium A')).toBeInTheDocument()
      expect(screen.getByText('Stadium B')).toBeInTheDocument()
      expect(screen.getByText('League')).toBeInTheDocument()
      expect(screen.getByText('Cup')).toBeInTheDocument()
    })
  })

  it('shows error toast when fixture creation fails', async () => {
    global.fetch.mockImplementation((url, options) => {
      if (options?.method === 'POST') {
        return Promise.resolve({
          ok: false,
          json: async () => ({
            success: false,
            message: 'Failed to create fixture'
          })
        })
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          fixtures: [],
          pagination: { total: 0, page: 1, limit: 50, pages: 0 }
        })
      })
    })

    render(<FixtureCalendar />)
    
    await waitFor(() => {
      expect(screen.getByText('Create Fixture')).toBeInTheDocument()
    })

    // Open modal
    const createButton = screen.getByText('Create Fixture')
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByLabelText(/Opponent/)).toBeInTheDocument()
    })

    // Fill in form with valid data
    const opponentInput = screen.getByLabelText(/Opponent/)
    const dateInput = screen.getByLabelText(/Date/)
    const locationInput = screen.getByLabelText(/Location/)

    fireEvent.change(opponentInput, { target: { value: 'Test Team' } })
    
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const futureDate = tomorrow.toISOString().slice(0, 16)
    
    fireEvent.change(dateInput, { target: { value: futureDate } })
    fireEvent.change(locationInput, { target: { value: 'Test Stadium' } })

    // Submit form
    const submitButton = screen.getByText('Create Fixture')
    fireEvent.click(submitButton)

    // Wait for error toast
    await waitFor(() => {
      expect(screen.getByText('Failed to create fixture')).toBeInTheDocument()
    })
  })
})
