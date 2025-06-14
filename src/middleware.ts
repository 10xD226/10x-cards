import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Skip middleware for auth-related pages, API routes, and static files
  const path = req.nextUrl.pathname
  if (
    path.startsWith('/auth/') ||
    path.startsWith('/api/') ||
    path.startsWith('/_next/') ||
    path.startsWith('/favicon') ||
    path === '/favicon.ico'
  ) {
    return res
  }

  try {
    const supabase = createMiddlewareClient({ req, res })
    
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Root path (/) - let the page component handle auth logic
    // This allows showing either LandingPage or Dashboard based on auth status
    if (path === '/') {
      return res
    }

    // For any other protected routes, require authentication
    if (!session) {
      console.log(`Blocking unauthenticated access to: ${path}`)
      return NextResponse.redirect(new URL('/', req.url))
    }

    return res
  } catch (error) {
    // If there's an error, redirect to home for safety
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL('/', req.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 