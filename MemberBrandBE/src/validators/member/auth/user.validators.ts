import Joi from "joi";

export const userValidationSchema = Joi.object({
  fullName: Joi.string().min(3).max(50).required().messages({
    "string.empty": "Full name is required.",
    "string.min": "Full name should have a minimum length of 3 characters.",
    "string.max": "Full name should have a maximum length of 50 characters.",
  }),
  email: Joi.string()
    .email()
    .pattern(/^[\w.%+-]+@[a-zA-Z0-9.-]+\.(com)$/)
    .required()
    .messages({
      "string.empty": "Email is required.",
      "string.email": "Please provide a valid email address.",
      "string.pattern.base": "Email must be a valid email address.",
    }),
  password: Joi.string().min(8).required().messages({
    "string.empty": "Password is required.",
    "string.min": "Password should have a minimum length of 8 characters.",
  }),
  termsAgreed: Joi.boolean().valid(true).required().messages({
    "any.only": "You must agree to the terms and conditions.",
    "boolean.base": "Terms agreed must be a boolean value.",
  }),
  referralCode: Joi.string().min(5).optional().messages({
    "string.empty": "Referral code is required.",
    "string.min": "Referral code should have a minimum length of 5 characters.",
  }),
});

export const otpValidationSchema = Joi.object({
  email: Joi.string()
    .email()
    .pattern(/^[\w.%+-]+@[a-zA-Z0-9.-]+\.(com)$/)
    .required()
    .messages({
      "string.empty": "Email is required.",
      "string.email": "Please provide a valid email address.",
      "string.pattern.base": "Email must be a valid email address.",
    }),
  otp: Joi.string().length(6).required().messages({
    "string.empty": "OTP is required.",
    "string.length": "OTP must be exactly 6 characters long.",
  }),
  verificationType: Joi.string()
    .valid("AccountCreation", "PasswordReset")
    .required()
    .messages({
      "any.only":
        'Verification type must be either "AccountCreation" or "PasswordReset".',
      "string.empty": "Verification type is required.",
    }),
});

export const requestNewOtpValidationSchema = Joi.object({
  email: Joi.string()
    .email()
    .pattern(/^[\w.%+-]+@[a-zA-Z0-9.-]+\.(com)$/)
    .messages({
      "string.empty": "Email is required.",
      "string.email": "Please provide a valid email address.",
      "string.pattern.base":
        "Email must be a valid email address ending with '.com'.",
    }),
  phoneNumber: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .messages({
      "string.empty": "Phone number is required.",
      "string.pattern.base": "Please provide a valid phone number.",
    }),
  verificationType: Joi.string()
    .valid("AccountCreation", "PasswordReset")
    .required()
    .messages({
      "any.only":
        'Verification type must be either "AccountCreation" or "PasswordReset".',
      "string.empty": "Verification type is required.",
    }),
});

export const loginValidationSchema = Joi.object({
  email: Joi.string()
    .email()
    .pattern(/^[\w.%+-]+@[a-zA-Z0-9.-]+\.(com)$/)
    .messages({
      "string.empty": "Email is required.",
      "string.email": "Please provide a valid email address.",
      "string.pattern.base": "Email must be a valid email address.",
    }),
  phoneNumber: Joi.string().messages({
    "string.empty": "Phone number is required.",
    "string.pattern.base":
      "Phone number must be a valid number with 10 to 15 digits.",
  }),
  password: Joi.string().min(8).required().messages({
    "string.empty": "Password is required.",
    "string.min": "Password should have a minimum length of 8 characters.",
  }),
  rememberMe: Joi.boolean().optional().messages({
    "boolean.base": "Remember Me must be a boolean value.",
  }),
  deviceType: Joi.string()
    .valid("Mobile", "Desktop", "Tablet", "Unknown")
    .optional()
    .messages({
      "string.base": "Device type must be a string.",
      "any.only":
        "Device type must be one of 'Mobile', 'Desktop', 'Tablet', or 'Unknown'.",
    }),
  ipAddress: Joi.string()
    .ip({ version: ["ipv4", "ipv6"], cidr: "optional" })
    .optional()
    .messages({
      "string.ip": "Please provide a valid IP address.",
    }),
})
  .xor("email", "phoneNumber")
  .messages({
    "object.missing": "Either email or phone number is required for login.",
  });

export const forgotPasswordValidationSchema = Joi.object({
  email: Joi.string()
    .email()
    .pattern(/^[\w.%+-]+@[a-zA-Z0-9.-]+\.(com)$/)
    .messages({
      "string.empty": "Email is required.",
      "string.email": "Please provide a valid email address.",
      "string.pattern.base":
        "Email must be a valid email address ending with '.com'.",
    }),
  phoneNumber: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .messages({
      "string.empty": "Phone number is required.",
      "string.pattern.base": "Please provide a valid phone number.",
    }),
})
  .xor("email", "phoneNumber")
  .messages({
    "object.missing": "Either email or phone number is required.",
  });

export const resetPasswordValidationSchema = Joi.object({
  email: Joi.string()
    .email()
    .pattern(/^[\w.%+-]+@[a-zA-Z0-9.-]+\.(com)$/)
    .required()
    .messages({
      "string.empty": "Email is required.",
      "string.email": "Please provide a valid email address.",
      "string.pattern.base": "Email must be a valid email address.",
    }),
  newPassword: Joi.string().min(8).required().messages({
    "string.empty": "Password is required.",
    "string.min": "Password should have a minimum length of 8 characters.",
  }),
  otp: Joi.string().length(6).required().messages({
    "string.empty": "OTP is required.",
    "string.length": "OTP must be exactly 6 characters long.",
  }),
});
