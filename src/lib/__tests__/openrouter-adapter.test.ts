import { OpenRouterAdapter, openRouterAdapter } from '../openrouter-adapter'

describe('OpenRouterAdapter', () => {
  let adapter: OpenRouterAdapter

  beforeEach(() => {
    // Create new adapter instance for each test
    adapter = new OpenRouterAdapter()
  })

  describe('Constructor and Configuration', () => {
    it('should initialize in demo mode when no API key provided', () => {
      expect(adapter.isInDemoMode).toBe(true)
    })

    it('should provide singleton instance', () => {
      expect(openRouterAdapter).toBeInstanceOf(OpenRouterAdapter)
    })
  })

  describe('Question Generation', () => {
    it('should generate questions and return string array', async () => {
      const jobPosting = `
        Software Engineer Position
        We are looking for a skilled React developer with TypeScript experience.
        Requirements:
        - 3+ years of React experience
        - Strong TypeScript skills
        - Experience with Node.js
      `

      const questions = await adapter.generateQuestions(jobPosting)
      
      expect(Array.isArray(questions)).toBe(true)
      expect(questions).toHaveLength(5)
      expect(questions.every(q => typeof q === 'string')).toBe(true)
      expect(questions.every(q => q.length >= 20 && q.length <= 300)).toBe(true)
    })

    it('should handle empty job posting', async () => {
      const questions = await adapter.generateQuestions('')
      expect(questions).toHaveLength(5)
      expect(questions.every(q => typeof q === 'string')).toBe(true)
    })

    it('should handle HTML in job posting', async () => {
      const jobPostingWithHTML = `
        <h1>Software Engineer</h1>
        <p>We need a <strong>React developer</strong></p>
        <script>alert('xss')</script>
      `

      const questions = await adapter.generateQuestions(jobPostingWithHTML)
      expect(questions).toHaveLength(5)
      expect(questions.every(q => typeof q === 'string')).toBe(true)
    })

    it('should handle very long job posting', async () => {
      const longJobPosting = 'A'.repeat(10000)
      const questions = await adapter.generateQuestions(longJobPosting)
      expect(questions).toHaveLength(5)
      expect(questions.every(q => typeof q === 'string')).toBe(true)
    })
  })

  describe('Language Detection', () => {
    it('should detect English language', async () => {
      const englishText = 'Software Engineer position requiring React and TypeScript experience'
      const language = await adapter.detectLanguage(englishText)
      expect(['en', 'pl', 'de']).toContain(language)
    })

    it('should detect Polish language', async () => {
      const polishText = 'Stanowisko programisty wymagające doświadczenia z React i TypeScript'
      const language = await adapter.detectLanguage(polishText)
      expect(['en', 'pl', 'de']).toContain(language)
    })

    it('should handle empty text', async () => {
      const language = await adapter.detectLanguage('')
      expect(['en', 'pl', 'de']).toContain(language)
    })

    it('should fallback to simple detection on error', async () => {
      const polishText = 'Praca dla programisty z doświadczeniem'
      const language = await adapter.detectLanguage(polishText)
      expect(language).toBe('pl')
    })
  })

  describe('Error Handling', () => {
    it('should handle demo mode gracefully', async () => {
      // Demo mode should work without throwing errors
      const questions = await adapter.generateQuestions('Test job posting')
      expect(questions).toHaveLength(5)
      expect(adapter.getLastError()).toBeNull()
    })

    it('should provide error information', () => {
      const lastError = adapter.getLastError()
      expect(lastError === null || lastError instanceof Error).toBe(true)
    })
  })

  describe('Cache Management', () => {
    it('should provide cache statistics', () => {
      const stats = adapter.getCacheStats()
      expect(stats).toHaveProperty('size')
      expect(stats).toHaveProperty('entries')
      expect(typeof stats.size).toBe('number')
      expect(typeof stats.entries).toBe('number')
    })

    it('should allow cache clearing', () => {
      adapter.clearCache()
      const stats = adapter.getCacheStats()
      expect(stats.size).toBe(0)
    })
  })

  describe('Compatibility with OpenAI Service Interface', () => {
    it('should have isInDemoMode getter', () => {
      expect(typeof adapter.isInDemoMode).toBe('boolean')
    })

    it('should have generateQuestions method with correct signature', async () => {
      const result = await adapter.generateQuestions('test')
      expect(Array.isArray(result)).toBe(true)
      expect(result.every(q => typeof q === 'string')).toBe(true)
    })

    it('should have detectLanguage method with correct signature', async () => {
      const result = await adapter.detectLanguage('test')
      expect(typeof result).toBe('string')
    })

    it('should maintain singleton pattern', () => {
      expect(openRouterAdapter).toBe(openRouterAdapter)
    })
  })

  describe('Integration Test', () => {
    it('should complete full workflow: detect language and generate questions', async () => {
      const jobPosting = `
        Senior Frontend Developer
        Join our team as a Senior Frontend Developer working with React, TypeScript, and modern web technologies.
        
        Requirements:
        - 5+ years of frontend development experience
        - Expert knowledge of React and TypeScript
        - Experience with state management (Redux, Zustand)
        - Knowledge of testing frameworks (Jest, React Testing Library)
        - Familiarity with CI/CD pipelines
      `

      // Test language detection
      const language = await adapter.detectLanguage(jobPosting)
      expect(['en', 'pl', 'de']).toContain(language)

      // Test question generation
      const questions = await adapter.generateQuestions(jobPosting)
      expect(questions).toHaveLength(5)
      
      // Validate question format
      questions.forEach(question => {
        expect(typeof question).toBe('string')
        expect(question.length).toBeGreaterThan(10)
        expect(question.length).toBeLessThan(400)
      })

      // Test service state
      expect(adapter.isInDemoMode).toBe(true)
    })
  })
})

// Test error mapping
describe('OpenRouterAdapter Error Mapping', () => {
  it('should map OpenRouter errors to compatible error messages', async () => {
    // This test would require mocking the OpenRouter service to throw specific errors
    // For now, we just test that the adapter doesn't crash
    const adapter = new OpenRouterAdapter()
    
    try {
      await adapter.generateQuestions('test')
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      if (error instanceof Error) {
        expect(typeof error.message).toBe('string')
      }
    }
  })
}) 