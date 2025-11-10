import { NextRequest, NextResponse } from 'next/server'
import { sendSms } from '@/lib/twilio'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { to, message } = body

    // Validate input
    if (!to || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to and message' },
        { status: 400 }
      )
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (!phoneRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use E.164 format (e.g., +1234567890)' },
        { status: 400 }
      )
    }

    // Send SMS
    const result = await sendSms({ to, message })

    return NextResponse.json(
      {
        success: true,
        messageSid: result.messageSid,
        status: result.status,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in send-sms API:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to send SMS',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
