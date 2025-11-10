import twilio from 'twilio'

export interface SendSmsParams {
  to: string
  message: string
}

function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  
  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials not configured. Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.')
  }
  
  return twilio(accountSid, authToken)
}

export async function sendSms({ to, message }: SendSmsParams) {
  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER
  
  if (!twilioPhoneNumber) {
    throw new Error('TWILIO_PHONE_NUMBER environment variable not set.')
  }

  const client = getTwilioClient()

  try {
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to,
    })

    return {
      success: true,
      messageSid: result.sid,
      status: result.status,
    }
  } catch (error) {
    console.error('Error sending SMS:', error)
    throw error
  }
}
