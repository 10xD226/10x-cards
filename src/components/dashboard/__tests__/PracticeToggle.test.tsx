import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PracticeToggle } from '../PracticeToggle'
import { QuestionsProvider } from '../../../contexts/questions-context'
import { ToastProvider } from '../../ui/ToastProvider'
import type { QuestionDto } from '../../../types'

// Mock fetch
global.fetch = jest.fn()

const mockQuestions: QuestionDto[] = [
  {
    id: 'test-id',
    content: 'Test question',
    practiced: false,
    created_at: '2024-01-01T00:00:00Z',
    position: 1,
  },
]

function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <QuestionsProvider initialQuestions={mockQuestions}>
          {children}
        </QuestionsProvider>
      </ToastProvider>
    </QueryClientProvider>
  )
}

describe('PracticeToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with correct initial state', () => {
    render(
      <TestWrapper>
        <PracticeToggle id="test-id" practiced={false} />
      </TestWrapper>
    )

    const toggleButton = screen.getByRole('button')
    expect(toggleButton).toHaveTextContent('[ ]')
    expect(toggleButton).toHaveAttribute('aria-label', 'Oznacz jako przećwiczone')
  })

  it('renders practiced state correctly', () => {
    render(
      <TestWrapper>
        <PracticeToggle id="test-id" practiced={true} />
      </TestWrapper>
    )

    const toggleButton = screen.getByRole('button')
    expect(toggleButton).toHaveTextContent('[x]')
    expect(toggleButton).toHaveAttribute('aria-label', 'Oznacz jako nieprzećwiczone')
  })

  it('handles successful toggle', async () => {
    const mockResponse = {
      success: true,
      data: {
        id: 'test-id',
        content: 'Test question',
        practiced: true,
        created_at: '2024-01-01T00:00:00Z',
        position: 1,
      },
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(
      <TestWrapper>
        <PracticeToggle id="test-id" practiced={false} />
      </TestWrapper>
    )

    const toggleButton = screen.getByRole('button')
    fireEvent.click(toggleButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/questions/test-id', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ practiced: true }),
      })
    })
  })

  it('handles API error', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    })

    render(
      <TestWrapper>
        <PracticeToggle id="test-id" practiced={false} />
      </TestWrapper>
    )

    const toggleButton = screen.getByRole('button')
    fireEvent.click(toggleButton)

    await waitFor(() => {
      expect(screen.getByText('Pytanie nie zostało znalezione')).toBeInTheDocument()
    })
  })

  it('disables button during mutation', async () => {
    // Mock a slow response
    ;(global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ success: true, data: mockQuestions[0] }),
      }), 100))
    )

    render(
      <TestWrapper>
        <PracticeToggle id="test-id" practiced={false} />
      </TestWrapper>
    )

    const toggleButton = screen.getByRole('button')
    fireEvent.click(toggleButton)

    expect(toggleButton).toBeDisabled()

    await waitFor(() => {
      expect(toggleButton).not.toBeDisabled()
    })
  })
}) 