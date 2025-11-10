import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Extract user ID from headers set by middleware
  const userId = request.headers.get('x-user-id')
  const userEmail = request.headers.get('x-user-email')

  // Return 401 if no authenticated user
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized - No valid session' },
      { status: 401 }
    )
  }

  // Return user information
  return NextResponse.json({
    success: true,
    user: {
      id: userId,
      email: userEmail,
    },
    message: 'Successfully authenticated via middleware headers',
  })
}
