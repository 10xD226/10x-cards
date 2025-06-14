'use client'

import { useQuestions } from '../../contexts/questions-context'
import { QuestionItem } from './QuestionItem'

export function QuestionsList() {
  const { questions } = useQuestions()

  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Nie masz jeszcze żadnych pytań. Wygeneruj swoje pierwsze pytania powyżej!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3" data-questions-section>
      {questions.map((question) => (
        <QuestionItem key={question.id} question={question} />
      ))}
    </div>
  )
} 