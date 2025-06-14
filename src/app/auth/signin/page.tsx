'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()

  const handleDemoLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Demo login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'demo@interviewprep.com',
        password: 'demo123456'
      })

      if (error && error.message.includes('Invalid login credentials')) {
        // Create demo user
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

        if (!signUpError) {
          // Try to sign in again
          await supabase.auth.signInWithPassword({
            email: 'demo@interviewprep.com',
            password: 'demo123456'
          })
        }
      }

      router.push('/')
      router.refresh()
    } catch (err) {
      setError('Błąd logowania demo')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">InterviewPrep</h1>
          <p className="text-muted-foreground">
            Przygotuj się do rozmowy kwalifikacyjnej z pomocą AI
          </p>
        </div>
        
        <div className="rounded-lg border p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4 text-center">Zaloguj się</h2>
          
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 mb-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-medium"
          >
            {isLoading ? '⏳ Logowanie...' : '🚀 Demo Login (Start!)'}
          </button>

          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-xs text-gray-600">
              <strong>Demo Mode:</strong> Automatycznie tworzy bezpieczne konto testowe. 
              Wszystkie funkcje działają normalnie!
            </p>
          </div>
        </div>
        
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>🎯 Gotowe do testowania wszystkich funkcji</p>
          <p>💾 Pytania zapisują się w bazie danych</p>
        </div>
      </div>
    </div>
  )
} 