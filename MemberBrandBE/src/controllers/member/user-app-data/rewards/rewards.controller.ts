import { Request, Response } from "express";
import { RedemptionRequest } from "../../../../models/brand/redeem-via/redemption-request.model";
import { User } from "../../../../models/member/auth/user.models";
import { getRepository, Not } from "typeorm";
import { Wallet } from "../../../../models/member/wallet/wallet.models";
import { Settings } from "../../../../models/member/settings/settings.model";
import { rewards } from "../../../../services/rewards-points.service";
import { FcmService } from "../../../../services/fcm.service";
import { NotificationType } from "../../../../models/member/notification/notification.models";

export class RewardsController {
  static async getRewards(req: Request, res: Response) {
    const { userId } = (req as any).user;

    try {
      const redemptionRequestRepository = getRepository(RedemptionRequest);
      const rewards = await redemptionRequestRepository.find({
        where: {
          user: { id: userId },
          approved: true,
          status: "APPROVED",
        },
        relations: ["offer", "user"],
        select: ["id", "points", "coins", "offer", "isClaimed"],
      });

      const transformedRewards = rewards.map((r) => ({
        redemptionId: r.id,
        offerName: r.offer.offerName,
        offerDescription: r.offer.offerDescription,
        coins: r.coins,
        points: r.points,
        instore: r.offer.inStore,
        isClaimed: r.isClaimed ?? false, // Default to false if not set
      }));

      return res.status(200).json({
        message: "Rewards retrieved successfully",
        data: transformedRewards,
      });
    }
    catch (error) {
      return res.status(500).json({
        error: "An unexpected error occurred while fetching rewards.",
      });
    }
  }

  static async claimRewards(req: Request, res: Response) {
    const { redemptionRequestId } = req.params;
    const { userId } = (req as any).user;

    try {
      const redemptionRequestRepository = getRepository(RedemptionRequest);
      const walletRepository = getRepository(Wallet);
      const userRepository = getRepository(User); // To update the user's coins and points      // Fetch the redemption request
      const redemptionRequest = await redemptionRequestRepository.findOne({
        where: { id: redemptionRequestId, approved: true, status: "APPROVED" },
        relations: ["user", "offer"],
      });

      if (!redemptionRequest) {
        return res
          .status(404)
          .json({ error: "Redemption request not found or not approved." });
      }

      const user = redemptionRequest.user;

      // Check if the user ID matches
      if (user.id !== userId) {
        return res.status(403).json({ error: "User does not have permission to claim this reward." });
      }

      // Check if the reward has already been claimed
      if (redemptionRequest.isClaimed) {
        return res.status(400).json({ error: "This reward has already been claimed." });
      }

      // Update user's points and coins
      user.points = (user.points || 0) + redemptionRequest.points;
      user.coins = Number(user.coins || 0) + Number(redemptionRequest.coins);
      await userRepository.save(user);

      // Update or create wallet for the user
      let wallet = await walletRepository.findOne({ where: { user: { id: userId } } });
      if (wallet) {
        wallet.points = (wallet.points || 0) + redemptionRequest.points;
        wallet.coins = Number(wallet.coins || 0) + Number(redemptionRequest.coins);
      } else {
        wallet = walletRepository.create({
          user: { id: userId },
          points: redemptionRequest.points,
          coins: redemptionRequest.coins,
        });
      }
      await walletRepository.save(wallet);

      // Check if this is the first redemption for the user - FIXED COUNT QUERY
      // We need to count ALL claimed redemptions for this user EXCEPT the current one
      const previousApprovedCount = await redemptionRequestRepository.count({
        where: { 
          user: { id: user.id }, 
          approved: true, 
          isClaimed: true,
          id: Not(redemptionRequestId) // Exclude the current redemption
        },
      });
      
      const isFirstRedemption = previousApprovedCount === 0;

      console.log("Previously approved and claimed redemptions:", previousApprovedCount);
      console.log("Is first redemption:", isFirstRedemption);
      console.log("User:", user);

      // Handle referrer reward after the reward is claimed
      if (user.referrer) {
        // Find the referrer using the referral code
        const referrer = await userRepository.findOne({
          where: { referralCode: user.referrer },
        });

        if (referrer) {
          console.log("Referrer found:", referrer);

          // Determine the referrer's reward points and coins based on whether it's the first redemption
          const rewardPoints = isFirstRedemption ? rewards.redemption.first.points : rewards.redemption.additional.points;
          const rewardCoins = isFirstRedemption ? rewards.redemption.first.coins : rewards.redemption.additional.coins;

          console.log("Rewarding referrer with:", isFirstRedemption ? "FIRST time rewards" : "ADDITIONAL rewards");
          console.log("Points:", rewardPoints, "Coins:", rewardCoins);

          // Reward the referrer with points and coins based on whether it's the first redemption
          referrer.points = (referrer.points || 0) + rewardPoints;
          referrer.coins = (referrer.coins || 0) + rewardCoins;

          // Update referrer's wallet as well
          let referrerWallet = await walletRepository.findOne({
            where: { user: { id: referrer.id } },
          });

          if (referrerWallet) {
            referrerWallet.points = (referrerWallet.points || 0) + rewardPoints;
            referrerWallet.coins = Number(referrerWallet.coins || 0) + Number(rewardCoins);
          } else {
            referrerWallet = walletRepository.create({
              user: { id: referrer.id },
              points: rewardPoints,
              coins: rewardCoins,
            });
          }

          await walletRepository.save(referrerWallet);

          // Sync the referrer's points and coins with the user record
          referrer.points = referrerWallet.points;
          referrer.coins = referrerWallet.coins;
          await userRepository.save(referrer);

          console.log("Referrer rewarded:", referrer);          // Save referral reward notification (in-app only, no push notification)
          try {            const referralRewardTemplate = FcmService.getReferralRewardNotification(
              rewardPoints,
              rewardCoins,
              user.fullName || 'Someone'
            );

            const referralFcmPayload = {
              title: referralRewardTemplate.title,
              body: referralRewardTemplate.body,
              data: {
                ...referralRewardTemplate.data,
                pointsEarned: rewardPoints.toString(),
                coinsEarned: rewardCoins.toString(),
                referredUserId: user.id,
                isFirstRedemption: isFirstRedemption.toString(),
              },
            };

            await FcmService.createInAppNotification(
              referrer.id,
              referralFcmPayload,
              NotificationType.REFERRAL_REWARD
            );

            console.log(`Referral reward notification saved for referrer ${referrer.id}`);
          } catch (fcmError) {
            console.error("Error saving referral reward notification:", fcmError);
            // Don't fail the request if notification fails
          }
        }
      }

      // Mark the redemption request as claimed
      redemptionRequest.isClaimed = true;
      await redemptionRequestRepository.save(redemptionRequest);      // Save reward claim notification (in-app only, no push notification)
      try {
        const fcmTemplate = FcmService.getRewardClaimNotification(
          redemptionRequest.offer.offerName,
          redemptionRequest.points,
          redemptionRequest.coins
        );

        const fcmPayload = {
          title: fcmTemplate.title,
          body: fcmTemplate.body,
          data: {
            ...fcmTemplate.data,
            offerId: redemptionRequest.offer.id,
            redemptionId: redemptionRequest.id,
            pointsEarned: redemptionRequest.points.toString(),
            coinsEarned: redemptionRequest.coins.toString(),
          },
        };

        await FcmService.createInAppNotification(
          userId,
          fcmPayload,
          NotificationType.REWARD_CLAIMED
        );

        console.log(`Reward claim notification saved for user ${userId}`);
      } catch (fcmError) {
        console.error("Error saving reward claim notification:", fcmError);
        // Don't fail the request if notification fails
      }

      return res.status(200).json({
        message: "Rewards claimed successfully",
        wallet: {
          userId: userId,
          coins: wallet.coins,
          points: wallet.points,
        },
      });
    } catch (error) {
      console.error("Error while claiming rewards:", error);
      return res.status(500).json({
        error: "An unexpected error occurred while claiming rewards.",
      });
    }
  }

  static async convertCoinsToCash(req: Request, res: Response) {
    try {
      const { coins } = req.body;

      // Ensure coins is a valid positive number
      if (isNaN(coins) || coins <= 0) {
        return res.status(400).json({ error: "Invalid or non-positive coins value provided." });
      }

      // Fetch the conversion rate from the database
      const settingsRepository = getRepository(Settings);
      const settings = await settingsRepository.findOne({});
      if (!settings) {
        return res.status(500).json({ error: "Conversion rate not found in the settings table." });
      }

      // 💰 Conversion logic: Fetch rate from database and apply it
      const cash = (coins * settings.coin_to_cash_rate).toFixed(2);

      return res.status(200).json({
        message: "Coins converted to cash successfully",
        coins: coins,
        cash: `$${cash}`,
        rawCashValue: cash, // you can remove this if you only want formatted
      });
    } catch (error) {
      console.error("Error converting coins to cash:", error);
      return res.status(500).json({
        error: "An error occurred while converting coins.",
      });
    }
  }
}
