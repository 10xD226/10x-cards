/**
 * Home Page Object Model
 * Implement Page Object Model for maintainable tests as per test-rules
 * Use locators for resilient element selection
 */

import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  
  // Use locators for resilient element selection
  readonly loginButton: Locator;
  readonly jobPostingTextarea: Locator;
  readonly generateButton: Locator;
  readonly questionsList: Locator;
  readonly practiceToggle: Locator;
  readonly charCounter: Locator;
  
  constructor(page: Page) {
    this.page = page;
    
    // Resilient locators based on actual components
    this.loginButton = page.getByRole('button', { name: /zaloguj z github/i });
    this.jobPostingTextarea = page.getByRole('textbox', { name: /ogłoszenie o pracę/i });
    this.generateButton = page.getByRole('button', { name: /generuj 5 pytań/i });
    this.questionsList = page.locator('[data-questions-section]');
    this.practiceToggle = page.getByRole('button').filter({ hasText: /\[\s*\]|\[x\]/ });
    this.charCounter = page.locator('#char-count');
  }
  
  /**
   * Navigate to home page
   */
  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }
  
  /**
   * Mock login session (for test isolation)
   */
  async mockLoginSession() {
    // Mock Supabase session using localStorage/cookies
    await this.page.addInitScript(() => {
      // Mock session data
      const mockSession = {
        access_token: 'mock-access-token',
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          user_metadata: {
            avatar_url: 'https://github.com/test-user.png',
            full_name: 'Test User',
            user_name: 'test-user'
          }
        }
      };
      
      // Set mock session in localStorage (Supabase auth-helpers pattern)
      localStorage.setItem('sb-localhost-auth-token', JSON.stringify(mockSession));
    });
  }
  
  /**
   * Login with GitHub OAuth (demo mode)
   */
  async loginWithGitHub() {
    await this.loginButton.click();
    await this.page.waitForURL(/.*/, { timeout: 10000 });
  }
  
  /**
   * Generate interview questions
   */
  async generateQuestions(jobDescription?: string) {
    const testJobDescription = jobDescription || `
Senior Frontend Developer - React/TypeScript
We are looking for an experienced Frontend Developer to join our team.

Requirements:
- 3+ years of experience with React
- Strong TypeScript knowledge
- Experience with Next.js
- Understanding of modern state management
- Familiarity with testing frameworks
- Good communication skills

Responsibilities:
- Develop and maintain React applications
- Collaborate with design and backend teams
- Write clean, testable code
- Participate in code reviews
- Mentor junior developers

We offer competitive salary, remote work options, and great team culture.
    `.trim();
    
    await this.jobPostingTextarea.fill(testJobDescription);
    await expect(this.generateButton).toBeEnabled();
    await this.generateButton.click();
    await this.page.waitForLoadState('networkidle');
  }
  
  /**
   * Mark question as practiced using index
   */
  async markQuestionAsPracticed(questionIndex: number = 0) {
    const questionItems = this.page.locator('article').filter({ hasText: /.*/ });
    const targetQuestion = questionItems.nth(questionIndex);
    const practiceButton = targetQuestion.getByRole('button').filter({ hasText: /\[\s*\]|\[x\]/ });
    
    await practiceButton.click();
    await this.page.waitForLoadState('networkidle');
  }
  
  /**
   * Verify questions are displayed
   */
  async verifyQuestionsDisplayed(expectedCount: number = 5) {
    await expect(this.questionsList).toBeVisible();
    const questionItems = this.page.locator('article').filter({ hasText: /.*/ });
    await expect(questionItems).toHaveCount(expectedCount);
  }
  
  /**
   * Verify question practice status
   */
  async verifyQuestionPracticeStatus(questionIndex: number, isPracticed: boolean) {
    const questionItems = this.page.locator('article').filter({ hasText: /.*/ });
    const targetQuestion = questionItems.nth(questionIndex);
    const practiceButton = targetQuestion.getByRole('button').filter({ hasText: /\[\s*\]|\[x\]/ });
    
    if (isPracticed) {
      await expect(practiceButton).toHaveText('[x]');
    } else {
      await expect(practiceButton).toHaveText('[ ]');
    }
  }
  
  /**
   * Take screenshot for visual comparison
   */
  async takeScreenshot(name: string) {
    await expect(this.page).toHaveScreenshot(`${name}.png`);
  }
} 