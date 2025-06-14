/**
 * Demo Vitest Test
 * Demonstrates best practices from test-rules for unit testing
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Demo function to test
function calculateTotal(items: { price: number; quantity: number }[]) {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0)
}

// Demo async function
async function fetchUserData(id: string) {
  const response = await fetch(`/api/users/${id}`)
  return response.json()
}

describe('Vitest Best Practices Demo', () => {
  // Structure tests for maintainability with descriptive describe blocks
  describe('calculateTotal', () => {
    it('should calculate total price correctly', () => {
      // Arrange-Act-Assert pattern
      const items = [
        { price: 10, quantity: 2 },
        { price: 5, quantity: 3 }
      ]
      
      const result = calculateTotal(items)
      
      expect(result).toBe(35)
    })
    
    it('should return 0 for empty array', () => {
      expect(calculateTotal([])).toBe(0)
    })
    
    // Use inline snapshots for readable assertions
    it('should match calculation snapshot', () => {
      const items = [{ price: 100, quantity: 1 }]
      const result = calculateTotal(items)
      
      expect(result).toMatchInlineSnapshot('100')
    })
  })

  describe('fetchUserData with mocking', () => {
    // Leverage vi object for test doubles
    beforeEach(() => {
      vi.restoreAllMocks()
    })

    it('should fetch user data successfully', async () => {
      // Use vi.fn() for function mocks
      const mockFetch = vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({ id: '1', name: 'John' })
      })
      
      // Use vi.stubGlobal for global mocks
      vi.stubGlobal('fetch', mockFetch)
      
      const userData = await fetchUserData('1')
      
      expect(mockFetch).toHaveBeenCalledWith('/api/users/1')
      expect(userData).toEqual({ id: '1', name: 'John' })
    })

    it('should use spyOn to monitor existing functions', () => {
      // Use vi.spyOn() to monitor existing functions
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      console.log('test message')
      
      expect(consoleSpy).toHaveBeenCalledWith('test message')
      
      consoleSpy.mockRestore()
    })
  })

  describe('TypeScript type checking', () => {
    it('should preserve type signatures in mocks', () => {
      // Mock with preserved type signature
      type UserService = {
        getUser: (id: string) => Promise<{ name: string }>
      }
      
      const mockUserService: UserService = {
        getUser: vi.fn().mockResolvedValue({ name: 'Test User' })
      }
      
      // TypeScript will catch type errors
      expect(mockUserService.getUser).toBeDefined()
    })
  })

  // Test with explicit assertion messages
  describe('with explicit messages', () => {
    it('should provide clear error messages', () => {
      const result = calculateTotal([{ price: 10, quantity: 2 }])
      
      expect(result, 'Total should be calculated correctly').toBe(20)
    })
  })
}) 