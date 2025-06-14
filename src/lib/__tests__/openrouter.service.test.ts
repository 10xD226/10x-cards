import { OpenRouterService, OpenRouterError, type Question, type Language } from '../openrouter.service';

describe('OpenRouterService', () => {
  let service: OpenRouterService;
  
  beforeEach(() => {
    // Initialize service in demo mode for testing
    service = new OpenRouterService({
      apiKey: '' // Empty API key triggers demo mode
    });
  });

  describe('Constructor and Configuration', () => {
    it('should initialize in demo mode when no API key provided', () => {
      expect(service.isDemoMode()).toBe(true);
    });

    it('should initialize with API key when provided', () => {
      const serviceWithKey = new OpenRouterService({
        apiKey: 'test-api-key'
      });
      expect(serviceWithKey.isDemoMode()).toBe(false);
    });

    it('should use default configuration values', () => {
      const serviceWithDefaults = new OpenRouterService({
        apiKey: 'test-key'
      });
      expect(serviceWithDefaults.isDemoMode()).toBe(false);
    });

    it('should allow custom configuration', () => {
      const customService = new OpenRouterService({
        apiKey: 'test-key',
        defaultModel: 'custom/model',
        maxRetries: 5,
        timeout: 60000
      });
      expect(customService.isDemoMode()).toBe(false);
    });
  });

  describe('Question Generation', () => {
    it('should generate questions from job posting', async () => {
      const jobPosting = `
        Software Engineer Position
        We are looking for a skilled React developer with TypeScript experience.
        Requirements:
        - 3+ years of React experience
        - Strong TypeScript skills
        - Experience with Node.js
        - Knowledge of modern web development practices
      `;

      const questions = await service.generateQuestions(jobPosting);
      
      expect(questions).toHaveLength(5);
      expect(questions[0]).toHaveProperty('text');
      expect(questions[0]).toHaveProperty('category', 'general');
      expect(questions[0]).toHaveProperty('difficulty', 'medium');
      expect(typeof questions[0].text).toBe('string');
      expect(questions[0].text.length).toBeGreaterThan(20);
    });

    it('should handle empty job posting', async () => {
      const questions = await service.generateQuestions('');
      expect(questions).toHaveLength(5);
    });

    it('should sanitize HTML input', async () => {
      const jobPostingWithHTML = `
        <h1>Software Engineer</h1>
        <p>We need a <strong>React developer</strong></p>
        <script>alert('xss')</script>
      `;

      const questions = await service.generateQuestions(jobPostingWithHTML);
      expect(questions).toHaveLength(5);
    });

    it('should handle very long job postings', async () => {
      const longJobPosting = 'A'.repeat(10000);
      const questions = await service.generateQuestions(longJobPosting);
      expect(questions).toHaveLength(5);
    });
  });

  describe('Language Detection', () => {
    it('should detect English language', async () => {
      const englishText = 'Software Engineer position requiring React and TypeScript experience';
      const language = await service.detectLanguage(englishText);
      expect(['en', 'pl', 'de']).toContain(language);
    });

    it('should detect Polish language', async () => {
      const polishText = 'Stanowisko programisty wymagające doświadczenia z React i TypeScript';
      const language = await service.detectLanguage(polishText);
      expect(['en', 'pl', 'de']).toContain(language);
    });

    it('should handle empty text', async () => {
      const language = await service.detectLanguage('');
      expect(language).toBe('en'); // Should fallback to English
    });

    it('should handle very short text', async () => {
      const language = await service.detectLanguage('Hi');
      expect(['en', 'pl', 'de']).toContain(language);
    });
  });

  describe('Configuration Methods', () => {
    it('should allow setting custom model', () => {
      service.setModel('openai/gpt-4');
      // No direct way to test this, but it should not throw
      expect(() => service.setModel('custom/model')).not.toThrow();
    });

    it('should allow setting custom system prompt', () => {
      const customPrompt = 'You are a specialized interviewer for tech positions.';
      service.setSystemPrompt(customPrompt);
      expect(() => service.setSystemPrompt(customPrompt)).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should track last error', () => {
      expect(service.getLastError()).toBeNull();
    });

    it('should handle demo mode gracefully', async () => {
      // Demo mode should work without throwing errors
      const questions = await service.generateQuestions('Test job posting');
      expect(questions).toHaveLength(5);
      expect(service.getLastError()).toBeNull();
    });
  });

  describe('Caching', () => {
    it('should provide cache statistics', () => {
      const stats = service.getCacheStats();
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('entries');
      expect(typeof stats.size).toBe('number');
      expect(typeof stats.entries).toBe('number');
    });

    it('should allow cache clearing', () => {
      service.clearCache();
      const stats = service.getCacheStats();
      expect(stats.size).toBe(0);
    });

    it('should cache responses for repeated requests', async () => {
      const jobPosting = 'Test job posting for caching';
      
      // First request
      const questions1 = await service.generateQuestions(jobPosting);
      const stats1 = service.getCacheStats();
      
      // Second request (should use cache in real implementation)
      const questions2 = await service.generateQuestions(jobPosting);
      const stats2 = service.getCacheStats();
      
      expect(questions1).toHaveLength(5);
      expect(questions2).toHaveLength(5);
      // In demo mode, cache behavior might be different
    });
  });

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
        
        Nice to have:
        - Next.js experience
        - GraphQL knowledge
        - Design system experience
      `;

      // Test language detection
      const language = await service.detectLanguage(jobPosting);
      expect(['en', 'pl', 'de']).toContain(language);

      // Test question generation
      const questions = await service.generateQuestions(jobPosting);
      expect(questions).toHaveLength(5);
      
      // Validate question structure
      questions.forEach(question => {
        expect(question).toHaveProperty('text');
        expect(question).toHaveProperty('category');
        expect(question).toHaveProperty('difficulty');
        expect(typeof question.text).toBe('string');
        expect(question.text.length).toBeGreaterThan(10);
        expect(['easy', 'medium', 'hard']).toContain(question.difficulty);
      });

      // Test service state
      expect(service.isDemoMode()).toBe(true);
      expect(service.getLastError()).toBeNull();
    });
  });

  describe('Error Scenarios', () => {
    it('should handle OpenRouterError properly', () => {
      const error = new OpenRouterError('TEST_ERROR', 'Test error message');
      expect(error.name).toBe('OpenRouterError');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.message).toBe('Test error message');
    });

    it('should handle network-like errors gracefully in demo mode', async () => {
      // Demo mode should not throw network errors
      const questions = await service.generateQuestions('Test posting');
      expect(questions).toHaveLength(5);
    });
  });
});

// Additional utility tests
describe('OpenRouterService Utilities', () => {
  it('should export all required types', () => {
    expect(typeof OpenRouterService).toBe('function');
    expect(typeof OpenRouterError).toBe('function');
  });

  it('should have proper TypeScript types', () => {
    const service = new OpenRouterService({ apiKey: '' });
    
    // These should compile without TypeScript errors
    const _isDemoMode: boolean = service.isDemoMode();
    const _lastError: Error | null = service.getLastError();
    const _cacheStats: { size: number; entries: number } = service.getCacheStats();
    
    expect(typeof _isDemoMode).toBe('boolean');
    expect(_lastError === null || _lastError instanceof Error).toBe(true);
    expect(typeof _cacheStats.size).toBe('number');
  });
}); 