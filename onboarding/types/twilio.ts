export interface SendOtpRequest {
    phoneNumber: string;
  }
  
  export interface VerifyOtpRequest {
    phoneNumber: string;
    otp: string;
  }
  
  export interface TwilioResponse {
    success: boolean;
    status?: string;
    error?: string;
  }