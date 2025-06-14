import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { QuestionsProvider, useQuestions } from '../questions-context'
import type { QuestionDto } from '../../types'

const mockQuestions: QuestionDto[] = [
  {
    id: '1',
    content: 'Test question 1',
    practiced: false,
    created_at: '2024-01-01T00:00:00Z',
    position: 1,
  },
  {
    id: '2',
    content: 'Test question 2',
    practiced: true,
    created_at: '2024-01-01T00:00:00Z',
    position: 2,
  },
]

function TestComponent() {
  const { questions, setQuestions } = useQuestions()
  
  return (
    <div>
      <div data-testid="questions-count">{questions.length}</div>
      <button 
        onClick={() => setQuestions(prev => [...prev, {
          id: '3',
          content: 'New question',
          practiced: false,
          created_at: '2024-01-01T00:00:00Z',
          position: 3,
        }])}
        data-testid="add-question"
      >
        Add Question
      </button>
      {questions.map(q => (
        <div key={q.id} data-testid={`question-${q.id}`}>
          {q.content}
        </div>
      ))}
    </div>
  )
}

describe('QuestionsContext', () => {
  it('provides initial questions to children', () => {
    render(
      <QuestionsProvider initialQuestions={mockQuestions}>
        <TestComponent />
      </QuestionsProvider>
    )

    expect(screen.getByTestId('questions-count')).toHaveTextContent('2')
    expect(screen.getByTestId('question-1')).toHaveTextContent('Test question 1')
    expect(screen.getByTestId('question-2')).toHaveTextContent('Test question 2')
  })

  it('allows updating questions state', () => {
    render(
      <QuestionsProvider initialQuestions={mockQuestions}>
        <TestComponent />
      </QuestionsProvider>
    )

    act(() => {
      screen.getByTestId('add-question').click()
    })

    expect(screen.getByTestId('questions-count')).toHaveTextContent('3')
    expect(screen.getByTestId('question-3')).toHaveTextContent('New question')
  })

  it('throws error when useQuestions is used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useQuestions must be used within a QuestionsProvider')

    consoleSpy.mockRestore()
  })

  it('provides empty array when no initial questions', () => {
    render(
      <QuestionsProvider>
        <TestComponent />
      </QuestionsProvider>
    )

    expect(screen.getByTestId('questions-count')).toHaveTextContent('0')
  })
}) 