import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { encrypt } from "../../../helper/helper";
import { UserResponse } from "../../../dto/user.dto";
import ApiError from "../../../utils/api-error";
import ApiResponse from "../../../utils/api-response";
import { MESSAGES } from "../../../utils/message-codes";
import { User } from "../../../models/member/auth/user.models";
import { sendOtpEmail, sendOtpPhone } from "../../../services/otp.service";
import { isUUID } from "class-validator";
import { v4 as uuidv4 } from "uuid";
import {
  UsersVerification,
  VerificationType,
} from "../../../models/member/auth/user-verification";
import { generateOtpWithExpiration } from "../../../utils/otp-helper";
import { Session } from "../../../models/member/auth/user-sessions.models";
import {  uploadToS3 } from "../../../services/s3.service";
import sharp from "sharp";
import { ValidationHelper } from "../../../utils/validation.helper";
import { SelectedBrand } from "../../../models/member/selected-brands/selected-brands.models";
import { UserBrandInteraction } from "../../../models/member/brand-interaction/user-brand-interaction.models";

export class UserController {
  static async requestPhoneNumberVerification(req: Request, res: Response) {
    const { phoneNumber } = req.body;
    const { userId } = (req as any).user;

    try {
      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(MESSAGES.NOT_FOUND._CODE, null, "User not found"),
        });
      }

      if (user.phoneNumber !== phoneNumber && !user.isPhoneVerified) {
        user.phoneNumber = phoneNumber;
        await userRepository.save(user);
      }

      if (user.isPhoneVerified) {
        return res.status(MESSAGES.CONFLICT._CODE).json({
          error: new ApiError(
            MESSAGES.CONFLICT._CODE,
            null,
            "Phone number is already verified."
          ),
        });
      }

      const { otp, otpExpiration } = generateOtpWithExpiration();

      if (!otp) {
        return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
          error: new ApiError(
            MESSAGES.INTERNAL_SERVER_ERROR._CODE,
            null,
            "OTP generation failed."
          ),
        });
      }

      const otpSent = await sendOtpPhone(phoneNumber, otp);

      if (!otpSent) {
        return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
          error: new ApiError(
            MESSAGES.INTERNAL_SERVER_ERROR._CODE,
            null,
            "Failed to send OTP email."
          ),
        });
      }

      const userVerification = new UsersVerification();
      userVerification.verificationType =
        VerificationType.PhoneNumberVerification;
      userVerification.otp = otp;
      userVerification.otpExpiration = otpExpiration;
      userVerification.requestedAt = new Date();
      userVerification.user = user;

      const verificationRepository = getRepository(UsersVerification);
      await verificationRepository.save(userVerification);

      return res
        .status(MESSAGES.CREATED._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            null,
            "OTP sent to phone number successfully."
          )
        );
    } catch (error) {
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          MESSAGES.INTERNAL_SERVER_ERROR.message
        ),
      });
    }
  }
  static async verifyPhoneNumberOtp(req: Request, res: Response) {
    const { phoneNumber, otp } = req.body;

    try {
      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ where: { phoneNumber } });

      if (!user) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(MESSAGES.NOT_FOUND._CODE, null, "User not found"),
        });
      }

      if (user.isPhoneVerified) {
        return res.status(MESSAGES.CONFLICT._CODE).json({
          error: new ApiError(
            MESSAGES.CONFLICT._CODE,
            null,
            "Phone number is already verified."
          ),
        });
      }

      const verificationRepository = getRepository(UsersVerification);
      const verification = await verificationRepository.findOne({
        where: {
          userId: user.id,
          otp,
          isUsed: false,
          verificationType: VerificationType.PhoneNumberVerification,
        },
        order: { requestedAt: "DESC" },
      });

      if (!verification) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            "Invalid or expired OTP."
          ),
        });
      }

      const currentTime = new Date();
      if (
        verification.otpExpiration &&
        currentTime > verification.otpExpiration
      ) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            "OTP has expired. Please request a new one."
          ),
        });
      }

      user.isPhoneVerified = true;
      await userRepository.save(user);

      verification.isUsed = true;
      await verificationRepository.save(verification);

      return res
        .status(MESSAGES.SUCCESS._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            null,
            "Phone number verified successfully."
          )
        );
    } catch (error) {
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          MESSAGES.INTERNAL_SERVER_ERROR.message
        ),
      });
    }
  }
  static async setNewPassword(req: Request, res: Response) {
    const { currentPassword, newPassword } = req.body;
    const { userId } = (req as any).user;

    try {
      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(MESSAGES.NOT_FOUND._CODE, null, "User not found"),
        });
      }

      const isPasswordValid = encrypt.comparePassword(
        user.password,
        currentPassword
      );
      if (!isPasswordValid) {
        return res.status(MESSAGES.UNAUTHORIZED._CODE).json({
          error: new ApiError(
            MESSAGES.UNAUTHORIZED._CODE,
            null,
            "Current password is incorrect."
          ),
        });
      }

      const isSameAsOld = await encrypt.comparePassword(
        user.password,
        newPassword
      );
      if (isSameAsOld) {
        return res.status(MESSAGES.UNAUTHORIZED._CODE).json({
          error: new ApiError(
            MESSAGES.UNAUTHORIZED._CODE,
            null,
            "You cannot use your old password. Please choose a new one."
          ),
        });
      }

      if (!ValidationHelper.isValidPassword(newPassword)) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character (@)."
          ),
        });
      }

      const encryptedPassword = await encrypt.encryptPass(newPassword);
      if (!encryptedPassword) {
        return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
          error: new ApiError(
            MESSAGES.INTERNAL_SERVER_ERROR._CODE,
            null,
            "Password encryption failed."
          ),
        });
      }

      user.password = encryptedPassword;
      await userRepository.save(user);

      return res
        .status(MESSAGES.SUCCESS._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            null,
            "Password updated successfully."
          )
        );
    } catch (error) {
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          MESSAGES.INTERNAL_SERVER_ERROR.message
        ),
      });
    }
  }
  static async getUser(req: Request, res: Response) {
    const { userId } = (req as any).user;

    try {
      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(MESSAGES.NOT_FOUND._CODE, null, "User not found"),
        });
      }

      const { password, rememberTokenExpiry, ...data } = user;

      return res
        .status(MESSAGES.SUCCESS._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            data,
            "User retrieved successfully."
          )
        );
    } catch (error) {
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          MESSAGES.INTERNAL_SERVER_ERROR.message
        ),
      });
    }
  }
  static async updateProfile(req: Request, res: Response) {
    const { fullName } = req.body;
    const { userId } = (req as any).user;

    if (
      !fullName ||
      typeof fullName !== "string" ||
      fullName.trim().length === 0
    ) {
      return res.status(MESSAGES.BAD_REQUEST._CODE).json({
        error: new ApiError(
          MESSAGES.BAD_REQUEST._CODE,
          null,
          "Full name is required and must be a valid string."
        ),
      });
    }

    try {
      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(MESSAGES.NOT_FOUND._CODE, null, "User not found"),
        });
      }

      user.fullName = fullName.trim();
      await userRepository.save(user);

      return res
        .status(MESSAGES.SUCCESS._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            user,
            "Profile updated successfully"
          )
        );
    } catch (error) {
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          MESSAGES.INTERNAL_SERVER_ERROR.message
        ),
      });
    }
  }
  static async uploadProfilePicture(req: Request, res: Response) {
    try {
      const { userId } = (req as any).user;
      const file = req.file; 

      if (!file) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            "Bad Request! No files were uploaded"
          ),
        });
      }
  
      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });
  
      if (!user) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(MESSAGES.NOT_FOUND._CODE, null, "User not found"),
        });
      }
  
      const fileBuffer = file.buffer;
  
      const metadata = await sharp(fileBuffer).metadata();
      console.log("height: ", metadata.height, "width: ", metadata.width);
  
      if (metadata.width > 1000 || metadata.height > 1000) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            "Image dimensions must be lesser than 1000x1000"
          ),
        });
      }
  
      const profilePictureUrl = await uploadToS3(
        fileBuffer,
        "member-upload-profile-userId",
        userId
      );
  
      if (!profilePictureUrl) {
        return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
          error: new ApiError(
            MESSAGES.INTERNAL_SERVER_ERROR._CODE,
            null,
            "Failed to upload profile picture."
          ),
        });
      }
  
      user.profilePictureUrl = profilePictureUrl;
      await userRepository.save(user);
  
      return res
        .status(MESSAGES.SUCCESS._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            { profilePicture: profilePictureUrl },
            "Profile picture uploaded successfully."
          )
        );
    } catch (error) {
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          MESSAGES.INTERNAL_SERVER_ERROR.message
        ),
      });
    }
  }  
  static async deleteUser(req: Request, res: Response) {
    const { email } = req.body;

    try {
      const userRepository = getRepository(User);
      const sessionRepository = getRepository(Session);
      const selectedBrandRepository = getRepository(SelectedBrand);
      const interactionRepository = getRepository(UserBrandInteraction);
      if (!email || typeof email !== "string") {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            "Valid email is required"
          ),
        });
      }
      const user = await userRepository.findOne({ where: { email } });

      if (!user) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(MESSAGES.NOT_FOUND._CODE, null, "User not found"),
        });
      }

      await sessionRepository.delete({ user: { id: user.id } });
      await selectedBrandRepository.delete({ user: { id: user.id } });
      await interactionRepository.delete({ user: { id: user.id } });

      const userDelete = await userRepository.remove(user);

      if (!userDelete) {
        return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
          error: new ApiError(
            MESSAGES.INTERNAL_SERVER_ERROR._CODE,
            null,
            "Failed to delete user"
          ),
        });
      }

      return res
        .status(MESSAGES.SUCCESS._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            null,
            "User and all related data deleted successfully"
          )
        );
    } catch (error) {
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          MESSAGES.INTERNAL_SERVER_ERROR.message
        ),
      });
    }
  }
}
