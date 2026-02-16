import { NextRequest, NextResponse } from 'next/server';
import { Twilio } from 'twilio';

export async function POST(req: NextRequest) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;

    // Check for required environment variables
    if (!accountSid || !authToken || !verifySid) {
      throw new Error('Missing required Twilio environment variables');
    }

    const twilioClient = new Twilio(accountSid, authToken);
    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json({ 
        success: false, 
        error: 'Phone number is required' 
      }, { status: 400 });
    }

    const verification = await twilioClient.verify.v2
      .services(verifySid)
      .verifications.create({ to: phoneNumber, channel: 'sms' });

    return NextResponse.json({ 
      success: true, 
      status: verification.status 
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send OTP' 
    }, { status: 500 });
  }
}