import * as jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import config from "../config";

const SECRET_KEY = config.jwt.JWT_SECRET;
export class encrypt {
  static async encryptPass(password: string) {
    return bcrypt.hash(password, 12);
  }

  static comparePassword(hashPassword: string, password: string) {
    return bcrypt.compareSync(password, hashPassword);
  }

  static generateToken<T extends string | object | Buffer>(
    payload: T,
    expiresIn: string = "10d"
  ) {
    if (!SECRET_KEY) {
      throw new Error("SECRET_KEY is not defined");
    }
    return jwt.sign(payload, SECRET_KEY, { expiresIn });
  }

  static verifyToken<T>(token: string): T | null {
    try {
      if (!SECRET_KEY) {
        throw new Error("SECRET_KEY is not defined");
      }
      return jwt.verify(token, SECRET_KEY) as T;
    } catch (error) {
      console.error("Token verification failed: Invalid Token");
      return null;
    }
  }
}
