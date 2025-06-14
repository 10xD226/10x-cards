import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Skip middleware for auth-related pages and API routes
  const path = req.nextUrl.pathname
  if (path.startsWith('/auth/') || path.startsWith('/api/')) {
    return res
  }

  try {
    const supabase = createMiddlewareClient({ req, res })
    
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Protected route - require authentication
    if (!session && path === '/') {
      // Return response that will show landing page instead of redirecting
      return res
    }

    return res
  } catch (error) {
    // If there's an error, allow the request to continue
    console.error('Middleware error:', error)
    return res
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
} 