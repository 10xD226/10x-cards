/**
 * Unit tests for OpenAI service
 * Tests question generation functionality with mocked OpenAI API responses
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
    // Set environment variable for tests
    process.env.OPENAI_API_KEY = 'test-api-key'
  })

  afterEach(() => {
    delete process.env.OPENAI_API_KEY
  })

  describe('generateQuestions', () => {
    const mockJobPosting = `
      Senior Frontend Developer
      We are looking for a skilled React developer with 3+ years of experience.
      Requirements: JavaScript, TypeScript, React, Node.js, Git.
      Responsibilities: Build user interfaces, work with APIs, collaborate with team.
      Benefits: Remote work, competitive salary, health insurance.
    `.trim()

    it('should generate exactly 5 questions from job posting', async () => {
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

      // Act
      const result = await openaiService.generateQuestions(mockJobPosting)

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

      // Act & Assert
      await expect(openaiService.generateQuestions(mockJobPosting))
        .rejects
        .toThrow('Invalid OpenAI API key')
    })

    it('should handle rate limit errors', async () => {
      // Arrange
      const rateLimitError = new (OpenAI as any).APIError('Rate limit exceeded', 429)
      mockCreate.mockRejectedValue(rateLimitError)

      // Act & Assert
      await expect(openaiService.generateQuestions(mockJobPosting))
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

      // Act & Assert
      await expect(openaiService.generateQuestions(mockJobPosting))
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

      // Act & Assert
      await expect(openaiService.generateQuestions(mockJobPosting))
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

      // Act & Assert
      await expect(openaiService.generateQuestions(mockJobPosting))
        .rejects
        .toThrow('Generated questions do not meet quality requirements')
    })
  })

  describe('detectLanguage', () => {
    it('should detect language correctly', async () => {
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

      // Act
      const result = await openaiService.detectLanguage('Hello world, this is an English text.')

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

      // Act
      const result = await openaiService.detectLanguage('Some text')

      // Assert
      expect(result).toBe('en')
    })
  })

  describe('constructor', () => {
    it('should throw error when API key is missing', () => {
      // Arrange
      delete process.env.OPENAI_API_KEY

      // Act & Assert
      expect(() => {
        // Create new instance to test constructor
        const { OpenAIService } = require('../openai')
        new OpenAIService()
      }).toThrow('OPENAI_API_KEY environment variable is not set')
    })
  })
}) 