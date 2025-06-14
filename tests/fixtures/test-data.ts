/**
 * Test Data Fixtures for E2E Tests
 * Prepared data for complete interview flow testing
 */

import type { QuestionDto, GenerateQuestionsResponseDto } from '../../src/types'

export const TEST_JOB_POSTINGS = {
  SENIOR_FRONTEND: `Senior Frontend Developer - React/TypeScript
  
Jesteśmy dynamiczną firmą technologiczną poszukującą doświadczonego Frontend Developera do naszego zespołu.

Wymagania:
- Minimum 3 lata doświadczenia z React
- Bardzo dobra znajomość TypeScript
- Doświadczenie z Next.js
- Znajomość nowoczesnych narzędzi do zarządzania stanem (Redux, Zustand)
- Umiejętność pisania testów (Jest, React Testing Library)
- Znajomość Git i workflow z pull requestami
- Znajomość języka angielskiego min. B2

Główne obowiązki:
- Rozwój i utrzymanie aplikacji React
- Współpraca z zespołem designu i backendu
- Pisanie czystego, testowalnego kodu
- Uczestnictwo w code review
- Mentoring młodszych developerów
- Optymalizacja wydajności aplikacji

Oferujemy:
- Konkurencyjne wynagrodzenie (12,000 - 18,000 PLN netto)
- Praca zdalna lub hybrydowa
- Elastyczne godziny pracy
- Budżet na rozwój (4,000 PLN rocznie)
- Prywatna opieka medyczna
- Dopłaty do sportu
- Świetny zespół i atmosfera pracy

Proces rekrutacyjny:
1. Rozmowa telefoniczna z HR (30 min)
2. Zadanie techniczne (take-home)
3. Rozmowa techniczna z zespołem (60 min)
4. Rozmowa z CTO (30 min)`.trim(),

  FULL_STACK: `Full Stack Developer - Node.js/React

Poszukujemy Full Stack Developera do pracy przy innowacyjnych projektach e-commerce.

Technologie:
- Node.js, Express.js
- React, Next.js
- PostgreSQL, MongoDB  
- Docker, AWS
- GraphQL/REST API

Doświadczenie:
- 2+ lata commercial experience
- Znajomość architektur mikrousług
- Doświadczenie z bazami danych
- Podstawy DevOps

Oferujemy atrakcyjne warunki pracy w młodym zespole.`.trim()
}

export const MOCK_QUESTIONS: QuestionDto[] = [
  {
    id: 'q1-test-id',
    content: 'Opowiedz o swoim doświadczeniu z React i TypeScript. Jakie projekty realizowałeś?',
    practiced: false,
    created_at: '2024-01-01T00:00:00Z',
    position: 1,
  },
  {
    id: 'q2-test-id', 
    content: 'Jak podchodzisz do zarządzania stanem w aplikacjach React? Porównaj Redux i Zustand.',
    practiced: false,
    created_at: '2024-01-01T00:00:00Z',
    position: 2,
  },
  {
    id: 'q3-test-id',
    content: 'Opisz swoje doświadczenie z testowaniem aplikacji frontendowych. Jakie narzędzia używasz?',
    practiced: false,
    created_at: '2024-01-01T00:00:00Z',
    position: 3,
  },
  {
    id: 'q4-test-id',
    content: 'Jakie są główne zalety TypeScript w projektach React? Podaj konkretne przykłady.',
    practiced: false,
    created_at: '2024-01-01T00:00:00Z',
    position: 4,
  },
  {
    id: '5-test-id',
    content: 'Opisz proces optymalizacji wydajności aplikacji React. Na co zwracasz uwagę?',
    practiced: false,
    created_at: '2024-01-01T00:00:00Z',
    position: 5,
  }
]

export const MOCK_GENERATE_RESPONSE: GenerateQuestionsResponseDto = {
  success: true,
  data: MOCK_QUESTIONS,
  message: 'Pomyślnie wygenerowano 5 pytań rekrutacyjnych'
}

export const MOCK_PRACTICED_QUESTION: QuestionDto = {
  ...MOCK_QUESTIONS[0],
  practiced: true
}

export const MOCK_PRACTICE_TOGGLE_RESPONSE = {
  success: true,
  data: MOCK_PRACTICED_QUESTION,
  message: 'Status pytania został zaktualizowany'
}

export const TEST_USER = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    avatar_url: 'https://github.com/test-user.png',
    full_name: 'Test User',
    user_name: 'test-user'
  }
}

export const MOCK_SESSION = {
  access_token: 'mock-access-token',
  user: TEST_USER
} 