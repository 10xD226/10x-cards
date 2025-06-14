/**
 * E2E Test: Complete Interview Flow (FR-007)
 * Tests the main user journey: login → generate questions → toggle practice status
 * 
 * Uses Page Object Model for maintainable tests as per test-rules
 * Implements browser contexts for isolating test environments
 * Leverages API testing for backend validation
 * Leverage parallel execution for faster test runs
 */

import { test, expect } from '@playwright/test'
import { HomePage } from '../pages/HomePage'
import { ApiMocks } from '../helpers/api-mocks'
import { TEST_JOB_POSTINGS, MOCK_QUESTIONS } from '../fixtures/test-data'

test.describe('Complete Interview Flow (FR-007)', () => {
  let homePage: HomePage
  let apiMocks: ApiMocks
  
  // Implement test hooks for setup and teardown
  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page)
    apiMocks = new ApiMocks(page)
    
    // Setup API mocks for complete flow
    await apiMocks.setupInterviewFlowMocks()
    
    // Mock login session for test isolation
    await homePage.mockLoginSession()
    
    // Navigate to dashboard
    await homePage.goto()
  })

  test.afterEach(async ({ page }) => {
    // Clear all mocks after each test
    await apiMocks.clearAllMocks()
  })

  /**
   * Main test covering FR-001, FR-002, FR-003, FR-004, FR-005
   * US-001: GitHub login, US-002: Generate questions, US-004: Toggle practice status
   */
  test('should complete full interview preparation workflow', async ({ page }) => {
    // Use browser contexts for isolating test environments
    const context = page.context()
    
    // Step 1: Verify authenticated state (FR-001, US-001)
    await test.step('Verify user is authenticated', async () => {
      // Should see dashboard content, not landing page
      await expect(page.locator('h1')).not.toHaveText(/InterviewPrep/, { timeout: 5000 })
      await expect(homePage.jobPostingTextarea).toBeVisible({ timeout: 5000 })
      await expect(homePage.generateButton).toBeVisible({ timeout: 5000 })
    })
    
    // Step 2: Generate interview questions (FR-002, FR-003, FR-004, US-002)
    await test.step('Generate 5 interview questions', async () => {
      // Fill job posting form with valid content (100-10000 chars)
      await homePage.generateQuestions(TEST_JOB_POSTINGS.SENIOR_FRONTEND)
      
      // Verify loading state is shown (with shorter timeout for better UX)
      await expect(homePage.generateButton).toBeDisabled({ timeout: 2000 })
      await expect(page.getByText('Generuję...')).toBeVisible({ timeout: 2000 })
      
      // Wait for questions to be generated and displayed
      await homePage.verifyQuestionsDisplayed(5) // FR-003: exactly 5 questions
      
      // Verify questions content matches mock data
      const questionItems = page.locator('article').filter({ hasText: /.*/ })
      await expect(questionItems.first()).toContainText(MOCK_QUESTIONS[0].content, { timeout: 3000 })
      
      // Verify form is reset after successful generation
      await expect(homePage.jobPostingTextarea).toHaveValue('', { timeout: 2000 })
      await expect(homePage.generateButton).toHaveText('Generuj 5 pytań', { timeout: 2000 })
    })
    
    // Step 3: Toggle practice status (FR-005, US-004)  
    await test.step('Mark question as practiced', async () => {
      // Verify initial state - all questions unpracticed
      await homePage.verifyQuestionPracticeStatus(0, false)
      
      // Click practice toggle on first question
      await homePage.markQuestionAsPracticed(0)
      
      // Verify question is marked as practiced
      await homePage.verifyQuestionPracticeStatus(0, true)
      
      // Verify other questions remain unpracticed
      await homePage.verifyQuestionPracticeStatus(1, false)
    })
    
    // Step 4: Verify data persistence (FR-004)
    await test.step('Verify questions are stored', async () => {
      // Refresh page to verify data persistence
      await page.reload({ waitUntil: 'networkidle' })
      
      // Questions should still be visible after reload
      await homePage.verifyQuestionsDisplayed(5)
      
      // Practice status should be preserved
      await homePage.verifyQuestionPracticeStatus(0, true)
    })
  })

  /**
   * Test character count validation (FR-002)
   * Can run in parallel with main test
   */
  test('should validate job posting character count', async ({ page }) => {
    await test.step('Verify minimum character requirement', async () => {
      // Test with text under 100 characters
      const shortText = 'This is too short text for job posting'
      await homePage.jobPostingTextarea.fill(shortText)
      
      // Button should be disabled
      await expect(homePage.generateButton).toBeDisabled()
      
      // Character counter should show red color for invalid count
      await expect(homePage.charCounter).toHaveClass(/text-red-500/)
    })
    
    await test.step('Verify character count enables button', async () => {
      // Fill with valid length text (>100 characters)
      await homePage.jobPostingTextarea.fill(TEST_JOB_POSTINGS.SENIOR_FRONTEND)
      
      // Button should be enabled
      await expect(homePage.generateButton).toBeEnabled()
      
      // Character counter should show green color for valid count
      await expect(homePage.charCounter).toHaveClass(/text-green-600/)
    })
  })

  /**
   * Test multiple questions practice toggle
   * Optimized for parallel execution
   */
  test('should handle multiple practice status changes', async ({ page }) => {
    // Generate questions first
    await homePage.generateQuestions(TEST_JOB_POSTINGS.SENIOR_FRONTEND)
    await homePage.verifyQuestionsDisplayed(5)
    
    await test.step('Toggle multiple questions', async () => {
      // Mark first 3 questions as practiced (optimized loop)
      for (let i = 0; i < 3; i++) {
        await homePage.markQuestionAsPracticed(i)
        await homePage.verifyQuestionPracticeStatus(i, true)
      }
      
      // Verify remaining questions are still unpracticed (parallel check)
      await Promise.all([
        homePage.verifyQuestionPracticeStatus(3, false),
        homePage.verifyQuestionPracticeStatus(4, false)
      ])
    })
    
    await test.step('Toggle practiced question back to unpracticed', async () => {
      // Toggle first question back to unpracticed
      await homePage.markQuestionAsPracticed(0)
      await homePage.verifyQuestionPracticeStatus(0, false)
      
      // Other practiced questions should remain practiced (parallel verification)
      await Promise.all([
        homePage.verifyQuestionPracticeStatus(1, true),
        homePage.verifyQuestionPracticeStatus(2, true)
      ])
    })
  })

  /**
   * Leverage API testing for backend validation
   * Uses specific matchers for better error reporting
   */
  test('should verify API interactions', async ({ page }) => {
    await test.step('Verify generate questions API call', async () => {
      const jobPosting = TEST_JOB_POSTINGS.FULL_STACK
      
      // Set up API call verification with timeout
      const apiCallPromise = Promise.race([
        apiMocks.verifyApiCall('/api/questions/generate', 'POST', {
          jobPosting: jobPosting
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API call verification timeout')), 10000)
        )
      ])
      
      // Trigger the API call
      await homePage.generateQuestions(jobPosting)
      
      // Verify the API was called with correct payload
      await expect(apiCallPromise).resolves.toBe(true)
    })
    
    await test.step('Verify practice toggle API call', async () => {
      // Generate questions first
      await homePage.generateQuestions()
      await homePage.verifyQuestionsDisplayed(5)
      
      // Set up API call verification for practice toggle with timeout
      const toggleApiPromise = Promise.race([
        apiMocks.verifyApiCall('/api/questions', 'PATCH', {
          practiced: true
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Toggle API verification timeout')), 10000)
        )
      ])
      
      // Trigger practice toggle
      await homePage.markQuestionAsPracticed(0)
      
      // Verify the API was called
      await expect(toggleApiPromise).resolves.toBe(true)
    })
  })

  /**
   * Performance test - measure loading times
   * Uses expect assertions with specific matchers
   */
  test('should complete workflow within performance thresholds', async ({ page }) => {
    const startTime = Date.now()
    
    await test.step('Measure complete workflow time', async () => {
      // Complete full workflow
      await homePage.generateQuestions(TEST_JOB_POSTINGS.SENIOR_FRONTEND)
      await homePage.verifyQuestionsDisplayed(5)
      await homePage.markQuestionAsPracticed(0)
      await homePage.verifyQuestionPracticeStatus(0, true)
      
      const endTime = Date.now()
      const totalTime = endTime - startTime
      
      // Should complete within 15 seconds (as per PRD requirement)
      expect(totalTime).toBeLessThan(15000)
      
      console.log(`Complete workflow took: ${totalTime}ms`)
    })
  })
}) 