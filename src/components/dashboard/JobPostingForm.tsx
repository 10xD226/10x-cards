'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { GenerateQuestionsSchema } from '../../schemas/question'
import { useToast } from '../ui/ToastProvider'
import { useQuestions } from '../../contexts/questions-context'
import type { GenerateQuestionsCommand, GenerateQuestionsResponseDto } from '../../types'
import { cn } from '../../lib/utils'

interface JobPostingFormProps {
  onSuccess: (questions: any[]) => void
}

export function JobPostingForm({ onSuccess }: JobPostingFormProps) {
  const { toast } = useToast()
  const { setQuestions } = useQuestions()

  const form = useForm<GenerateQuestionsCommand>({
    resolver: zodResolver(GenerateQuestionsSchema),
    defaultValues: {
      jobPosting: '',
    },
  })

  const generateQuestionsMutation = useMutation({
    mutationFn: async (data: GenerateQuestionsCommand): Promise<GenerateQuestionsResponseDto> => {
      const response = await fetch('/api/questions/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        if (response.status === 400 || response.status === 422) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Błąd walidacji danych')
        }
        if (response.status === 401) {
          throw new Error('Musisz być zalogowany')
        }
        if (response.status === 429) {
          throw new Error('Spróbuj ponownie za chwilę')
        }
        throw new Error('Coś poszło nie tak')
      }

      return response.json()
    },
    onSuccess: (data) => {
      toast('Pomyślnie wygenerowano 5 nowych pytań!', 'success')
      setQuestions(prevQuestions => [...data.data, ...prevQuestions])
      onSuccess(data.data)
      form.reset()
      
      // Scroll to questions section
      setTimeout(() => {
        const questionsSection = document.querySelector('[data-questions-section]')
        if (questionsSection) {
          questionsSection.scrollIntoView({ behavior: 'smooth' })
          // Focus on first question for accessibility
          const firstQuestion = questionsSection.querySelector('button')
          if (firstQuestion) {
            firstQuestion.focus()
          }
        }
      }, 100)
    },
    onError: (error) => {
      toast(error.message, 'destructive')
    },
  })

  const onSubmit = (data: GenerateQuestionsCommand) => {
    generateQuestionsMutation.mutate(data)
  }

  const jobPostingValue = form.watch('jobPosting')
  const charCount = jobPostingValue.length
  const isCharCountValid = charCount >= 100 && charCount <= 10000
  const isGenerating = generateQuestionsMutation.isPending

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="jobPosting" className="text-sm font-medium">
          Ogłoszenie o pracę
        </label>
        <div className="relative">
          <textarea
            id="jobPosting"
            {...form.register('jobPosting')}
            className={cn(
              'w-full min-h-[200px] px-3 py-2 border rounded-md resize-vertical',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              form.formState.errors.jobPosting && 'border-red-500'
            )}
            placeholder="Wklej tutaj ogłoszenie o pracę (minimum 100 znaków)..."
            disabled={isGenerating}
          />
          {isGenerating && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md">
              <div className="text-center">
                <div className="text-2xl mb-2">⚡</div>
                <p className="text-sm text-muted-foreground">Generuję pytania...</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center text-xs">
          <div>
            {form.formState.errors.jobPosting && (
              <span className="text-red-500">
                {form.formState.errors.jobPosting.message}
              </span>
            )}
          </div>
          <span className={cn(
            'font-mono',
            isCharCountValid ? 'text-green-600' : 'text-red-500'
          )}>
            {charCount}/10000
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!form.formState.isValid || isGenerating || !isCharCountValid}
        className={cn(
          'w-full py-2 px-4 rounded-md font-medium transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          (!form.formState.isValid || isGenerating || !isCharCountValid)
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        )}
      >
        {isGenerating ? 'Generuję...' : 'Generuj 5 pytań'}
      </button>
    </form>
  )
} 