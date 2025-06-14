import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '../db/database.types'
import { questionService } from '../lib/questions'
import { TopBar } from '../components/dashboard/TopBar'
import { DashboardClient } from '../components/dashboard/DashboardClient'
import { LandingPage } from '../components/LandingPage'

export default async function HomePage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({
    cookies: () => cookieStore,
  })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Show landing page for unauthenticated users
  if (!session?.user) {
    return <LandingPage />
  }

  // Show dashboard for authenticated users
  // Pobierz wstępną listę pytań dla użytkownika
  const { questions } = await questionService.listByUser(session.user.id, {
    limit: 50,
    offset: 0,
  })

  return (
    <div className="min-h-screen bg-background">
      <TopBar user={session.user} />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <header className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Przygotuj się do rozmowy kwalifikacyjnej z pomocą AI
            </p>
          </header>
          <DashboardClient initialQuestions={questions} />
        </div>
      </main>
    </div>
  )
}
