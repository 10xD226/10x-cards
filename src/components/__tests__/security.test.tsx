import { render, screen } from '@testing-library/react'
import { LandingPage } from '../LandingPage'

// Mock Supabase client
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => ({
    auth: {
      signInWithOAuth: jest.fn().mockResolvedValue({ error: null }),
    },
  }),
}))

describe('Security - Landing Page Access Control', () => {
  it('shows landing page with GitHub login button for unauthenticated users', () => {
    render(<LandingPage />)
    
    // Check that landing page elements are present
    expect(screen.getByText('InterviewPrep')).toBeInTheDocument()
    expect(screen.getByText('Przygotuj się do rozmowy kwalifikacyjnej')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /zaloguj z github/i })).toBeInTheDocument()
    
    // Ensure no dashboard elements are present
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
    expect(screen.queryByText('Generuj pytania rekrutacyjne')).not.toBeInTheDocument()
  })

  it('displays security notice about GitHub OAuth', () => {
    render(<LandingPage />)
    
    expect(screen.getByText(/bezpieczne logowanie/i)).toBeInTheDocument()
    expect(screen.getByText(/supabase rls/i)).toBeInTheDocument()
  })

  it('shows proper call-to-action elements', () => {
    render(<LandingPage />)
    
    expect(screen.getByText('Zaloguj się, aby rozpocząć')).toBeInTheDocument()
    expect(screen.getByText(/generuj pytania w oparciu o ogłoszenia/i)).toBeInTheDocument()
    expect(screen.getByText(/śledź postęp w ćwiczeniu odpowiedzi/i)).toBeInTheDocument()
  })
}) 