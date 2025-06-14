import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PracticeToggle } from '../PracticeToggle'
import { QuestionsProvider } from '../../../contexts/questions-context'
import { ToastProvider } from '../../ui/ToastProvider'
import type { QuestionDto } from '../../../types'

// Mock fetch using vi.stubGlobal as per test-rules
vi.stubGlobal('fetch', vi.fn())

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
  const mockFetch = vi.mocked(global.fetch)
  
  beforeEach(() => {
    vi.clearAllMocks()
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

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

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
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response)

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
    mockFetch.mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ success: true, data: mockQuestions[0] }),
      } as Response), 100))
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