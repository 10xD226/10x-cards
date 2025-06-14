'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { QuestionDto } from '../types'

interface QuestionsContextValue {
  questions: QuestionDto[]
  setQuestions: React.Dispatch<React.SetStateAction<QuestionDto[]>>
}

const QuestionsContext = createContext<QuestionsContextValue | undefined>(undefined)

interface QuestionsProviderProps {
  children: ReactNode
  initialQuestions?: QuestionDto[]
}

export function QuestionsProvider({ children, initialQuestions = [] }: QuestionsProviderProps) {
  const [questions, setQuestions] = useState<QuestionDto[]>(initialQuestions)

  return (
    <QuestionsContext.Provider value={{ questions, setQuestions }}>
      {children}
    </QuestionsContext.Provider>
  )
}

export function useQuestions() {
  const context = useContext(QuestionsContext)
  if (context === undefined) {
    throw new Error('useQuestions must be used within a QuestionsProvider')
  }
  return context
} 