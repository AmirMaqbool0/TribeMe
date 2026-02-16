import { getRepository, In, LessThan } from "typeorm";
import * as cron from "node-cron";
import { User } from "../models/member/auth/user.models";
import { Session } from "../models/member/auth/user-sessions.models";

const removeUnverifiedUsers = async (): Promise<void> => {
  const userRepository = getRepository(User);
  const sessionRepository = getRepository(Session);

  const cutoffTime = new Date(new Date().getTime() - 120000); // 2 min
  try {
    const unverifiedUsers = await userRepository.find({
      where: {
        isEmailVerified: false,
        createdAt: LessThan(cutoffTime),
      },
    });

    if (unverifiedUsers.length > 0) {
      const userIds = unverifiedUsers.map((user) => user.id);

      await sessionRepository.delete({ user: In(userIds) });
      await userRepository.remove(unverifiedUsers);
      console.log(
        `Removed ${unverifiedUsers.length} unverified users and their sessions due to non-verification.`
      );
    }
  } catch (error) {
    console.error("Error removing unverified users");
  }
};

// Task run every 5 minutes
cron.schedule("*/5 * * * *", removeUnverifiedUsers);
