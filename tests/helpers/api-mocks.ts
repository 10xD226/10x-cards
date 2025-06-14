/**
 * API Mocking Helpers for E2E Tests
 * Leverage API testing for backend validation as per test-rules
 */

import { Page, Route } from '@playwright/test'
import { 
  MOCK_GENERATE_RESPONSE, 
  MOCK_PRACTICE_TOGGLE_RESPONSE, 
  MOCK_QUESTIONS 
} from '../fixtures/test-data'

export class ApiMocks {
  constructor(private page: Page) {}

  /**
   * Setup all API mocks for complete interview flow
   */
  async setupInterviewFlowMocks() {
    await this.mockGenerateQuestions()
    await this.mockTogglePracticeStatus()
    await this.mockGetQuestions()
  }

  /**
   * Mock /api/questions/generate endpoint
   */
  async mockGenerateQuestions(options?: {
    status?: number
    response?: any
    delay?: number
  }) {
    const { status = 200, response = MOCK_GENERATE_RESPONSE, delay = 500 } = options || {}
    
    await this.page.route('/api/questions/generate', async (route: Route) => {
      // Simulate realistic API delay
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
      
      await route.fulfill({
        status,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(response),
      })
    })
  }

  /**
   * Mock PATCH /api/questions/[id] endpoint for practice toggle
   */
  async mockTogglePracticeStatus(options?: {
    status?: number
    response?: any
    questionId?: string
  }) {
    const { status = 200, response = MOCK_PRACTICE_TOGGLE_RESPONSE, questionId = '*' } = options || {}
    
    const routePattern = questionId === '*' 
      ? '/api/questions/*' 
      : `/api/questions/${questionId}`
    
    await this.page.route(routePattern, async (route: Route) => {
      if (route.request().method() === 'PATCH') {
        await route.fulfill({
          status,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(response),
        })
      } else {
        await route.continue()
      }
    })
  }

  /**
   * Mock GET /api/questions endpoint for questions list
   */
  async mockGetQuestions(options?: {
    status?: number
    response?: any
  }) {
    const { status = 200, response = { data: MOCK_QUESTIONS, success: true } } = options || {}
    
    await this.page.route('/api/questions', async (route: Route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(response),
        })
      } else {
        await route.continue()
      }
    })
  }

  /**
   * Mock error scenarios for testing error handling
   */
  async mockApiError(endpoint: string, errorStatus: number, errorMessage?: string) {
    await this.page.route(endpoint, async (route: Route) => {
      await route.fulfill({
        status: errorStatus,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: false,
          message: errorMessage || 'API Error',
          error: `HTTP ${errorStatus}`
        }),
      })
    })
  }

  /**
   * Mock slow API response for testing loading states
   */
  async mockSlowApiResponse(endpoint: string, delay: number = 3000) {
    await this.page.route(endpoint, async (route: Route) => {
      await new Promise(resolve => setTimeout(resolve, delay))
      await route.continue()
    })
  }

  /**
   * Clear all API mocks
   */
  async clearAllMocks() {
    await this.page.unroute('/api/questions/generate')
    await this.page.unroute('/api/questions/*')
    await this.page.unroute('/api/questions')
  }

  /**
   * Verify API call was made with correct payload
   */
  async verifyApiCall(endpoint: string, method: string, expectedPayload?: any) {
    return new Promise((resolve, reject) => {
      this.page.on('request', (request) => {
        if (request.url().includes(endpoint) && request.method() === method) {
          if (expectedPayload) {
            try {
              const actualPayload = JSON.parse(request.postData() || '{}')
              if (JSON.stringify(actualPayload) === JSON.stringify(expectedPayload)) {
                resolve(true)
              } else {
                reject(new Error(`Payload mismatch. Expected: ${JSON.stringify(expectedPayload)}, Actual: ${JSON.stringify(actualPayload)}`))
              }
            } catch (error) {
              reject(error)
            }
          } else {
            resolve(true)
          }
        }
      })
      
      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error(`API call to ${method} ${endpoint} not detected within 5 seconds`))
      }, 5000)
    })
  }
} 