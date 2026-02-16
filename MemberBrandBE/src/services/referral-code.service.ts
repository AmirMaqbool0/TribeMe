import { randomBytes } from "crypto";
import { User } from "../models/member/auth/user.models";
import { getRepository } from "typeorm";

export async function generateReferralCode(): Promise<string> {
  const userRepository = getRepository(User);

  while (true) {
    const referralCode = "R" + randomBytes(3).toString("hex");

    const existingUser = await userRepository.findOne({
      where: { referralCode },
    });

    if (!existingUser) {
      return referralCode;
    }
  }
}
