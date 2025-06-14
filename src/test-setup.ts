/**
 * Jest test setup file
 * Configures test environment and global settings
 */

import '@testing-library/jest-dom'

// Set test environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.OPENAI_API_KEY = 'test-openai-key'

// Global test timeout
jest.setTimeout(10000) 