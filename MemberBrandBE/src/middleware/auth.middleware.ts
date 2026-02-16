import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import ApiError from "../utils/api-error";
import { MESSAGES } from "../utils/message-codes";
import config from "../config";
import { getRepository } from "typeorm";
import { Session } from "../models/member/auth/user-sessions.models";
import { encrypt } from "../helper/helper";
import { Brand } from "../models/brand/auth/auth-brand.models";
import { User } from "../models/member/auth/user.models";

const SECRET_KEY = config.jwt.JWT_SECRET;

async function getUser(id: string, role: string) {
  if (role === "brand") {
    return await getRepository(Brand).findOne({ where: { id } });
  } else if (role === "member") {
    // console.log(id, role);
    return await getRepository(User).findOne({ where: { id } });
  }
}

export const authentication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!SECRET_KEY) {
    throw new Error("SECRET_KEY is not defined");
  }

  const header = req.headers.authorization;
  if (!header) {
    return res.status(MESSAGES.UNAUTHORIZED._CODE).json({
      error: new ApiError(
        MESSAGES.UNAUTHORIZED._CODE,
        null,
        MESSAGES.UNAUTHORIZED.message + ": No header.."
      ),
    });
  }
  const token = header.split(" ")[1];
  if (!token) {
    return res.status(MESSAGES.UNAUTHORIZED._CODE).json({
      error: new ApiError(
        MESSAGES.UNAUTHORIZED._CODE,
        null,
        MESSAGES.UNAUTHORIZED.message + ": No bearer"
      ),
    });
  }
  try {
    const decoded = encrypt.verifyToken<{ id: string; role: string }>(token);
    if (!decoded) {
      return res.status(MESSAGES.UNAUTHORIZED._CODE).json({
        error: new ApiError(
          MESSAGES.UNAUTHORIZED._CODE,
          null,
          MESSAGES.UNAUTHORIZED.message + ": Invalid JWT token"
        ),
      });
    }

    const { role, id } = decoded;

    const user = await getUser(id, role);
    // console.log("user: ", user);

    if (!user) {
      return res.status(MESSAGES.UNAUTHORIZED._CODE).json({
        error: new ApiError(
          MESSAGES.UNAUTHORIZED._CODE,
          null,
          `${MESSAGES.UNAUTHORIZED.message}: User not found`
        ),
      });
    }

    req.user = { userId: id, role: role };
  } catch (e) {
    return res.status(MESSAGES.UNAUTHORIZED._CODE).json({
      error: new ApiError(
        MESSAGES.UNAUTHORIZED._CODE,
        null,
        MESSAGES.UNAUTHORIZED.message + ": Error"
      ),
    });
  }
  next();
};

export const validateSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = (req as any).user;

  const sessionToken = req.cookies.sessionToken;
  if (!sessionToken) {
    return res.status(MESSAGES.UNAUTHORIZED._CODE).json({
      error: new ApiError(
        MESSAGES.UNAUTHORIZED._CODE,
        null,
        MESSAGES.UNAUTHORIZED.message + ": Session token is missing"
      ),
    });
  }

  try {
    const sessionRepository = getRepository(Session);
    const session = await sessionRepository.findOne({
      where: { sessionToken, user: { id: userId } },
    });
    console.log(session);

    if (!session) {
      // if (!session || new Date() > session.expiresAt) {
      return res.status(MESSAGES.UNAUTHORIZED._CODE).json({
        error: new ApiError(
          MESSAGES.UNAUTHORIZED._CODE,
          null,
          MESSAGES.UNAUTHORIZED.message + ": Invalid or expired session"
        ),
      });
    }

    (req as any).session = session;
  } catch (error) {
    return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
      error: new ApiError(
        MESSAGES.INTERNAL_SERVER_ERROR._CODE,
        null,
        MESSAGES.INTERNAL_SERVER_ERROR.message + ": Error validating session"
      ),
    });
  }
  next();
};
