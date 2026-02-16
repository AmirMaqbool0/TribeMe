import { getRepository } from "typeorm";
import { Request, Response } from "express";
import { MESSAGES } from "../../../utils/message-codes";
import ApiError from "../../../utils/api-error";
import { UserResponse, UserRole } from "../../../dto/user.dto";
import { encrypt } from "../../../helper/helper";
import ApiResponse from "../../../utils/api-response";
import { Brand } from "../../../models/brand/auth/auth-brand.models";

export class AuthBrandController {
  static async setNewPassword(req: Request, res: Response) {
    try {
      const { password, email } = req.body;

      if (!password || !email) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            "Email and password are required"
          ),
        });
      }

      const userRepository = getRepository(Brand);

      const user = await userRepository.findOne({ where: { email } });

      if (!user) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(MESSAGES.NOT_FOUND._CODE, null, "User not found"),
        });
      }

      const isSamePassword = await encrypt.comparePassword(
        user.password,
        password
      );

      if (isSamePassword) {
        return res.status(MESSAGES.CONFLICT._CODE).json({
          error: new ApiError(
            MESSAGES.CONFLICT._CODE,
            null,
            "The new password cannot be the same as the current password."
          ),
        });
      }

      const encryptedPassword = await encrypt.encryptPass(password);
      user.password = encryptedPassword;

      await userRepository.save(user);

      return res
        .status(MESSAGES.CREATED._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            null,
            "Password has been set successfully"
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
    try {
      const { email, password } = req.body;

      const userRepository = getRepository(Brand);
      const user = await userRepository.findOne({ where: { email } });

      if (!user) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            MESSAGES.NOT_FOUND.message
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
      user.isEmailVerified = true;

      const token = encrypt.generateToken<UserResponse>({
        id: user.id,
        fullName: `${user.firstName}${user.lastName}`,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        role: UserRole.BRAND,
      });

      res.cookie("sessionToken", token, {
        maxAge: 3600000,
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });

      await userRepository.save(user);

      const userLogin = {
        id: user.id,
        fullName: user.firstName + user.lastName,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        token,
      };

      return res
        .status(MESSAGES.CREATED._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            userLogin,
            "Brand login successfully"
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
