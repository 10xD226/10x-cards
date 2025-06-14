/**
 * E2E Test: Complete Interview Preparation Flow
 * Uses Page Object Model for maintainable tests as per test-rules
 */

import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Interview Preparation Flow', () => {
  let homePage: HomePage;
  
  // Implement test hooks for setup and teardown
  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should complete full interview preparation workflow', async ({ page }) => {
    // Use browser contexts for isolating test environments
    const context = page.context();
    
    // Step 1: Login (demo mode)
    await test.step('Login with GitHub', async () => {
      await homePage.loginWithGitHub();
    });
    
    // Step 2: Generate questions
    await test.step('Generate interview questions', async () => {
      const jobDescription = 'Senior Frontend Developer position with React and TypeScript experience';
      await homePage.generateQuestions(jobDescription);
      await homePage.verifyQuestionsDisplayed();
    });
    
    // Step 3: Mark question as practiced
    await test.step('Practice a question', async () => {
      await homePage.markQuestionAsPracticed(0);
      
      // Verify the question is marked as practiced
      const practicedQuestion = page.getByTestId('question-item').nth(0);
      await expect(practicedQuestion).toHaveAttribute('data-practiced', 'true');
    });
    
    // Visual comparison test
    await test.step('Visual regression test', async () => {
      await homePage.takeScreenshot('complete-workflow');
    });
  });

  test('should handle demo mode correctly when no API key provided', async ({ page }) => {
    // Test demo mode functionality
    await test.step('Verify demo mode activation', async () => {
      const demoIndicator = page.getByTestId('demo-mode-indicator');
      await expect(demoIndicator).toBeVisible();
    });
    
    await test.step('Generate demo questions', async () => {
      await homePage.generateQuestions();
      await homePage.verifyQuestionsDisplayed();
      
      // Verify demo questions are displayed
      const questions = page.getByTestId('question-item');
      await expect(questions.first()).toContainText('Demo:');
    });
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test mobile responsiveness
    await test.step('Mobile viewport test', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await homePage.generateQuestions();
      await homePage.verifyQuestionsDisplayed();
      await homePage.takeScreenshot('mobile-view');
    });
    
    // Test tablet responsiveness
    await test.step('Tablet viewport test', async () => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await homePage.takeScreenshot('tablet-view');
    });
  });
  
  // Leverage API testing for backend validation
  test('should validate API endpoints', async ({ request }) => {
    // Test questions API endpoint
    const response = await request.get('/api/questions');
    expect(response.status()).toBe(200);
    
    // Test generate API endpoint
    const generateResponse = await request.post('/api/generate', {
      data: {
        jobDescription: 'Test developer position',
        language: 'en'
      }
    });
    expect(generateResponse.status()).toBe(200);
  });
}); 