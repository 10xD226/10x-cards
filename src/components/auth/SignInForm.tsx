'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()

  const handleDemoSignIn = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Dla demo - tworzę tymczasowego użytkownika lub używam istniejącego
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'demo@interviewprep.com',
        password: 'demo123456'
      })

      if (error) {
        // Jeśli użytkownik nie istnieje, stwórz go
        if (error.message.includes('Invalid login credentials')) {
          const { error: signUpError } = await supabase.auth.signUp({
            email: 'demo@interviewprep.com',
            password: 'demo123456',
            options: {
              data: {
                full_name: 'Demo User',
                avatar_url: 'https://github.com/github.png'
              }
            }
          })

          if (signUpError) {
            throw signUpError
          }

          // Po rejestracji, zaloguj
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: 'demo@interviewprep.com',
            password: 'demo123456'
          })

          if (signInError) {
            throw signInError
          }
        } else {
          throw error
        }
      }

      router.refresh()
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas logowania')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGitHubSignIn = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas logowania')
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <button
        onClick={handleDemoSignIn}
        disabled={isLoading}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Logowanie...' : '🚀 Demo Login (Szybki start)'}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-muted"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-card text-muted-foreground">lub</span>
        </div>
      </div>

      <button
        onClick={handleGitHubSignIn}
        disabled={isLoading}
        className="w-full py-2 px-4 border border-border rounded-md hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
        {isLoading ? 'Logowanie...' : 'Zaloguj przez GitHub'}
      </button>

      <div className="text-xs text-muted-foreground space-y-1">
        <p><strong>Demo Login:</strong> Automatycznie tworzy konto testowe</p>
        <p><strong>GitHub:</strong> Wymaga konfiguracji OAuth w Supabase</p>
      </div>
    </div>
  )
} 