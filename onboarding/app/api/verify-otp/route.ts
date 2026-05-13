import { NextRequest, NextResponse } from 'next/server';
import { Twilio } from 'twilio';

export async function POST(req: NextRequest) {
  try {
    const accountSid = process.env.;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;

    // Check for required environment variables
    if (!accountSid || !authToken || !verifySid) {
      throw new Error('Missing required Twilio environment variables');
    }

    const twilioClient = new Twilio(accountSid, authToken);
    const { phoneNumber, otp } = await req.json();

    if (!phoneNumber || !otp) {
      return NextResponse.json({ 
        success: false, 
        error: 'Phone number and OTP are required' 
      }, { status: 400 });
    }

    // Ensure the phone number starts with +
    const normalizedPhoneNumber = phoneNumber.startsWith('+') 
      ? phoneNumber 
      : `+${phoneNumber}`;

    const verification = await twilioClient.verify.v2
      .services(verifySid)
      .verificationChecks.create({ to: normalizedPhoneNumber, code: otp });

    if (verification.status === 'approved') {
      return NextResponse.json({ 
        success: true, 
        status: verification.status 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid OTP' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to verify OTP' 
    }, { status: 500 });
  }
}
