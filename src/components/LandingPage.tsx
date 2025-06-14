'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface LandingPageProps {
  onSignIn?: () => void
}

export function LandingPage({ onSignIn }: LandingPageProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const handleGitHubSignIn = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError('Błąd logowania przez GitHub')
        console.error('GitHub OAuth error:', error)
      } else {
        onSignIn?.()
      }
    } catch (err) {
      setError('Wystąpił nieoczekiwany błąd')
      console.error('Unexpected error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            InterviewPrep
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Przygotuj się do rozmowy kwalifikacyjnej
          </p>
          <p className="text-muted-foreground">
            Generuj realistyczne pytania rekrutacyjne na podstawie ogłoszeń o pracę
          </p>
        </div>
        
        <div className="rounded-lg border p-6 bg-card shadow-sm">
          <h2 className="text-xl font-semibold mb-6 text-center">
            Zaloguj się, aby rozpocząć
          </h2>
          
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 mb-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            onClick={handleGitHubSignIn}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-medium flex items-center justify-center gap-2"
            aria-label="Zaloguj z GitHub"
          >
            {isLoading ? (
              <>
                <span className="animate-spin">⏳</span>
                Logowanie...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Zaloguj z GitHub
              </>
            )}
          </button>

          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-xs text-muted-foreground">
              <strong>Bezpieczne logowanie:</strong> Używamy GitHub OAuth do autoryzacji. 
              Twoje dane są chronione przez Supabase RLS.
            </p>
          </div>
        </div>
        
        <div className="mt-6 text-center text-sm text-muted-foreground space-y-1">
          <p>✨ Generuj pytania w oparciu o ogłoszenia</p>
          <p>📝 Śledź postęp w ćwiczeniu odpowiedzi</p>
          <p>🤖 Powered by AI</p>
        </div>
      </div>
    </div>
  )
} 