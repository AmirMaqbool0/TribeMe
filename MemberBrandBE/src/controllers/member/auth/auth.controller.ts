import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { encrypt } from "../../../helper/helper";
import { UserResponse, UserRole } from "../../../dto/user.dto";
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
import {
  generateOtpWithExpiration,
  OTP_VALIDITY_PERIOD,
} from "../../../utils/otp-helper";
import { Session } from "../../../models/member/auth/user-sessions.models";
import { generateReferralCode } from "../../../services/referral-code.service";
import { rewards } from "../../../services/rewards-points.service";
import { Brand } from "../../../models/brand/auth/auth-brand.models";
import { ValidationHelper } from "../../../utils/validation.helper";
import { Wallet } from "../../../models/member/wallet/wallet.models";
import { FcmService } from "../../../services/fcm.service";
import { NotificationType } from "../../../models/member/notification/notification.models";

    export class AuthController {
      static async createUser(req: Request, res: Response) {
        const { fullName, email, password, termsAgreed, referralCode } = req.body;
      
        try {
          const normalizedEmail = ValidationHelper.isValidEmail(email);
          console.log("email", normalizedEmail);
      
          if (!ValidationHelper.isValidPassword(password)) {
            return res.status(MESSAGES.BAD_REQUEST._CODE).json({
              error: new ApiError(
                MESSAGES.BAD_REQUEST._CODE,
                null,
                "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character (@)."
              ),
            });
          }
      
          const encryptedPassword = await encrypt.encryptPass(password);
      
          if (!encryptedPassword) {
            return res.status(MESSAGES.BAD_REQUEST._CODE).json({
              error: new ApiError(
                MESSAGES.BAD_REQUEST._CODE,
                null,
                "Password is not encrypting."
              ),
            });
          }
      
          const existingUser = await getRepository(User).findOne({
            where: { email: normalizedEmail },
          });
      
          if (existingUser) {
            if (!existingUser.isEmailVerified) {
              return res.status(MESSAGES.UNVERIFIED_ACCOUNT._CODE).json({
                error: new ApiError(
                  MESSAGES.UNVERIFIED_ACCOUNT._CODE,
                  null,
                  "Account exists but is not verified. Please verify your account."
                ),
              });
            }
      
            return res.status(MESSAGES.CONFLICT._CODE).json({
              error: new ApiError(
                MESSAGES.CONFLICT._CODE,
                null,
                "Email address already exists"
              ),
            });
          }
      
          let referrerUser;
          if (referralCode) {
            referrerUser = await getRepository(User).findOne({
              where: { referralCode },
            });
      
            if (!referrerUser) {
              return res.status(MESSAGES.BAD_REQUEST._CODE).json({
                error: new ApiError(
                  MESSAGES.BAD_REQUEST._CODE,
                  null,
                  "This referral code is not associated with any referrer."
                ),
              });
            }
          }
      
          const { otp, otpExpiration } = generateOtpWithExpiration();
      
          if (!otp) {
            return res.status(MESSAGES.BAD_REQUEST._CODE).json({
              error: new ApiError(
                MESSAGES.BAD_REQUEST._CODE,
                null,
                "OTP could not be generated."
              ),
            });
          }
      
          const otpSent = await sendOtpEmail(normalizedEmail, otp);
      
          if (!otpSent) {
            return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
              error: new ApiError(
                MESSAGES.INTERNAL_SERVER_ERROR._CODE,
                null,
                "Failed to send OTP email."
              ),
            });
          }
      
          const user = new User();
          user.fullName = fullName;
          user.email = normalizedEmail;
          user.password = encryptedPassword;
          user.isEmailVerified = false;
          user.termsAgreed = termsAgreed;
          user.referralCode = await generateReferralCode();
          user.referrer = referrerUser ? referrerUser.referralCode : null;
      
          const userRepository = getRepository(User);
          await userRepository.save(user);
      
          const userVerification = new UsersVerification();
          userVerification.verificationType = VerificationType.AccountCreation;
          userVerification.otp = otp;
          userVerification.otpExpiration = otpExpiration;
          userVerification.requestedAt = new Date();
          userVerification.user = user;
      
          const verificationRepository = getRepository(UsersVerification);
          await verificationRepository.save(userVerification);
      
          // Create wallet for the new user with 0 points and coins
          let userWallet = await getRepository(Wallet).findOne({
            where: { user: { id: user.id } },
          });
      
          if (!userWallet) {
            userWallet = new Wallet();
            userWallet.user = user;
            userWallet.coins = 0;
            userWallet.points = 0;
            await getRepository(Wallet).save(userWallet);
          }
      
          const token = encrypt.generateToken<UserResponse>({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            isEmailVerified: user.isEmailVerified,
            role: UserRole.MEMBER,
          });
      
          const userSignup = {
            id: user.id,
            name: user.fullName,
            email: user.email,
            termsAgreed: termsAgreed,
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          };
      
          return res.status(MESSAGES.CREATED._CODE).json(
            new ApiResponse(
              MESSAGES.SUCCESS._CODE,
              userSignup,
              `OTP has been sent to your email address. Please verify OTP in ${OTP_VALIDITY_PERIOD} seconds.`
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
          
  
    static async verificationTypeOtp(req: Request, res: Response) {
      const { email, phoneNumber, otp, verificationType } = req.body;
    
      try {
        const normalizedEmail = ValidationHelper.isValidEmail(email);
        const userRepository = getRepository(User);
        const walletRepository = getRepository(Wallet);
        let user;
        if (email) {
          user = await userRepository.findOne({
             where: { email: normalizedEmail },
             });
        } else if (phoneNumber) {
          user = await userRepository.findOne({ where: { phoneNumber } });
        }
    
        if (!user) {
          return res.status(MESSAGES.NOT_FOUND._CODE).json({
            error: new ApiError(MESSAGES.NOT_FOUND._CODE, null, "User not found"),
          });
        }
    
        const verificationRepository = getRepository(UsersVerification);
        const verification = await verificationRepository.findOne({
          where: {
            userId: user.id,
            otp,
            isUsed: false,
            verificationType: verificationType,
          },
          order: { requestedAt: "DESC" },
          relations: ["user"],
        });
    
        if (!verification) {
          return res.status(MESSAGES.NOT_FOUND._CODE).json({
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
          return res.status(MESSAGES.NOT_FOUND._CODE).json({
            error: new ApiError(
              MESSAGES.NOT_FOUND._CODE,
              null,
              "OTP has expired. Please request a new one."
            ),
          });
        }
    
        let responseMessage;
        let responseData: any = {};
    
        if (verification.verificationType === VerificationType.AccountCreation) {
          if (!user.isEmailVerified) {
            user.isEmailVerified = true;
            await userRepository.save(user);
    
            let userWallet = await walletRepository.findOne({
              where: { user: { id: user.id } },
            });
            console.log("user wallet: ", userWallet);

            if (!userWallet) {
              userWallet = walletRepository.create({
                user: user,
                coins: 0,
                points: 0,
              });
              await walletRepository.save(userWallet);
            }
            
            // Only process referral rewards after email verification
            if (user.referrer) {
              // Find the referrer using the referral code
              const directReferrer = await userRepository.findOne({
                where: { referralCode: user.referrer },
              });
            
              if (directReferrer) {
                // Update the referrer's wallet first - this is our source of truth
                let directReferrerWallet = await getRepository(Wallet).findOne({
                  where: { user: { id: directReferrer.id } },
                });
              
                if (!directReferrerWallet) {
                  // Create a new wallet for the referrer if it doesn't exist
                  directReferrerWallet = walletRepository.create({
                    user: directReferrer,
                    points: rewards.referral.direct.join,
                    coins: 0,
                  });
                } else {
                  // Add points to referrer's existing wallet
                  directReferrerWallet.points += rewards.referral.direct.join;
                  // Ensure proper numeric handling for coins
                  directReferrerWallet.coins = Number(directReferrerWallet.coins || 0);
                }
                await walletRepository.save(directReferrerWallet);
                // Sync user record with wallet values
                directReferrer.points = directReferrerWallet.points;
                directReferrer.coins = Number(directReferrerWallet.coins);
                await userRepository.save(directReferrer);

                // Send referral reward notification to direct referrer
                try {
                  const fcmTemplate = FcmService.getReferralRewardNotification(
                    rewards.referral.direct.join,
                    0, // No coins for direct referral on join
                    user.fullName
                  );

                  const fcmPayload = {
                    title: fcmTemplate.title,
                    body: fcmTemplate.body,
                    data: {
                      ...fcmTemplate.data,
                      referredUserId: user.id,
                      rewardType: 'direct_referral_join',
                    },
                  };

                  await FcmService.sendToUser(
                    directReferrer.id,
                    fcmPayload,
                    NotificationType.REFERRAL_REWARD
                  );

                  console.log(`Direct referral reward notification sent to user ${directReferrer.id}`);
                } catch (fcmError) {
                  console.error("Error sending direct referral reward notification:", fcmError);
                  // Don't fail the request if notification fails
                }
              
                // Now check if there's an indirect referrer
                if (directReferrer.referrer) {
                  const indirectReferrer = await userRepository.findOne({
                    where: { referralCode: directReferrer.referrer },
                  });
                
                  if (indirectReferrer) {
                    // Update indirect referrer's wallet first
                    let indirectReferrerWallet = await getRepository(Wallet).findOne({
                      where: { user: { id: indirectReferrer.id } },
                    });
                
                    if (!indirectReferrerWallet) {
                      indirectReferrerWallet = walletRepository.create({
                        user: indirectReferrer,
                        points: rewards.referral.indirect.join,
                        coins: 0,
                      });
                    } else {
                      // Add points to indirect referrer's existing wallet
                      indirectReferrerWallet.points += rewards.referral.indirect.join;
                      // Ensure proper numeric handling for coins
                      indirectReferrerWallet.coins = Number(indirectReferrerWallet.coins || 0);
                    }
                    await walletRepository.save(indirectReferrerWallet);                    // Sync user record with wallet values
                    indirectReferrer.points = indirectReferrerWallet.points;
                    indirectReferrer.coins = Number(indirectReferrerWallet.coins);
                    await userRepository.save(indirectReferrer);

                    // Send referral reward notification to indirect referrer
                    try {
                      const fcmTemplate = FcmService.getReferralRewardNotification(
                        rewards.referral.indirect.join,
                        0, // No coins for indirect referral on join
                        user.fullName
                      );

                      const fcmPayload = {
                        title: fcmTemplate.title,
                        body: fcmTemplate.body,
                        data: {
                          ...fcmTemplate.data,
                          referredUserId: user.id,
                          rewardType: 'indirect_referral_join',
                        },
                      };

                      await FcmService.sendToUser(
                        indirectReferrer.id,
                        fcmPayload,
                        NotificationType.REFERRAL_REWARD
                      );

                      console.log(`Indirect referral reward notification sent to user ${indirectReferrer.id}`);
                    } catch (fcmError) {
                      console.error("Error sending indirect referral reward notification:", fcmError);
                      // Don't fail the request if notification fails
                    }
                  }
                }
              }
            }            const token = encrypt.generateToken<UserResponse>({
              id: user.id,
              fullName: user.fullName,
              email: user.email,
              isEmailVerified: user.isEmailVerified,
              role: UserRole.MEMBER,
            });

            // Send welcome notification after successful email verification
            try {
              const fcmTemplate = FcmService.getWelcomeNotification(user.fullName);

              const fcmPayload = {
                title: fcmTemplate.title,
                body: fcmTemplate.body,
                data: {
                  ...fcmTemplate.data,
                  userId: user.id,
                },
              };

              await FcmService.sendToUser(
                user.id,
                fcmPayload,
                NotificationType.WELCOME
              );

              console.log(`Welcome notification sent to user ${user.id}`);
            } catch (fcmError) {
              console.error("Error sending welcome notification:", fcmError);
              // Don't fail the request if notification fails
            }
    
            responseMessage = "Account verification successful.";
            responseData = { token };
          } else {
            return res.status(MESSAGES.CONFLICT._CODE).json({
              error: new ApiError(
                MESSAGES.CONFLICT._CODE,
                null,
                "Account is already verified."
              ),
            });
          }
        } else if (
          verification.verificationType === VerificationType.PasswordReset
        ) {
          const resetToken = encrypt.generateToken(
            {
              userId: user.id,
              email: user.email,
              purpose: "passwordReset",
            },
            "15m" 
          );
    
          responseMessage = "OTP verified successfully for password reset.";
          responseData = { resetToken }; 
        } else {
          return res.status(MESSAGES.BAD_REQUEST._CODE).json({
            error: new ApiError(
              MESSAGES.BAD_REQUEST._CODE,
              null,
              "Invalid verification type."
            ),
          });
        }
    
        verification.isUsed = true;
        await verificationRepository.save(verification);
    
        return res
          .status(MESSAGES.SUCCESS._CODE)
          .json(
            new ApiResponse(MESSAGES.SUCCESS._CODE, responseData, responseMessage)
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
            
  static async requestNewOtp(req: Request, res: Response) {
    const { email, phoneNumber, verificationType } = req.body;

    try {
      const normalizedEmail = ValidationHelper.isValidEmail(email);
      const userRepository = getRepository(User);
      let user;

      if (email) {
        user = await userRepository.findOne({
          where: { email: normalizedEmail },
        });
      } else if (phoneNumber) {
        user = await userRepository.findOne({ where: { phoneNumber } });
      } else {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            "Email or phone number is required."
          ),
        });
      }

      if (!user) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(MESSAGES.NOT_FOUND._CODE, null, "User not found"),
        });
      }

      const verificationRepository = getRepository(UsersVerification);

      await verificationRepository.update(
        { userId: user.id, verificationType, isUsed: false },
        { isUsed: true }
      );

      const { otp, otpExpiration } = generateOtpWithExpiration();

      const userVerification = new UsersVerification();
      userVerification.verificationType = verificationType as VerificationType;
      userVerification.otp = otp;
      userVerification.otpExpiration = otpExpiration;
      userVerification.requestedAt = new Date();
      userVerification.isUsed = false;

      userVerification.user = user;

      await verificationRepository.save(userVerification);

      let otpSent;
      if (email) {
        otpSent = await sendOtpEmail(normalizedEmail, otp);
      } else if (phoneNumber) {
        otpSent = await sendOtpPhone(phoneNumber, otp);
      }

      if (otpSent === false) {
        return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
          error: new ApiError(
            MESSAGES.INTERNAL_SERVER_ERROR._CODE,
            null,
            "Failed to send OTP."
          ),
        });
      }

      return res
        .status(MESSAGES.CREATED._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            null,
            "A new OTP has been sent successfully."
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

  static async login(req: Request, res: Response) {
    const { email, password, phoneNumber, rememberMe, ipAddress, deviceType } =
      req.body;
    try {
      const normalizedEmail = ValidationHelper.isValidEmail(email);
      console.log(normalizedEmail);
      const userRepository = getRepository(User);
      const sessionRepository = getRepository(Session);

      const sessionRemoved = await sessionRepository
        .createQueryBuilder()
        .delete()
        .from(Session)
        .where("expiresAt <= :now", { now: new Date() })
        .execute();

      let user;
      if (email) {
        user = await userRepository.findOneBy({ email: normalizedEmail });
      } else if (phoneNumber) {
        user = await userRepository.findOneBy({ phoneNumber });
        if (user && !user.isPhoneVerified) {
          return res.status(MESSAGES.UNAUTHORIZED._CODE).json({
            error: new ApiError(
              MESSAGES.UNAUTHORIZED._CODE,
              null,
              "Phone number not verified"
            ),
          });
        }
      }

      if (!user) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "User not found."
          ),
        });
      }

      if (!user.isEmailVerified) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "User is not verified"
          ),
        });
      }

      const isPasswordValid = encrypt.comparePassword(user.password, password);
      if (!isPasswordValid) {
        return res.status(MESSAGES.UNAUTHORIZED._CODE).json({
          error: new ApiError(
            MESSAGES.UNAUTHORIZED._CODE,
            null,
            MESSAGES.INCORRECT_CREDENTIALS.message
          ),
        });
      }

      const clearedExistingSession = await sessionRepository
        .createQueryBuilder()
        .delete()
        .from(Session)
        .where("userId = :userId AND deviceType = :deviceType", {
          userId: user.id,
          deviceType: deviceType || "Unknown",
        })
        .execute();

      const token = encrypt.generateToken<UserResponse>({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        role: UserRole.MEMBER,
      });

      const shouldRemember = rememberMe === "true";
      if (shouldRemember) {
        const expiry = 7;
        const rememberToken = encrypt.generateToken(
          { id: user.id },
          expiry.toString() + "d"
        );
        user.rememberToken = rememberMe;
        user.rememberTokenExpiry = new Date(
          Date.now() + expiry * 24 * 60 * 60 * 1000
        );

        await userRepository.save(user);

        res.cookie("rememberToken", rememberToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "testing",
          maxAge: expiry * 24 * 60 * 60 * 1000,
        });
      } else {
        user.rememberToken = null;
        user.rememberTokenExpiry = null;
        await userRepository.save(user);
        res.clearCookie("rememberToken");
      }

      const sessionToken = encrypt.generateToken({
        userId: user.id,
        deviceType,
        ipAddress,
      });

      const sessionExpiryHours = 48;
      const session = new Session();
      session.user = user;
      session.sessionToken = sessionToken;
      session.deviceType = deviceType || "Unknown";
      session.ipAddress = ipAddress || req.ip;
      session.createdAt = new Date();
      session.expiresAt = new Date(
        Date.now() + sessionExpiryHours * 60 * 60 * 1000
      );

      await sessionRepository.save(session);

      res.cookie("sessionToken", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "testing",
        maxAge: sessionExpiryHours * 60 * 60 * 1000,
      });

      const interestSelected = await userRepository.findOne({
        where: { email },
        relations: ["selectedBrands"],
      });
      console.log("interestSelected: ", interestSelected);

      const userLogin = {
        id: user.id,
        name: user.fullName,
        email: user.email,
        rememberMe: shouldRemember,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        sessionToken: sessionToken,
        token,
        isInterestSelected: interestSelected?.selectedBrands.length > 0,
      };

      return res
        .status(MESSAGES.CREATED._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            userLogin,
            "User login successfully"
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

  static async forgotPassword(req: Request, res: Response) {
    const { email, phoneNumber } = req.body;

    try {
      const normalizedEmail = ValidationHelper.isValidEmail(email);
      const userRepository = getRepository(User);
      let user;

      if (email) {
        user = await userRepository.findOne({
          where: { email: normalizedEmail, isEmailVerified: true },
        });
      } else if (phoneNumber) {
        user = await userRepository.findOne({
          where: { phoneNumber },
        });

        if (!user) {
          return res.status(MESSAGES.NOT_FOUND._CODE).json({
            error: new ApiError(
              MESSAGES.NOT_FOUND._CODE,
              null,
              "No user found with this phone number"
            ),
          });
        }

        if (!user.isPhoneVerified) {
          return res.status(MESSAGES.UNAUTHORIZED._CODE).json({
            error: new ApiError(
              MESSAGES.UNAUTHORIZED._CODE,
              null,
              "Phone number is not verified. Please use email to reset password."
            ),
          });
        }
      } else {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            "Email or phone number is required."
          ),
        });
      }

      if (!user) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "User not found."
          ),
        });
      }

      const verificationRepository = getRepository(UsersVerification);

      await verificationRepository.update(
        {
          user: user,
          verificationType: VerificationType.PasswordReset,
          isUsed: false,
        },
        { isUsed: true }
      );

      const { otp, otpExpiration } = generateOtpWithExpiration();

      const userVerification = new UsersVerification();
      userVerification.verificationType = VerificationType.PasswordReset;
      userVerification.otp = otp;
      userVerification.otpExpiration = otpExpiration;
      userVerification.requestedAt = new Date();
      userVerification.isUsed = false;
      userVerification.user = user;

      await verificationRepository.save(userVerification);

      let otpSent;
      if (email) {
        otpSent = await sendOtpEmail(normalizedEmail, otp);
      } else if (phoneNumber) {
        otpSent = await sendOtpPhone(phoneNumber, otp);
      }

      if (otpSent === false) {
        return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
          error: new ApiError(
            MESSAGES.INTERNAL_SERVER_ERROR._CODE,
            null,
            "Failed to send OTP."
          ),
        });
      }

      return res
        .status(MESSAGES.SUCCESS._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            null,
            `OTP has been sent. Please verify your account in ${OTP_VALIDITY_PERIOD} seconds to reset your password.`
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

  static async resetPassword(req: Request, res: Response) {
    const { resetToken, newPassword } = req.body;

    try {
      const decodedToken = encrypt.verifyToken<{
        userId: string;
        email: string;
        purpose: string;
      }>(resetToken);

      if (!decodedToken || decodedToken.purpose !== "passwordReset") {
        return res.status(MESSAGES.UNAUTHORIZED._CODE).json({
          error: new ApiError(
            MESSAGES.UNAUTHORIZED._CODE,
            null,
            "Invalid or expired reset token."
          ),
        });
      }

      const userRepository = getRepository(User);
      const user = await userRepository.findOne({
        where: { id: decodedToken.userId },
      });

      if (!user) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "User not found."
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
            "Failed to encrypt the new password."
          ),
        });
      }      user.password = encryptedPassword;
      await userRepository.save(user);

      // Send FCM notification for successful password reset
      try {
        const fcmTemplate = FcmService.getPasswordResetNotification(user.fullName);

        const fcmPayload = {
          title: fcmTemplate.title,
          body: fcmTemplate.body,
          data: {
            ...fcmTemplate.data,
            userId: user.id,
            resetTimestamp: new Date().toISOString(),
          },
        };

        await FcmService.sendToUser(
          user.id,
          fcmPayload,
          NotificationType.PASSWORD_RESET
        );

        console.log(`Password reset notification sent to user ${user.id}`);
      } catch (fcmError) {
        console.error("Error sending password reset notification:", fcmError);
        // Don't fail the request if notification fails
      }

      return res
        .status(MESSAGES.SUCCESS._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            null,
            "Password has been reset successfully."
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

  static async googleCallback(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(MESSAGES.UNAUTHORIZED._CODE).json({
          error: new ApiResponse(
            MESSAGES.UNAUTHORIZED._CODE,
            null,
            "User not authenticated"
          ),
        });
      }

      const user = req.user as User;

      const userRepository = getRepository(User);
      const sessionRepository = getRepository(Session);

      const fullUser = await userRepository.findOne({
        where: { id: user.id },
        relations: ["selectedBrands"],
      });
      // console.log("fullUser", fullUser);

      if (!fullUser) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(MESSAGES.NOT_FOUND._CODE, null, "User not found"),
        });
      }

      const sessionExpiryHours = 336;
      const sessionToken = encrypt.generateToken({
        userId: fullUser.id,
        deviceType: "Google Login",
        ipAddress: req.ip || "Unknown",
      });
      console.log("sessionToken generated: ", sessionToken);

      const deletingExistingSession = await sessionRepository
        .createQueryBuilder()
        .delete()
        .from(Session)
        .where("userId = :userId", { userId: fullUser.id })
        .execute();

      deletingExistingSession
        ? console.log("existing session deleted")
        : console.log("no existing session to delete");

      const session = new Session();
      session.user = fullUser;
      session.sessionToken = sessionToken;
      session.deviceType = "Google Login";
      session.ipAddress = req.ip || "Unknown";
      session.createdAt = new Date();
      session.expiresAt = new Date(
        Date.now() + sessionExpiryHours * 60 * 60 * 1000
      );

      await sessionRepository.save(session);

      res.cookie("sessionToken", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "testing",
        maxAge: sessionExpiryHours * 60 * 60 * 1000,
      });

      console.log("Google Login Session Created:", session);

      const token = encrypt.generateToken<UserResponse>({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        role: UserRole.MEMBER,
      });

      const baseUrl = "memberapp://";
      let redirectUrl;

      if (fullUser.selectedBrands.length === 0 || !fullUser.selectedBrands) {
        console.log(
          "new user or interests not set/removed. HAS INTEREST CHECK"
        );
        redirectUrl = `${baseUrl}interests?isNewUser=true&token=${encodeURIComponent(
          token
        )}`;
      } else {
        redirectUrl = `${baseUrl}dashboard?token=${encodeURIComponent(token)}`;
      }

      const htmlResponse = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Open in App</title>
            <style>
                body, html {
                    height: 100%;
                    margin: 0;
                    font-family: Arial, sans-serif;
                    background: #f4f4f9;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                }
                .container {
                    max-width: 600px;
                    margin: auto;
                    padding: 20px;
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                h1 {
                    color: #333;
                }
                p {
                    color: #666;
                    font-size: 16px;
                }
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    font-size: 18px;
                    cursor: pointer;
                    background-color: #007BFF;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    text-decoration: none;
                }
                .button:hover {
                    background-color: #0056b3;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Welcome to MemberApp!</h1>
                <p>Click the button below to open the app and continue:</p>
                <a href="${redirectUrl}" class="button">Open MemberApp</a>
            </div>
        </body>
        </html>
      `;
      res.redirect(redirectUrl);
      // return res.status(200).send(htmlResponse);
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

  static async appleCallback(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(MESSAGES.UNAUTHORIZED._CODE).json({
          error: new ApiResponse(
            MESSAGES.UNAUTHORIZED._CODE,
            null,
            "User not authenticated"
          ),
        });
      }

      const user = req.user as User;
      const userRepository = getRepository(User);
      const sessionRepository = getRepository(Session);

      const fullUser = await userRepository.findOne({
        where: { id: user.id },
        relations: ["selectedBrands"],
      });

      if (!fullUser) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(MESSAGES.NOT_FOUND._CODE, null, "User not found"),
        });
      }

      const sessionExpiryHours = 336;
      const sessionToken = encrypt.generateToken({
        userId: fullUser.id,
        deviceType: "Apple Login",
        ipAddress: req.ip || "Unknown",
      });

      await sessionRepository
        .createQueryBuilder()
        .delete()
        .from(Session)
        .where("userId = :userId", { userId: fullUser.id })
        .execute();

      const session = new Session();
      session.user = fullUser;
      session.sessionToken = sessionToken;
      session.deviceType = "Apple Login";
      session.ipAddress = req.ip || "Unknown";
      session.createdAt = new Date();
      session.expiresAt = new Date(
        Date.now() + sessionExpiryHours * 60 * 60 * 1000
      );

      await sessionRepository.save(session);

      res.cookie("sessionToken", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: sessionExpiryHours * 60 * 60 * 1000,
      });

      const token = encrypt.generateToken<UserResponse>({
        id: fullUser.id,
        fullName: fullUser.fullName,
        email: fullUser.email,
        isEmailVerified: fullUser.isEmailVerified,
        role: UserRole.MEMBER,
      });

      const baseUrl = "memberapp://";
      let redirectUrl;

      if (!fullUser.selectedBrands || fullUser.selectedBrands.length === 0) {
        redirectUrl = `${baseUrl}interests?isNewUser=true&token=${encodeURIComponent(
          token
        )}`;
      } else {
        redirectUrl = `${baseUrl}dashboard?token=${encodeURIComponent(token)}`;
      }

      const htmlResponse = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Open in App</title>
            <style>
                body, html {
                    height: 100%;
                    margin: 0;
                    font-family: Arial, sans-serif;
                    background: #f4f4f9;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                }
                .container {
                    max-width: 600px;
                    margin: auto;
                    padding: 20px;
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                h1 {
                    color: #333;
                }
                p {
                    color: #666;
                    font-size: 16px;
                }
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    font-size: 18px;
                    cursor: pointer;
                    background-color: #007BFF;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    text-decoration: none;
                }
                .button:hover {
                    background-color: #0056b3;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Welcome to MemberApp!</h1>
                <p>Click the button below to open the app and continue:</p>
                <a href="${redirectUrl}" class="button">Open MemberApp</a>
            </div>
        </body>
        </html>
      `;

      return res.status(200).send(htmlResponse);
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

  static async facebookCallback(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(MESSAGES.UNAUTHORIZED._CODE).json({
          error: new ApiResponse(
            MESSAGES.UNAUTHORIZED._CODE,
            null,
            "User not authenticated"
          ),
        });
      }

      const user = req.user as User;
      const userRepository = getRepository(User);
      const sessionRepository = getRepository(Session);

      const fullUser = await userRepository.findOne({
        where: { id: user.id },
        relations: ["selectedBrands"],
      });

      if (!fullUser) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(MESSAGES.NOT_FOUND._CODE, null, "User not found"),
        });
      }

      const sessionExpiryHours = 336;
      const sessionToken = encrypt.generateToken({
        userId: fullUser.id,
        deviceType: "Facebook Login",
        ipAddress: req.ip || "Unknown",
      });

      await sessionRepository
        .createQueryBuilder()
        .delete()
        .from(Session)
        .where("userId = :userId", { userId: fullUser.id })
        .execute();

      const session = new Session();
      session.user = fullUser;
      session.sessionToken = sessionToken;
      session.deviceType = "Facebook Login";
      session.ipAddress = req.ip || "Unknown";
      session.createdAt = new Date();
      session.expiresAt = new Date(
        Date.now() + sessionExpiryHours * 60 * 60 * 1000
      );

      await sessionRepository.save(session);

      res.cookie("sessionToken", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: sessionExpiryHours * 60 * 60 * 1000,
      });

      const token = encrypt.generateToken<UserResponse>({
        id: fullUser.id,
        fullName: fullUser.fullName,
        email: fullUser.email,
        isEmailVerified: fullUser.isEmailVerified,
        role: UserRole.MEMBER,
      });

      const baseUrl = "memberapp://";
      let redirectUrl;

      if (!fullUser.selectedBrands || fullUser.selectedBrands.length === 0) {
        redirectUrl = `${baseUrl}interests?isNewUser=true&token=${encodeURIComponent(
          token
        )}`;
      } else {
        redirectUrl = `${baseUrl}dashboard?token=${encodeURIComponent(token)}`;
      }
      console.log(redirectUrl)

      const htmlResponse = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Open in App</title>
            <style>
                body, html {
                    height: 100%;
                    margin: 0;
                    font-family: Arial, sans-serif;
                    background: #f4f4f9;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                }
                .container {
                    max-width: 600px;
                    margin: auto;
                    padding: 20px;
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                h1 {
                    color: #333;
                }
                p {
                    color: #666;
                    font-size: 16px;
                }
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    font-size: 18px;
                    cursor: pointer;
                    background-color: #007BFF;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    text-decoration: none;
                }
                .button:hover {
                    background-color: #0056b3;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Welcome to MemberApp!</h1>
                <p>Click the button below to open the app and continue:</p>
                <a href="${redirectUrl}" class="button">Open MemberApp</a>
            </div>
        </body>
        </html>
      `;
      res.redirect(redirectUrl);
      // return res.status(200).send(htmlResponse);
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

  static async successAuth(_: Request, res: Response) {
    return res
      .status(MESSAGES.CREATED._CODE)
      .json(
        new ApiResponse(
          MESSAGES.SUCCESS._CODE,
          null,
          "User has been login successfully with social account. Please fetch token from params."
        )
      );
  }
}
