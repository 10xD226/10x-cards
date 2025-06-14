import { OpenRouterService, OpenRouterError, type Question } from './openrouter.service'
import { GeneratedQuestionsSchema } from '../schemas/question'

/**
 * Adapter for OpenRouter service that maintains compatibility with existing OpenAI service interface
 * This allows seamless replacement of OpenAI service with OpenRouter service
 */
class OpenRouterAdapter {
  private openRouterService: OpenRouterService
  private isDemoMode: boolean

  constructor() {
    const apiKey = process.env.OPENROUTER_API_KEY
    // Only use demo mode if explicitly requested AND no API key, or if no API key at all
    this.isDemoMode = !apiKey || (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && !apiKey)
    
    if (this.isDemoMode) {
      console.warn('🚧 OpenRouter Service running in DEMO MODE - using mock responses')
    } else {
      console.log('✅ OpenRouter Service running in LIVE MODE with API key')
    }

    this.openRouterService = new OpenRouterService({
      apiKey: apiKey || 'demo', // Pass 'demo' instead of empty string to ensure proper demo mode detection
      defaultModel: process.env.OPENROUTER_DEFAULT_MODEL || 'openai/gpt-3.5-turbo',
      maxRetries: 3,
      timeout: 30000
    })
  }

  /**
   * Generates exactly 5 interview questions based on job posting
   * Compatible with existing OpenAI service interface
   * @param jobPosting - The job posting text (already validated)
   * @returns Array of 5 interview questions as strings
   * @throws Error if OpenRouter API fails or returns invalid data
   */
  async generateQuestions(jobPosting: string): Promise<string[]> {
    try {
      const questions: Question[] = await this.openRouterService.generateQuestions(jobPosting)
      
      // Extract text from Question objects to maintain compatibility
      const questionTexts = questions.map(q => q.text)
      
      // Validate the generated questions using existing schema
      const validationResult = GeneratedQuestionsSchema.safeParse(questionTexts)
      
      if (!validationResult.success) {
        console.error('OpenRouter generated invalid questions:', validationResult.error)
        throw new Error('Generated questions do not meet quality requirements')
      }

      return validationResult.data
      
    } catch (error) {
      // Map OpenRouter errors to compatible error messages
      if (error instanceof OpenRouterError) {
        switch (error.code) {
          case 'OPENROUTER_API_KEY_INVALID':
            throw new Error('Invalid OpenRouter API key')
          case 'OPENROUTER_RATE_LIMIT':
            throw new Error('OpenRouter API rate limit exceeded. Please try again later.')
          case 'OPENROUTER_TIMEOUT':
            throw new Error('OpenRouter API request timed out. Please try again.')
          case 'OPENROUTER_SERVER_ERROR':
            throw new Error('OpenRouter API server error. Please try again later.')
          case 'OPENROUTER_INVALID_RESPONSE':
            throw new Error('Generated questions do not meet quality requirements')
          case 'OPENROUTER_GENERATION_ERROR':
            throw new Error('Failed to generate questions. Please try again.')
          default:
            throw new Error(`OpenRouter API error: ${error.message}`)
        }
      }
      
      // Re-throw other errors as-is
      if (error instanceof Error) {
        throw error
      }
      
      // Fallback for unknown errors
      throw new Error('Failed to generate questions due to an unexpected error')
    }
  }

  /**
   * Detects language of the job posting
   * @param text - Text to analyze
   * @returns Promise resolving to language code
   */
  async detectLanguage(text: string): Promise<string> {
    try {
      const language = await this.openRouterService.detectLanguage(text)
      return language
    } catch (error) {
      // Fallback to simple detection on error
      return this.detectLanguageSimple(text)
    }
  }

  /**
   * Simple language detection fallback
   * @param text - Text to analyze
   * @returns Detected language code
   */
  private detectLanguageSimple(text: string): string {
    const lowerText = text.toLowerCase()
    
    // Polish detection
    if (lowerText.includes('praca') || lowerText.includes('stanowisko') || 
        lowerText.includes('wymagania') || lowerText.includes('doświadczenie')) {
      return 'pl'
    }
    
    // German detection
    if (lowerText.includes('stelle') || lowerText.includes('arbeit') || 
        lowerText.includes('erfahrung') || lowerText.includes('kenntnisse')) {
      return 'de'
    }
    
    // Default to English
    return 'en'
  }

  /**
   * Check if service is running in demo mode
   * Compatible with existing OpenAI service interface
   */
  public get isInDemoMode(): boolean {
    return this.isDemoMode || this.openRouterService.isDemoMode()
  }

  /**
   * Get last error from OpenRouter service
   */
  public getLastError(): Error | null {
    return this.openRouterService.getLastError()
  }

  /**
   * Clear cache in OpenRouter service
   */
  public clearCache(): void {
    this.openRouterService.clearCache()
  }

  /**
   * Get cache statistics from OpenRouter service
   */
  public getCacheStats(): { size: number; entries: number } {
    return this.openRouterService.getCacheStats()
  }
}

// Export singleton instance to maintain compatibility
export const openRouterAdapter = new OpenRouterAdapter()

// Export class for testing
export { OpenRouterAdapter } 