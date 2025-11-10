import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession()

  // If this is an API request under /api/*, inject user headers
  if (req.nextUrl.pathname.startsWith('/api/')) {
    if (session?.user) {
      const requestHeaders = new Headers(req.headers)
      requestHeaders.set('x-user-id', session.user.id)
      requestHeaders.set('x-user-email', session.user.email || '')
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
