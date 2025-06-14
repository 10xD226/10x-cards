/**
 * Vitest test setup file
 * Configures test environment and global settings using vi object
 */

import { vi, expect } from 'vitest'
import '@testing-library/jest-dom'

// Use vi.stubGlobal for global mocks as per test-rules
vi.stubGlobal('process.env', {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
  OPENAI_API_KEY: 'test-openai-key',
  OPENROUTER_API_KEY: 'test-openrouter-key'
})

// Global test configuration
vi.setConfig({
  testTimeout: 10000
}) 