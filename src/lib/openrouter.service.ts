/**
 * Supported languages for question generation
 */
export type Language = 'en' | 'pl' | 'de';

/**
 * Interview question structure
 */
export interface Question {
  text: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

/**
 * Configuration options for OpenRouter service
 */
export interface OpenRouterConfig {
  /** OpenRouter API key */
  apiKey: string;
  /** Default AI model to use (default: 'openai/gpt-3.5-turbo') */
  defaultModel?: string;
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Base URL for OpenRouter API (default: 'https://openrouter.ai/api/v1') */
  baseUrl?: string;
}

/**
 * Cache entry for storing API responses
 */
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

export class OpenRouterError extends Error {
  constructor(
    public code: string,
    message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

// Constants
const DEFAULT_CONFIG = {
  defaultModel: 'openai/gpt-3.5-turbo',
  maxRetries: 3,
  timeout: 30000,
  baseUrl: 'https://openrouter.ai/api/v1'
};

const SYSTEM_PROMPTS = {
  en: "You are an expert interviewer. Generate 5 interview questions based on the job posting.",
  pl: "Jesteś ekspertem w przeprowadzaniu rozmów kwalifikacyjnych. Wygeneruj 5 pytań na podstawie ogłoszenia o pracę.",
  de: "Sie sind ein Experte für Vorstellungsgespräche. Generieren Sie 5 Interviewfragen basierend auf der Stellenausschreibung."
};

const RESPONSE_FORMAT = {
  type: 'json_schema',
  json_schema: {
    name: 'InterviewQuestions',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        questions: {
          type: 'array',
          items: {
            type: 'string',
            minLength: 20,
            maxLength: 300
          },
          minItems: 5,
          maxItems: 5
        }
      },
      required: ['questions']
    }
  }
};

/**
 * OpenRouter service for generating interview questions using AI models
 * 
 * @example
 * ```typescript
 * const service = new OpenRouterService({
 *   apiKey: process.env.OPENROUTER_API_KEY!
 * });
 * 
 * const questions = await service.generateQuestions(jobPosting);
 * ```
 */
export class OpenRouterService {
  private readonly apiKey: string;
  private currentModel: string;
  private systemPrompt: string;
  private lastError: Error | null;
  private readonly maxRetries: number;
  private readonly timeout: number;
  private readonly baseUrl: string;
  private isDemoModeEnabled: boolean;
  private cache: Map<string, CacheEntry> = new Map();
  private readonly cacheDefaultTTL = 5 * 60 * 1000; // 5 minutes

  constructor(config: OpenRouterConfig) {
    if (!config.apiKey) {
      console.warn('OpenRouter API key missing, enabling demo mode');
      this.isDemoModeEnabled = true;
      this.apiKey = '';
    } else {
      this.isDemoModeEnabled = false;
      this.apiKey = config.apiKey;
    }

    this.currentModel = config.defaultModel || DEFAULT_CONFIG.defaultModel;
    this.maxRetries = config.maxRetries || DEFAULT_CONFIG.maxRetries;
    this.timeout = config.timeout || DEFAULT_CONFIG.timeout;
    this.baseUrl = config.baseUrl || DEFAULT_CONFIG.baseUrl;
    this.systemPrompt = SYSTEM_PROMPTS.en; // Default to English
    this.lastError = null;
  }

  /**
   * Make HTTP request to OpenRouter API with caching and retry logic
   */
  private async makeRequest(endpoint: string, data: any, useCache: boolean = true): Promise<any> {
    if (this.isDemoModeEnabled) {
      return this.getDemoResponse(data);
    }

    // Check cache first
    if (useCache) {
      const cacheKey = this.getCacheKey(endpoint, data);
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    let retries = 0;
    while (retries < this.maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            'X-Title': 'InterviewPrep'
          },
          body: JSON.stringify(data),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        // Cache successful responses
        if (useCache) {
          const cacheKey = this.getCacheKey(endpoint, data);
          this.setCache(cacheKey, result);
        }
        
        return result;
      } catch (error) {
        retries++;
        if (retries === this.maxRetries) {
          throw this.handleError(error);
        }
        // Implement exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
      }
    }
  }

  /**
   * Generate cache key from endpoint and data
   */
  private getCacheKey(endpoint: string, data: any): string {
    return `${endpoint}:${JSON.stringify(data)}`;
  }

  /**
   * Get data from cache if not expired
   */
  private getFromCache(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Store data in cache with TTL
   */
  private setCache(key: string, data: any, ttl: number = this.cacheDefaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Clear expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  private getDemoResponse(data: any): any {
    // Demo response for testing without API key
    return {
      choices: [{
        message: {
          content: JSON.stringify({
            questions: [
              "Tell me about your experience with the technologies mentioned in this job posting.",
              "How would you approach solving a complex problem in this role?",
              "What interests you most about this position and our company?",
              "Describe a challenging project you've worked on and how you overcame obstacles.",
              "Where do you see yourself growing in this role over the next year?"
            ]
          })
        }
      }]
    };
  }

  private handleError(error: any): never {
    let code = 'OPENROUTER_UNKNOWN_ERROR';
    let message = 'An unknown error occurred';

    if (error.name === 'AbortError') {
      code = 'OPENROUTER_TIMEOUT';
      message = 'Request timed out';
    } else if (error.message?.includes('401')) {
      code = 'OPENROUTER_API_KEY_INVALID';
      message = 'Invalid API key';
    } else if (error.message?.includes('429')) {
      code = 'OPENROUTER_RATE_LIMIT';
      message = 'Rate limit exceeded';
    } else if (error.message?.includes('500')) {
      code = 'OPENROUTER_SERVER_ERROR';
      message = 'OpenRouter server error';
    } else if (error.code) {
      code = error.code;
      message = error.message;
    } else if (error.message) {
      message = error.message;
    }

    const openRouterError = new OpenRouterError(code, message, error);
    this.lastError = openRouterError;
    throw openRouterError;
  }

  private getSystemPrompt(language: Language): string {
    return SYSTEM_PROMPTS[language] || SYSTEM_PROMPTS.en;
  }

  private validateResponse(response: any): void {
    if (!response || !response.questions || !Array.isArray(response.questions)) {
      throw new OpenRouterError(
        'OPENROUTER_INVALID_RESPONSE',
        'Invalid response format from OpenRouter API'
      );
    }
  }

  private validateAndTransformResponse(response: any): Question[] {
    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new OpenRouterError(
        'OPENROUTER_INVALID_RESPONSE',
        'No content in API response'
      );
    }

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (error) {
      throw new OpenRouterError(
        'OPENROUTER_INVALID_RESPONSE',
        'Failed to parse JSON response'
      );
    }

    this.validateResponse(parsedContent);
    
    return parsedContent.questions.map((text: string) => ({
      text,
      category: 'general',
      difficulty: 'medium' as const
    }));
  }

  private sanitizeInput(text: string): string {
    // Remove HTML tags and limit length
    const sanitized = text.replace(/<[^>]*>/g, '').trim();
    return sanitized.length > 5000 ? sanitized.substring(0, 5000) + '...' : sanitized;
  }

  // Public methods
  /**
   * Generate interview questions based on job posting
   * 
   * @param jobPosting - The job posting text to analyze
   * @returns Promise resolving to array of interview questions
   * @throws OpenRouterError when generation fails
   * 
   * @example
   * ```typescript
   * const questions = await service.generateQuestions(`
   *   Software Engineer position requiring React, TypeScript, and Node.js experience.
   *   Must have 3+ years of experience building web applications.
   * `);
   * ```
   */
  public async generateQuestions(jobPosting: string): Promise<Question[]> {
    try {
      const sanitizedJobPosting = this.sanitizeInput(jobPosting);
      const language = await this.detectLanguage(sanitizedJobPosting);
      const systemPrompt = this.getSystemPrompt(language);
      
      const response = await this.makeRequest('/chat/completions', {
        model: this.currentModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: sanitizedJobPosting }
        ],
        response_format: RESPONSE_FORMAT,
        temperature: 0.7,
        max_tokens: 1000
      });
      
      return this.validateAndTransformResponse(response);
    } catch (error) {
      this.lastError = error instanceof OpenRouterError ? error : new OpenRouterError(
        'OPENROUTER_GENERATION_ERROR',
        'Failed to generate questions',
        error
      );
      throw this.lastError;
    }
  }

  /**
   * Detect the language of the provided text
   * 
   * @param text - Text to analyze for language detection
   * @returns Promise resolving to detected language code
   * 
   * @example
   * ```typescript
   * const language = await service.detectLanguage('Software Engineer position...');
   * console.log(language); // 'en'
   * ```
   */
  public async detectLanguage(text: string): Promise<Language> {
    try {
      const sanitizedText = this.sanitizeInput(text.substring(0, 1000)); // Use first 1000 chars for detection
      
      const response = await this.makeRequest('/chat/completions', {
        model: this.currentModel,
        messages: [
          { 
            role: 'system', 
            content: 'Detect the language of the following text. Respond with only the language code: "en" for English, "pl" for Polish, or "de" for German.' 
          },
          { role: 'user', content: sanitizedText }
        ],
        temperature: 0,
        max_tokens: 10
      });
      
      const detectedLanguage = response.choices?.[0]?.message?.content?.trim().toLowerCase();
      
      if (detectedLanguage === 'en' || detectedLanguage === 'pl' || detectedLanguage === 'de') {
        return detectedLanguage as Language;
      }
      
      // Fallback to English if detection fails
      return 'en';
    } catch (error) {
      // Fallback to English on error
      return 'en';
    }
  }

  /**
   * Set the AI model to use for requests
   * 
   * @param model - Model identifier (e.g., 'openai/gpt-4', 'anthropic/claude-3-haiku')
   */
  public setModel(model: string): void {
    this.currentModel = model;
  }

  /**
   * Set custom system prompt for question generation
   * 
   * @param prompt - Custom system prompt to use
   */
  public setSystemPrompt(prompt: string): void {
    this.systemPrompt = prompt;
  }

  /**
   * Check if service is running in demo mode (without API key)
   * 
   * @returns True if in demo mode, false otherwise
   */
  public isDemoMode(): boolean {
    return this.isDemoModeEnabled;
  }

  /**
   * Get the last error that occurred
   * 
   * @returns Last error or null if no error occurred
   */
  public getLastError(): Error | null {
    return this.lastError;
  }

  /**
   * Clear the cache and cleanup expired entries
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * 
   * @returns Object with cache size and cleanup info
   */
  public getCacheStats(): { size: number; entries: number } {
    this.cleanupCache();
    return {
      size: this.cache.size,
      entries: this.cache.size
    };
  }
} 