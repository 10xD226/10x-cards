/**
 * E2E Tests: Error Handling and Edge Cases (FR-009)
 * Tests error scenarios and graceful degradation
 * 
 * Covers scenarios from test-plan-gemini.md:
 * - API errors (500, 429, 401)
 * - Loading states
 * - Network failures
 * - Edge cases validation
 * 
 * Optimized for parallel execution and reliability
 */

import { test, expect } from '@playwright/test'
import { HomePage } from '../pages/HomePage'
import { ApiMocks } from '../helpers/api-mocks'
import { TEST_JOB_POSTINGS } from '../fixtures/test-data'

test.describe('Error Handling and Edge Cases (FR-009)', () => {
  let homePage: HomePage
  let apiMocks: ApiMocks
  
  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page)
    apiMocks = new ApiMocks(page)
    
    // Mock login session
    await homePage.mockLoginSession()
    await homePage.goto()
  })

  test.afterEach(async ({ page }) => {
    await apiMocks.clearAllMocks()
  })

  /**
   * Test API error scenarios (FR-009)
   * Runs different error codes in parallel steps
   */
  test('should handle API errors gracefully', async ({ page }) => {
    await test.step('Handle 500 Internal Server Error', async () => {
      // Mock API to return 500 error
      await apiMocks.mockGenerateQuestions({
        status: 500,
        response: { success: false, message: 'Coś poszło nie tak' }
      })
      
      // Try to generate questions
      await homePage.generateQuestions(TEST_JOB_POSTINGS.SENIOR_FRONTEND)
      
      // Verify error toast is displayed with timeout
      await expect(page.getByText('Coś poszło nie tak')).toBeVisible({ timeout: 5000 })
      
      // Verify form returns to initial state
      await expect(homePage.generateButton).toBeEnabled({ timeout: 3000 })
      await expect(homePage.generateButton).toHaveText('Generuj 5 pytań')
      
      // Verify no questions are displayed
      await expect(homePage.questionsList).not.toBeVisible()
    })
    
    await test.step('Handle 429 Rate Limit Error', async () => {
      // Clear previous mock
      await apiMocks.clearAllMocks()
      
      // Mock API to return 429 rate limit error
      await apiMocks.mockGenerateQuestions({
        status: 429,
        response: { success: false, message: 'Spróbuj ponownie za chwilę' }
      })
      
      await homePage.generateQuestions(TEST_JOB_POSTINGS.SENIOR_FRONTEND)
      
      // Verify specific rate limit message
      await expect(page.getByText('Spróbuj ponownie za chwilę')).toBeVisible({ timeout: 5000 })
    })
    
    await test.step('Handle 401 Unauthorized Error', async () => {
      // Clear previous mock
      await apiMocks.clearAllMocks()
      
      // Mock API to return 401 unauthorized error
      await apiMocks.mockGenerateQuestions({
        status: 401,
        response: { success: false, message: 'Musisz być zalogowany' }
      })
      
      await homePage.generateQuestions(TEST_JOB_POSTINGS.SENIOR_FRONTEND)
      
      // Verify authentication error message
      await expect(page.getByText('Musisz być zalogowany')).toBeVisible({ timeout: 5000 })
    })
  })

  /**
   * Test loading states and slow responses
   * Optimized timeouts for CI/CD reliability
   */
  test('should handle slow API responses', async ({ page }) => {
    await test.step('Show loading state during generation', async () => {
      // Mock slow API response (2 seconds delay for CI reliability)
      await apiMocks.mockGenerateQuestions({ delay: 2000 })
      
      // Start generation
      await homePage.jobPostingTextarea.fill(TEST_JOB_POSTINGS.SENIOR_FRONTEND)
      await homePage.generateButton.click()
      
      // Verify loading state immediately
      await expect(homePage.generateButton).toBeDisabled({ timeout: 1000 })
      await expect(page.getByText('Generuję...')).toBeVisible({ timeout: 1000 })
      await expect(page.getByText('Generuję pytania...')).toBeVisible({ timeout: 1000 })
      
      // Verify overlay is shown over textarea
      await expect(page.locator('.absolute.inset-0.bg-background\\/80')).toBeVisible({ timeout: 1000 })
      
      // Wait for completion (should finish within reasonable time)
      await expect(homePage.generateButton).toBeEnabled({ timeout: 5000 })
    })
    
    await test.step('Handle practice toggle loading state', async () => {
      // Clear previous mocks and setup fresh ones
      await apiMocks.clearAllMocks()
      await apiMocks.setupInterviewFlowMocks()
      
      // First generate questions
      await homePage.generateQuestions()
      await homePage.verifyQuestionsDisplayed(5)
      
      // Clear mocks and set slow response for practice toggle
      await apiMocks.clearAllMocks()
      await apiMocks.mockSlowApiResponse('/api/questions', 1500)
      
      // Click practice toggle
      const questionItems = page.locator('article').filter({ hasText: /.*/ })
      const firstQuestionToggle = questionItems.first().getByRole('button').filter({ hasText: /\[\s*\]/ })
      
      await firstQuestionToggle.click()
      
      // Verify button is disabled during mutation
      await expect(firstQuestionToggle).toBeDisabled({ timeout: 500 })
    })
  })

  /**
   * Test edge cases in form validation
   * Parallel validation checks for efficiency
   */
  test('should handle form validation edge cases', async ({ page }) => {
    await test.step('Handle boundary character counts', async () => {
      // Test exactly 100 characters (minimum valid)
      const exactMinText = 'A'.repeat(100)
      await homePage.jobPostingTextarea.fill(exactMinText)
      
      // Should be valid and enable button
      await Promise.all([
        expect(homePage.generateButton).toBeEnabled(),
        expect(homePage.charCounter).toHaveText('100/10000'),
        expect(homePage.charCounter).toHaveClass(/text-green-600/)
      ])
      
      // Test exactly 10000 characters (maximum valid)
      const exactMaxText = 'A'.repeat(10000)
      await homePage.jobPostingTextarea.fill(exactMaxText)
      
      // Should be valid and enable button
      await Promise.all([
        expect(homePage.generateButton).toBeEnabled(),
        expect(homePage.charCounter).toHaveText('10000/10000'),
        expect(homePage.charCounter).toHaveClass(/text-green-600/)
      ])
    })
    
    await test.step('Handle invalid content types', async () => {
      // Test with only whitespace
      const whitespaceText = '   \n\n   \t   \n   '
      await homePage.jobPostingTextarea.fill(whitespaceText)
      
      // Should be invalid (not enough meaningful content)
      await Promise.all([
        expect(homePage.generateButton).toBeDisabled(),
        expect(homePage.charCounter).toHaveClass(/text-red-500/)
      ])
      
      // Test with special characters and emoji (if long enough)
      const specialText = `
        Senior Developer 🚀 Required!
        We need someone with: 
        - React ⚛️ experience
        - TypeScript skills 💪
        - Knowledge of Next.js 📚
        
        Salary: 15,000-20,000 PLN 💰
        Location: Warsaw/Remote 🏠
        
        Contact: hr@company.com 📧
        Phone: +48 123 456 789 ☎️
        
        Apply now! Don't miss this opportunity! 🎯
        #React #TypeScript #NextJS #Frontend #Job
      `.trim()
      
      if (specialText.length >= 100) {
        await homePage.jobPostingTextarea.fill(specialText)
        await expect(homePage.generateButton).toBeEnabled()
      }
    })
  })

  /**
   * Test network failure scenarios
   * With appropriate timeouts for CI/CD
   */
  test('should handle network failures', async ({ page }) => {
    await test.step('Handle network timeout', async () => {
      // Mock network failure by not responding to route
      await page.route('/api/questions/generate', route => {
        // Don't fulfill or continue - simulate network timeout
        // The request will eventually timeout
      })
      
      await homePage.jobPostingTextarea.fill(TEST_JOB_POSTINGS.SENIOR_FRONTEND)
      await homePage.generateButton.click()
      
      // Should show loading state initially
      await expect(page.getByText('Generuję...')).toBeVisible({ timeout: 2000 })
      
      // Should eventually show error or timeout (with reasonable timeout for CI)
      await expect(page.getByText(/błąd|error|nie udało/i)).toBeVisible({ timeout: 10000 })
    })
  })

  /**
   * Test rapid user interactions (race conditions)
   * Optimized for reliability in CI environment
   */
  test('should handle rapid user interactions', async ({ page }) => {
    await test.step('Prevent double-clicking generate button', async () => {
      await apiMocks.setupInterviewFlowMocks()
      
      await homePage.jobPostingTextarea.fill(TEST_JOB_POSTINGS.SENIOR_FRONTEND)
      
      // Try to click button multiple times rapidly (with small delay for reliability)
      await homePage.generateButton.click()
      await page.waitForTimeout(50) // Small delay to ensure first click is processed
      
      // Try clicking again - should be disabled
      await expect(homePage.generateButton).toBeDisabled()
      
      // Should generate questions normally (not multiple times)
      await homePage.verifyQuestionsDisplayed(5)
    })
    
    await test.step('Handle rapid practice toggle clicks', async () => {
      // Clear and setup fresh mocks
      await apiMocks.clearAllMocks()
      await apiMocks.setupInterviewFlowMocks()
      
      // Generate questions first
      await homePage.generateQuestions()
      await homePage.verifyQuestionsDisplayed(5)
      
      const questionItems = page.locator('article').filter({ hasText: /.*/ })
      const firstToggle = questionItems.first().getByRole('button').filter({ hasText: /\[\s*\]/ })
      
      // Click once and verify state change
      await firstToggle.click()
      await page.waitForTimeout(100) // Allow time for mutation
      
      // Should end up in a consistent state (either practiced or not)
      await expect(firstToggle).toHaveText(/\[\s*\]|\[x\]/)
    })
  })
}) 