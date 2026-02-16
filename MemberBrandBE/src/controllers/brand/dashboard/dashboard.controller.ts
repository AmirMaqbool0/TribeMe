import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Brand } from "../../../models/brand/auth/auth-brand.models";
import { Offer } from "../../../models/brand/offers/offer.models";
import { User } from "../../../models/member/auth/user.models";
import { RedeemedOffer } from "../../../models/member/redeemed-offers/redeemed-offers.models";
import { RedemptionRequest } from "../../../models/brand/redeem-via/redemption-request.model";
import ApiError from "../../../utils/api-error";
import ApiResponse from "../../../utils/api-response";
import { MESSAGES } from "../../../utils/message-codes";

export class dashboardController {
  /**
   * Get app statistics including total brands, users, redeemed offers, and rewards claimed
   */
  static async getAppStatistics(_req: Request, res: Response) {
    try {
      // Get total brands
      const brandRepository = getRepository(Brand);
      const totalBrands = await brandRepository.count();

      // Get total users/members
      const userRepository = getRepository(User);
      const totalUsers = await userRepository.count();

      // Get total redeemed offers
      const redeemedOfferRepository = getRepository(RedeemedOffer);
      const totalRedeemedOffers = await redeemedOfferRepository.count();

      // Get total rewards claimed (count of claimed redemption requests)
      const redemptionRequestRepository = getRepository(RedemptionRequest);
      const totalRewardsClaimed = await redemptionRequestRepository.count({
        where: { isClaimed: true }
      });

      const statistics = {
        totalBrands,
        totalUsers,
        totalRedeemedOffers,
        totalRewardsClaimed
      };

      return res
        .status(MESSAGES.SUCCESS._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            statistics,
            "App statistics retrieved successfully"
          )
        );
    } catch (error) {
      console.error("Error retrieving app statistics:", error);
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          "Error retrieving app statistics"
        ),
      });
    }
  }

  /**
   * Get top 5 popular offers with details
   */
  static async getTopPopularOffers(_req: Request, res: Response) {
    try {
      const redeemedOfferRepository = getRepository(RedeemedOffer);
      const redemptionRequestRepository = getRepository(RedemptionRequest);
      
      // Get top 5 offers based on number of redemptions - using raw SQL for ORDER BY to fix case sensitivity
      const topOffers = await redeemedOfferRepository
        .createQueryBuilder("redeemedOffer")
        .leftJoinAndSelect("redeemedOffer.offer", "offer")
        .leftJoinAndSelect("offer.brand", "brand")
        .leftJoinAndSelect("offer.offerImages", "offerImages")
        .select("offer.id", "offerId")
        .addSelect("offer.offerName", "offerName")
        .addSelect("offer.offerDescription", "offerDescription")
        .addSelect("offer.offerType", "offerType")
        .addSelect("brand.id", "brandId")
        .addSelect("brand.businessName", "brandName")
        .addSelect("brand.category", "category")
        .addSelect("COUNT(redeemedOffer.id)", "redemptionCount")
        .groupBy("offer.id")
        .addGroupBy("brand.id")
        .orderBy('"redemptionCount"', "DESC") // Fixed: Added quotes around column name
        .limit(5)
        .getRawMany();

      // For each top offer, get the total number of available offers for that brand
      // and the count of claimed rewards
      const topOffersWithDetails = await Promise.all(
        topOffers.map(async (offer) => {
          const offerRepository = getRepository(Offer);
          const availableOffersCount = await offerRepository.count({
            where: { brand: { id: offer.brandId } }
          });

          // Get count of claimed rewards for this offer
          const rewardsClaimedCount = await redemptionRequestRepository.count({
            where: { 
              offer: { id: offer.offerId },
              isClaimed: true
            }
          });

          return {
            offerId: offer.offerId,
            offerName: offer.offerName,
            offerDescription: offer.offerDescription,
            offerType: offer.offerType,
            brand: {
              id: offer.brandId,
              name: offer.brandName,
              category: offer.category
            },
            availableOffersCount,
            redemptionCount: parseInt(offer.redemptionCount),
            rewardsClaimed: rewardsClaimedCount
          };
        })
      );

      return res
        .status(MESSAGES.SUCCESS._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            topOffersWithDetails,
            "Top popular offers retrieved successfully"
          )
        );
    } catch (error) {
      console.error("Error retrieving top popular offers:", error);
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          "Error retrieving top popular offers"
        ),
      });
    }
  }
}