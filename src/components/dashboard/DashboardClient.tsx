'use client'

import { QuestionsProvider } from '../../contexts/questions-context'
import { JobPostingForm } from './JobPostingForm'
import { QuestionsList } from './QuestionsList'
import type { QuestionDto } from '../../types'

interface DashboardClientProps {
  initialQuestions: QuestionDto[]
}

export function DashboardClient({ initialQuestions }: DashboardClientProps) {
  const handleGenerateSuccess = (questions: QuestionDto[]) => {
    console.log('Generated questions:', questions)
  }

  return (
    <QuestionsProvider initialQuestions={initialQuestions}>
      <div className="space-y-8">
        <section className="space-y-4" aria-labelledby="generate-section">
          <h2 id="generate-section" className="text-2xl font-bold">Generuj pytania rekrutacyjne</h2>
          <div className="rounded-lg border p-6">
            <div className="mb-4">
              <p className="text-muted-foreground">
                Wklej tutaj ogłoszenie o pracę, a system wygeneruje dla Ciebie 5 dopasowanych pytań rekrutacyjnych.
              </p>
            </div>
            <JobPostingForm onSuccess={handleGenerateSuccess} />
          </div>
        </section>

        <section className="space-y-4" aria-labelledby="questions-section">
          <h2 id="questions-section" className="text-2xl font-bold">Twoje pytania</h2>
          <div className="rounded-lg border p-6">
            <QuestionsList />
          </div>
        </section>
      </div>
    </QuestionsProvider>
  )
} 