/**
 * Unit tests for OpenAI service
 * Tests question generation functionality with mocked OpenAI API responses and demo mode
 */

import { jest } from '@jest/globals'

// Mock OpenAI before importing the service
jest.mock('openai', () => ({
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  })),
  APIError: class extends Error {
    status: number
    constructor(message: string, status: number = 500) {
      super(message)
      this.status = status
    }
  },
}))

import OpenAI from 'openai'
import { openaiService } from '../openai'

const mockCreate = jest.fn()
;(OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
  chat: {
    completions: {
      create: mockCreate,
    },
  },
} as any))

describe('OpenAI Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Clear environment variables
    delete process.env.OPENAI_API_KEY
    delete process.env.NEXT_PUBLIC_DEMO_MODE
  })

  describe('Demo Mode', () => {
    it('should enter demo mode when NEXT_PUBLIC_DEMO_MODE is true', () => {
      // Arrange
      process.env.NEXT_PUBLIC_DEMO_MODE = 'true'
      process.env.OPENAI_API_KEY = 'test-key'
      
      // Act
      const { OpenAIService } = require('../openai')
      const service = new OpenAIService()
      
      // Assert
      expect(service.isInDemoMode).toBe(true)
    })

    it('should enter demo mode when OPENAI_API_KEY is not set', () => {
      // Act
      const { OpenAIService } = require('../openai')
      const service = new OpenAIService()
      
      // Assert
      expect(service.isInDemoMode).toBe(true)
    })

    it('should NOT be in demo mode when API key is set and demo mode is false', () => {
      // Arrange
      process.env.OPENAI_API_KEY = 'test-key'
      process.env.NEXT_PUBLIC_DEMO_MODE = 'false'
      
      // Act
      const { OpenAIService } = require('../openai')
      const service = new OpenAIService()
      
      // Assert
      expect(service.isInDemoMode).toBe(false)
    })

    it('should generate mock questions in demo mode for English job posting', async () => {
      // Arrange
      process.env.NEXT_PUBLIC_DEMO_MODE = 'true'
      const { OpenAIService } = require('../openai')
      const service = new OpenAIService()
      
      const englishJobPosting = `
        Senior Frontend Developer
        We are looking for a skilled React developer with 3+ years of experience.
        Requirements: JavaScript, TypeScript, React, Node.js, Git.
      `.trim()

      // Act
      const result = await service.generateQuestions(englishJobPosting)

      // Assert
      expect(result).toHaveLength(5)
      expect(result.every((q: string) => typeof q === 'string' && q.length >= 20)).toBe(true)
      // Should contain English mock questions
      expect(result.some((q: string) => q.includes('experience'))).toBe(true)
    })

    it('should generate mock questions in demo mode for Polish job posting', async () => {
      // Arrange
      process.env.NEXT_PUBLIC_DEMO_MODE = 'true'
      const { OpenAIService } = require('../openai')
      const service = new OpenAIService()
      
      const polishJobPosting = `
        Senior Frontend Developer
        Szukamy doświadczonego programisty React z doświadczeniem 3+ lat.
        Wymagania: JavaScript, TypeScript, React, Node.js, Git.
        Praca zdalna, konkurencyjne wynagrodzenie.
      `.trim()

      // Act
      const result = await service.generateQuestions(polishJobPosting)

      // Assert
      expect(result).toHaveLength(5)
      expect(result.every((q: string) => typeof q === 'string' && q.length >= 20)).toBe(true)
      // Should contain Polish mock questions
      expect(result.some((q: string) => q.includes('doświadczeniu') || q.includes('technologiami'))).toBe(true)
    })

    it('should generate mock questions in demo mode for German job posting', async () => {
      // Arrange
      process.env.NEXT_PUBLIC_DEMO_MODE = 'true'
      const { OpenAIService } = require('../openai')
      const service = new OpenAIService()
      
      const germanJobPosting = `
        Senior Frontend Entwickler
        Wir suchen einen erfahrenen React Entwickler mit 3+ Jahren Erfahrung.
        Anforderungen: JavaScript, TypeScript, React, Node.js, Git.
        Remote Arbeit, wettbewerbsfähiges Gehalt.
      `.trim()

      // Act
      const result = await service.generateQuestions(germanJobPosting)

      // Assert
      expect(result).toHaveLength(5)
      expect(result.every((q: string) => typeof q === 'string' && q.length >= 20)).toBe(true)
      // Should contain German mock questions
      expect(result.some((q: string) => q.includes('Erfahrung') || q.includes('Technologien'))).toBe(true)
    })

    it('should simulate realistic delay in demo mode', async () => {
      // Arrange
      process.env.NEXT_PUBLIC_DEMO_MODE = 'true'
      const { OpenAIService } = require('../openai')
      const service = new OpenAIService()
      
      const jobPosting = 'Test job posting'
      const startTime = Date.now()

      // Act
      await service.generateQuestions(jobPosting)
      const endTime = Date.now()

      // Assert
      const duration = endTime - startTime
      expect(duration).toBeGreaterThan(1000) // At least 1 second delay
      expect(duration).toBeLessThan(5000)    // But not too long for tests
    })

    it('should use simple language detection in demo mode', async () => {
      // Arrange
      process.env.NEXT_PUBLIC_DEMO_MODE = 'true'
      const { OpenAIService } = require('../openai')
      const service = new OpenAIService()

      // Act
      const englishLanguage = await service.detectLanguage('Hello world, this is an English text.')
      const polishLanguage = await service.detectLanguage('Praca w zespole programistów.')
      const germanLanguage = await service.detectLanguage('Arbeit mit erfahrenen Entwicklern.')

      // Assert
      expect(englishLanguage).toBe('en')
      expect(polishLanguage).toBe('pl')
      expect(germanLanguage).toBe('de')
    })
  })

  describe('Production Mode (with API key)', () => {
    beforeEach(() => {
      // Set up production mode
      process.env.OPENAI_API_KEY = 'test-api-key'
      process.env.NEXT_PUBLIC_DEMO_MODE = 'false'
    })

    const mockJobPosting = `
      Senior Frontend Developer
      We are looking for a skilled React developer with 3+ years of experience.
      Requirements: JavaScript, TypeScript, React, Node.js, Git.
      Responsibilities: Build user interfaces, work with APIs, collaborate with team.
      Benefits: Remote work, competitive salary, health insurance.
    `.trim()

    it('should generate exactly 5 questions from job posting using OpenAI API', async () => {
      // Arrange
      const mockQuestions = [
        'Can you describe your experience with React hooks?',
        'How do you handle state management in large React applications?', 
        'What is your approach to testing React components?',
        'How do you ensure your code is accessible and follows best practices?',
        'Can you walk me through how you would optimize a React app for performance?'
      ]

      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: mockQuestions.join('\n')
            }
          }
        ]
      })

      // Recreate service for production mode
      delete require.cache[require.resolve('../openai')]
      const { openaiService: prodService } = require('../openai')

      // Act
      const result = await prodService.generateQuestions(mockJobPosting)

      // Assert
      expect(result).toHaveLength(5)
      expect(result).toEqual(mockQuestions)
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-3.5-turbo',
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system',
              content: expect.stringContaining('Generate EXACTLY 5 questions')
            }),
            expect.objectContaining({
              role: 'user', 
              content: expect.stringContaining(mockJobPosting)
            })
          ]),
          temperature: 0.7,
          max_tokens: 1000,
        }),
        expect.objectContaining({
          timeout: 12000
        })
      )
    })

    it('should handle OpenAI API errors properly', async () => {
      // Arrange
      const apiError = new (OpenAI as any).APIError('API key invalid', 401)
      mockCreate.mockRejectedValue(apiError)

      // Recreate service for production mode
      delete require.cache[require.resolve('../openai')]
      const { openaiService: prodService } = require('../openai')

      // Act & Assert
      await expect(prodService.generateQuestions(mockJobPosting))
        .rejects
        .toThrow('Invalid OpenAI API key')
    })

    it('should handle rate limit errors', async () => {
      // Arrange
      const rateLimitError = new (OpenAI as any).APIError('Rate limit exceeded', 429)
      mockCreate.mockRejectedValue(rateLimitError)

      // Recreate service for production mode
      delete require.cache[require.resolve('../openai')]
      const { openaiService: prodService } = require('../openai')

      // Act & Assert
      await expect(prodService.generateQuestions(mockJobPosting))
        .rejects
        .toThrow('OpenAI API rate limit exceeded')
    })

    it('should validate generated questions quality', async () => {
      // Arrange - Questions that are too short
      const invalidQuestions = [
        'Hi?',
        'What?', 
        'How?',
        'Why?',
        'When?'
      ]

      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: invalidQuestions.join('\n')
            }
          }
        ]
      })

      // Recreate service for production mode
      delete require.cache[require.resolve('../openai')]
      const { openaiService: prodService } = require('../openai')

      // Act & Assert
      await expect(prodService.generateQuestions(mockJobPosting))
        .rejects
        .toThrow('Generated questions do not meet quality requirements')
    })

    it('should handle empty OpenAI response', async () => {
      // Arrange
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: ''
            }
          }
        ]
      })

      // Recreate service for production mode
      delete require.cache[require.resolve('../openai')]
      const { openaiService: prodService } = require('../openai')

      // Act & Assert
      await expect(prodService.generateQuestions(mockJobPosting))
        .rejects
        .toThrow('OpenAI returned empty response')
    })

    it('should handle response with wrong number of questions', async () => {
      // Arrange - Only 3 questions instead of 5
      const incompleteQuestions = [
        'Can you describe your React experience?',
        'How do you handle state management?',
        'What is your testing approach?'
      ]

      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: incompleteQuestions.join('\n')
            }
          }
        ]
      })

      // Recreate service for production mode
      delete require.cache[require.resolve('../openai')]
      const { openaiService: prodService } = require('../openai')

      // Act & Assert
      await expect(prodService.generateQuestions(mockJobPosting))
        .rejects
        .toThrow('Generated questions do not meet quality requirements')
    })

    it('should detect language correctly using OpenAI API', async () => {
      // Arrange
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: 'en'
            }
          }
        ]
      })

      // Recreate service for production mode
      delete require.cache[require.resolve('../openai')]
      const { openaiService: prodService } = require('../openai')

      // Act
      const result = await prodService.detectLanguage('Hello world, this is an English text.')

      // Assert
      expect(result).toBe('en')
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-3.5-turbo',
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system',
              content: expect.stringContaining('Detect the language')
            })
          ]),
          temperature: 0,
          max_tokens: 10,
        })
      )
    })

    it('should default to English on detection failure', async () => {
      // Arrange
      mockCreate.mockRejectedValue(new Error('API failure'))

      // Recreate service for production mode  
      delete require.cache[require.resolve('../openai')]
      const { openaiService: prodService } = require('../openai')

      // Act
      const result = await prodService.detectLanguage('Some text')

      // Assert
      expect(result).toBe('en')
    })
  })
}) 