'use client'

import { useMutation } from '@tanstack/react-query'
import { useToast } from '../ui/ToastProvider'
import { useQuestions } from '../../contexts/questions-context'
import type { UpdateQuestionPracticeStatusCommand, UpdateQuestionResponseDto } from '../../types'

interface PracticeToggleProps {
  id: string
  practiced: boolean
}

export function PracticeToggle({ id, practiced }: PracticeToggleProps) {
  const { toast } = useToast()
  const { questions, setQuestions } = useQuestions()

  const updatePracticeStatusMutation = useMutation({
    mutationFn: async (practiced: boolean): Promise<UpdateQuestionResponseDto> => {
      const response = await fetch(`/api/questions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ practiced } as UpdateQuestionPracticeStatusCommand),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Musisz być zalogowany')
        }
        if (response.status === 404) {
          throw new Error('Pytanie nie zostało znalezione')
        }
        throw new Error('Nie udało się zaktualizować statusu')
      }

      return response.json()
    },
    onMutate: async (newPracticed) => {
      // Optimistic update
      setQuestions(prevQuestions =>
        prevQuestions.map(q =>
          q.id === id ? { ...q, practiced: newPracticed } : q
        )
      )
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      setQuestions(prevQuestions =>
        prevQuestions.map(q =>
          q.id === id ? { ...q, practiced: !variables } : q
        )
      )
      toast(error.message, 'destructive')
    },
    onSuccess: (data) => {
      // Update with server response to ensure consistency
      setQuestions(prevQuestions =>
        prevQuestions.map(q =>
          q.id === id ? data.data : q
        )
      )
    },
  })

  const handleToggle = () => {
    updatePracticeStatusMutation.mutate(!practiced)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={updatePracticeStatusMutation.isPending}
      className="text-lg font-mono hover:bg-accent hover:text-accent-foreground rounded p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label={practiced ? 'Oznacz jako nieprzećwiczone' : 'Oznacz jako przećwiczone'}
      title={practiced ? 'Oznacz jako nieprzećwiczone' : 'Oznacz jako przećwiczone'}
    >
      {practiced ? '[x]' : '[ ]'}
    </button>
  )
} 