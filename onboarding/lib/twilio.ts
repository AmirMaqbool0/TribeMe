import { Twilio } from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;

if (!accountSid || !authToken || !verifySid) {
  throw new Error('Missing required Twilio environment variables');
}

// Now TypeScript knows these variables are definitely strings
const twilioClient = new Twilio(accountSid, authToken);

// Export the verified (non-undefined) verifySid
export { twilioClient, verifySid as verifySid };