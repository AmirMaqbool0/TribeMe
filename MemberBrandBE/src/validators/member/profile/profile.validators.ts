import Joi from "joi";

export const reqPhoneVerificationValidationSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .messages({
      "string.empty": "Phone number is required.",
      "string.pattern.base": "Please provide a valid phone number.",
    }),
});

export const setNewPasswordValidationSchema = Joi.object({
  currentPassword: Joi.string().min(8).required().messages({
    "string.empty": "Password is required.",
    "string.min": "Password should have a minimum length of 8 characters.",
  }),
  newPassword: Joi.string()
    .min(8)
    .required()
    .messages({
      "string.empty": "Password is required.",
      "string.min": "Password should have a minimum length of 8 characters.",
    }),
});

export const verifyPhoneOtpValidationSchema = Joi.object({
  otp: Joi.string().length(6).required().messages({
    "string.empty": "OTP is required.",
    "string.length": "OTP must be exactly 6 characters long.",
  }),
  phoneNumber: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .messages({
      "string.empty": "Phone number is required.",
      "string.pattern.base": "Please provide a valid phone number.",
    }),
});
