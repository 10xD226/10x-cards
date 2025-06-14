import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Database } from '../db/database.types'
import { questionService } from '../lib/questions'
import { TopBar } from '../components/dashboard/TopBar'
import { DashboardClient } from '../components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({
    cookies: () => cookieStore,
  })

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error || !session?.user) {
      redirect('/auth/signin')
    }

    // Pobierz wstępną listę pytań dla użytkownika
    const { questions } = await questionService.listByUser(session.user.id, {
      limit: 50,
      offset: 0,
    })

    return (
      <div className="min-h-screen bg-background">
        <TopBar user={session.user} />
        <main className="container mx-auto px-4 py-8">
          <DashboardClient initialQuestions={questions} />
        </main>
      </div>
    )
  } catch (error) {
    console.error('Dashboard error:', error)
    redirect('/auth/signin')
  }
}
