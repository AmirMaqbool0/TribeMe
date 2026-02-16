import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import ApiError from "../utils/api-error";
import { MESSAGES } from "../utils/message-codes";

import {
  userValidationSchema,
  otpValidationSchema,
  loginValidationSchema,
  requestNewOtpValidationSchema,
  forgotPasswordValidationSchema,
  resetPasswordValidationSchema,
} from "../validators/member/auth/user.validators";
import {
  reqPhoneVerificationValidationSchema,
  setNewPasswordValidationSchema,
  verifyPhoneOtpValidationSchema,
} from "../validators/member/profile/profile.validators";
import {
  updateUserSelectedInterestsBrandsValidationSchema,
  userSelectedInterestsBrandsValidationSchema,
} from "../validators/member/user-interests/user-interests.validators";
import {
  createOffersValidationSchema,
  deleteOfferByIdValidationSchema,
  loginValidationBrandsSchema,
  renewOfferValidationSchema,
  setNewPasswordBrandsValidationSchema,
  updateBrandValidationSchema,
  updateOfferByIdValidationSchema,
  uploadBrandLogoValidationSchema,
  uploadOfferValidationSchema,
} from "../validators/brands/brand.validators";

const schemaMap: Record<string, Joi.ObjectSchema> = {
  // ---------------------MEMBER APP----------------------

  //member authentication
  "/create-user": userValidationSchema,
  "/verify-otp": otpValidationSchema,
  "/request-new-otp": requestNewOtpValidationSchema,
  "/login": loginValidationSchema,
  "/forgot-password": forgotPasswordValidationSchema,
  "/reset-new-password": resetPasswordValidationSchema,

  //profile
  "/user/request-phone-verification": reqPhoneVerificationValidationSchema,
  "/user/verify-phone-otp": verifyPhoneOtpValidationSchema,
  "/user/set-new-password": setNewPasswordValidationSchema,

  //user-interests
  "/user-interests/select-interests":
    userSelectedInterestsBrandsValidationSchema,
  "/user-interests/update-interests":
    updateUserSelectedInterestsBrandsValidationSchema,

  // ---------------------BRANDS ADMIN-------------------

  // brands authentication
  "/create-password": setNewPasswordBrandsValidationSchema,
  "/brands/login": loginValidationBrandsSchema,

  //brand section
  "/brand/upload-logo/:brandId": uploadBrandLogoValidationSchema,
  "/brand/:brandId": updateBrandValidationSchema,

  //offer section
  "/brand/upload-offers/:offerId": uploadOfferValidationSchema,
  "/brand/create-offers": createOffersValidationSchema,
  "/brand/offers/remove/:offerId": deleteOfferByIdValidationSchema,
  "/brand/offers/update/:offerId": updateOfferByIdValidationSchema,
  "/brand/offers/renew/:offerId": renewOfferValidationSchema,
};

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = schemaMap[req.path];

  if (!schema) {
    return next();
  }

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(MESSAGES.BAD_REQUEST._CODE).json({
      error: new ApiError(
        MESSAGES.BAD_REQUEST._CODE,
        null,
        error.details.map((err) => err.message).join(", ")
      ),
    });
  }

  next();
};
