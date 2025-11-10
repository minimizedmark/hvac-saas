import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(request: NextRequest) {
  // Allow public API endpoints first
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const publicEndpoints = ['/api/health']
    if (publicEndpoints.some(endpoint => request.nextUrl.pathname.startsWith(endpoint))) {
      return NextResponse.next()
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  // Check if Supabase is properly configured
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-')) {
    // If not configured and accessing protected routes, return error
    if (request.nextUrl.pathname.startsWith('/api/') || request.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.json(
        { error: 'Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY' },
        { status: 503 }
      )
    }
    return NextResponse.next()
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  // Get the session from the request
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  
  if (token) {
    const { data: { user } } = await supabase.auth.getUser(token)
    
    if (user) {
      // Clone the request headers and add the user ID
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', user.id)
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    }
  }
  
  // If accessing API routes without auth, return 401
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
  ],
}
