export const OTP_VALIDITY_PERIOD = 60;
export function generateOtpWithExpiration(
  length = 6,
  validityPeriodInSeconds = OTP_VALIDITY_PERIOD
) {
  const otp = generateOTP(length);
  const otpExpiration = new Date();
  //Set Minutes
  // otpExpiration.setMinutes(otpExpiration.getMinutes() + validityPeriod);
  //Set Seconds
  otpExpiration.setSeconds(
    otpExpiration.getSeconds() + validityPeriodInSeconds
  );

  return { otp, otpExpiration };
}

export const generateOTP = (length = 6): string => {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
};
