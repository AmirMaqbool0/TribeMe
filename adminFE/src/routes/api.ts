// BASE URL
// Local and Development URI'S

// import { BASE_URL } from "@env";
// const BASE_URI='http://3.133.220.91:3000'
const BASE_URI = process.env.BASE_URL;
const VERSION = 'api/v1';

// 1. Authentication
export const createUser = `${BASE_URI}/${VERSION}/create-user`;
export const registerVerify = `${BASE_URI}/${VERSION}/verification-type-otp`;
export const loginUser = `${BASE_URI}/${VERSION}/member/login`;
export const forgotUser = `${BASE_URI}/${VERSION}/forgot-password`;
export const forgotVerify = `${BASE_URI}/${VERSION}/verification-type-otp`;
export const resetUser = `${BASE_URI}/${VERSION}/reset-password`;
export const resendOTP = `${BASE_URI}/${VERSION}/request-new-otp`;

// 2. Main