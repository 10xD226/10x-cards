'use client'

import type { QuestionDto } from '../../types'
import { PracticeToggle } from './PracticeToggle'

interface QuestionItemProps {
  question: QuestionDto
}

export function QuestionItem({ question }: QuestionItemProps) {
  return (
    <article className="flex items-start space-x-3 p-4 border rounded-lg bg-card">
      <div className="flex-shrink-0 pt-1">
        <PracticeToggle id={question.id} practiced={question.practiced} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-relaxed break-words">
          {question.content}
        </p>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span>
            Utworzone: {new Date(question.created_at).toLocaleDateString('pl-PL')}
          </span>
          <span>
            Pozycja: #{question.position}
          </span>
        </div>
      </div>
    </article>
  )
} 