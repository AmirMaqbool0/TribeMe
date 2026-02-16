import { Twilio } from "twilio";
import sgMail from "@sendgrid/mail";

// SMS Service
const TWILLO_ACC_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILLO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const client = new Twilio(TWILLO_ACC_SID, TWILLO_AUTH_TOKEN);

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (!SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY is not set in environment variables");
}

sgMail.setApiKey(SENDGRID_API_KEY );

export async function sendOtpPhone(
  phone: string,
  otp: string
): Promise<boolean> {
  try {
    const message = await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `${phone}`,
      body: `Your TribeMe Member OTP code is ${otp}`,
    });
    console.log(
      "Otp sms has been sent successfully on your Phone:",
      message.sid
    );
    return true;
  } catch (err) {
    console.log("An error occured during message sending");
    return false
  }
}

export async function sendForgotPasswordOtpEmail(
  email: string,
  otp: string
): Promise<boolean> {
  const msg = {
    to: email,
    from: "muhammadmahsanadil@gmail.com",
    subject: "TribeMe Admin Forgot Password OTP.",
    text: `Your OTP code is: ${otp}`,
  };

  try {
    await sgMail.send(msg);
    console.log("Otp code has been sent successfully on your Email");
    return true;
  } catch (error : any) {

    console.error("Error sending OTP email");

    if (error.response) {
      // console.error("Error details:", error.response.body);
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
