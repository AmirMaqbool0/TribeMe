import { Twilio } from "twilio";
import config from "../config";
import sgMail from "@sendgrid/mail";
import { OTP_VALIDITY_PERIOD } from "../utils/otp-helper";

// SMS Service
const TWILLO_ACC_SID = config.twilio.sid;
const TWILLO_AUTH_TOKEN = config.twilio.token;
const client = new Twilio(TWILLO_ACC_SID, TWILLO_AUTH_TOKEN);

// Email Service
const SENDGRID_API_KEY = config.twilio.email;
sgMail.setApiKey(SENDGRID_API_KEY);

export async function sendOtpPhone(
  phone: string,
  otp: string
): Promise<boolean> {
  try {
    const message = await client.messages.create({
      from: config.twilio.phone,
      to: `${phone}`,
      body: `Your Tribe Me verification code is ${otp}. Don't share this code with anyone. If you didn't request this code, contact Customer Support`,
    });
    console.log(
      "Otp sms has been sent successfully on your Phone:",
      message.sid
    );
    return true;
  } catch (err) {
    console.log("An error occured during message sending Otp", err);
  }
}

export async function sendOtpEmail(
  email: string,
  otp: string
): Promise<boolean> {
  const msg = {
    to: email,
    from: "no-reply@em9949.tribeme.com",
    subject: "Your OTP for TribeMe Account",
    text: `Your One-Time Password (OTP) for TribeMe account is: ${otp}. This OTP is valid for only ${OTP_VALIDITY_PERIOD} seconds. Please do not share this OTP with anyone.`,
    html: `
      <html>
        <body>
          <h1>TribeMe Account One-Time Password (OTP)</h1>
          <p>Hello,</p>
          <p>Your One-Time Password (OTP) for TribeMe account is:</p>
          <h2 style="background-color: #f4f4f4; padding: 10px; border-radius: 4px; display: inline-block;">${otp}</h2>
          <p>This OTP is valid for only <strong>${OTP_VALIDITY_PERIOD} seconds</strong>. Please enter this OTP promptly to proceed with your account.</p>
          <p>If you did not request this verification, please ignore this email or contact us immediately at <a href="mailto:contacttribeme@gmail.com">contacttribeme@gmail.com</a>.</p>
          <p>Thank you,<br/>The TribeMe Team</p>
        </body>
      </html>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log("Otp code has been sent successfully on your Email");
    return true;
  } catch (error) {
    console.error("Error sending OTP email", error);

    if (error.response) {
      switch (error.response.statusCode) {
        case 401:
          console.error("Unauthorized. Please check your API key.");
          break;
        case 429:
          console.error("Rate limit exceeded. Please try again later.");
          break;
        default:
          console.error("Unknown error with status code:");
      }
    } else {
      console.error("Unknown error");
    }

    throw new Error("Failed to send OTP email");
  }
}
