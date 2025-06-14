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
  readonly generateButton: Locator;
  readonly questionsList: Locator;
  readonly practiceButton: Locator;
  
  constructor(page: Page) {
    this.page = page;
    
    // Resilient locators using data-testid or semantic selectors
    this.loginButton = page.getByRole('button', { name: /sign in with github/i });
    this.generateButton = page.getByRole('button', { name: /generate questions/i });
    this.questionsList = page.getByTestId('questions-list');
    this.practiceButton = page.getByRole('button', { name: /mark as practiced/i });
  }
  
  /**
   * Navigate to home page
   */
  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }
  
  /**
   * Login with GitHub OAuth (demo mode)
   */
  async loginWithGitHub() {
    await this.loginButton.click();
    // Wait for auth callback or demo mode activation
    await this.page.waitForURL(/.*/, { timeout: 10000 });
  }
  
  /**
   * Generate interview questions
   */
  async generateQuestions(jobDescription?: string) {
    if (jobDescription) {
      const textarea = this.page.getByRole('textbox', { name: /job description/i });
      await textarea.fill(jobDescription);
    }
    
    await this.generateButton.click();
    await this.page.waitForLoadState('networkidle');
  }
  
  /**
   * Mark question as practiced
   */
  async markQuestionAsPracticed(questionIndex: number = 0) {
    const questions = this.page.getByTestId('question-item');
    const targetQuestion = questions.nth(questionIndex);
    const practiceButton = targetQuestion.getByRole('button', { name: /mark as practiced/i });
    
    await practiceButton.click();
  }
  
  /**
   * Verify questions are displayed
   */
  async verifyQuestionsDisplayed() {
    await expect(this.questionsList).toBeVisible();
    const questions = this.page.getByTestId('question-item');
    await expect(questions).toHaveCount(5); // Should generate exactly 5 questions
  }
  
  /**
   * Take screenshot for visual comparison
   */
  async takeScreenshot(name: string) {
    await expect(this.page).toHaveScreenshot(`${name}.png`);
  }
} 