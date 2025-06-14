/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    // Configure jsdom for DOM testing
    environment: 'jsdom',
    
    // Setup files for reusable configuration
    setupFiles: ['./src/test-setup.ts'],
    
    // Global configuration for tests
    globals: true,
    
    // Test file patterns
    include: [
      'src/**/*.{test,spec}.{js,ts,tsx}',
      'src/**/__tests__/**/*.{js,ts,tsx}'
    ],
    
    // Global test timeout
    testTimeout: 10000,
    
    // Coverage configuration with purpose
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/db/**',
        'src/types.ts',
        'src/test-setup.ts'
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },
    
    // Enable TypeScript type checking in tests
    typecheck: {
      enabled: true
    }
  },
  
  // Path aliasing for imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
}) 