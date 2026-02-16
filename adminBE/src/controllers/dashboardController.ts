import { Request, Response } from "express";
import { Offer } from "../models/brand/offers/offer.models";
import { User } from "../models/member/auth/user.models";
import { RedeemedOffer } from "../models/member/redeemed-offers/redeemed-offers.models";
import { RedemptionRequest } from "../models/brand/redeem-via/redemption-request.model";
import ApiError from "../utils/api-error";
import ApiResponse from "../utils/api-response";
import { MESSAGES } from "../utils/message-codes";
import { AppDataSource } from "../config/db";
import { Brand } from "../models/brand/auth/auth-brand.models";
import { MoreThan, IsNull } from "typeorm";

// Use Brand for the repository
const brandRepository = AppDataSource.getRepository(Brand);
const userRepository = AppDataSource.getRepository(User);
const redeemedOfferRepository = AppDataSource.getRepository(RedeemedOffer);
const redemptionRequestRepository = AppDataSource.getRepository(RedemptionRequest);
const offerRepository = AppDataSource.getRepository(Offer);

/**
 * Get app statistics including total brands, users, redeemed offers, and rewards claimed
 */
export const getAppStatistics = async (_req: Request, res: Response): Promise<Response | void> => {
    try {
      // Get total brands
      const totalBrands = await brandRepository.count().catch(() => 0);

      // Get total users/members
      const totalUsers = await userRepository.count().catch(() => 0);

      // Get total offers
      const totalOffers = await offerRepository.count().catch(() => 0);

      // Get active offers (not expired)
      const currentDate = new Date();
      const activeOffers = await offerRepository.count({
        where: [
          { endDate: IsNull() }, // No end date (unlimited)
          { endDate: MoreThan(currentDate) } // End date is in the future
        ]
      }).catch(() => 0);

      // Get total redeemed offers
      const totalRedeemedOffers = await redeemedOfferRepository.count().catch(() => 0);

      // Get total rewards claimed (count of claimed redemption requests)
      const totalRewardsClaimed = await redemptionRequestRepository.count({
        where: { isClaimed: true }
      }).catch(() => 0);
      
      // Get total redemption requests
      const totalRedemptionRequests = await redemptionRequestRepository.count().catch(() => 0);

      const statistics = {
        totalBrands,
        totalUsers,
        totalOffers,
        activeOffers,
        totalRedeemedOffers,
        totalRewardsClaimed,
        totalRedemptionRequests
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
};

/**
 * Get top 5 popular offers with details
 */
export const getTopPopularOffers = async (_req: Request, res: Response): Promise<Response | void> => {
  try {
    interface OfferDetail {
      offerId: number;
      offerName: string;
      offerDescription: string;
      offerType: string;
      brand: {
        id: string;
        name: string;
        category: string;
      };
      availableOffersCount: number;
      redemptionCount: number;
      rewardsClaimed: number;
    }

    let topOffersWithDetails: OfferDetail[] = [];
    
    try {
      // Use raw SQL query to get top offers with proper type casting
      const topOffers = await AppDataSource.query(`
        SELECT 
          offer.id AS "offerId",
          offer."offerName",
          offer."offerDescription",
          offer."offerType",
          auth_brand.id AS "brandId",
          auth_brand."businessName" AS "brandName",
          auth_brand.category,
          COUNT(redeemed_offers.id) AS "redemptionCount"
        FROM redeemed_offers
        LEFT JOIN offer ON offer.id = redeemed_offers."offerId"
        LEFT JOIN auth_brand ON auth_brand.id = offer."brandId"
        GROUP BY 
          offer.id, 
          offer."offerName",
          offer."offerDescription",
          offer."offerType",
          auth_brand.id,
          auth_brand."businessName",
          auth_brand.category
        ORDER BY "redemptionCount" DESC
        LIMIT 5
      `);

      if (topOffers.length > 0) {
        const offerIds = topOffers.map((o: { offerId: any; }) => o.offerId);
        const brandIds = topOffers.map((o: { brandId: string }) => o.brandId);
        
        // Get available offers per brand using raw query with proper casting
        const brandOfferCounts = await AppDataSource.query(`
          SELECT "brandId", COUNT(*) as count
          FROM offer
          WHERE "brandId" IN (${brandIds.map((id: string) => `'${id}'`).join(',')})
          GROUP BY "brandId"
        `);

        const brandOfferMap = new Map(
          brandOfferCounts.map((b: { brandId: any; count: string; }) => [b.brandId, parseInt(b.count)])
        );

        // Get claimed rewards per offer
        const rewardsClaimedCounts = await AppDataSource.query(`
          SELECT "offerId", COUNT(*) as count
          FROM redemption_request
          WHERE "isClaimed" = true AND "offerId" IN (${offerIds.map((id: any) => `'${id}'`).join(',')})
          GROUP BY "offerId"
        `);

        const rewardMap = new Map(
          rewardsClaimedCounts.map((r: { offerId: any; count: string; }) => [r.offerId, parseInt(r.count)])
        );

        // Build the final result
        topOffersWithDetails = topOffers.map((offer: { offerId: unknown; offerName: any; offerDescription: any; offerType: any; brandId: unknown; brandName: any; category: any; redemptionCount: string; }) => ({
          offerId: offer.offerId,
          offerName: offer.offerName,
          offerDescription: offer.offerDescription,
          offerType: offer.offerType,
          brand: {
            id: offer.brandId,
            name: offer.brandName,
            category: offer.category,
          },
          availableOffersCount: brandOfferMap.get(offer.brandId) || 0,
          redemptionCount: parseInt(offer.redemptionCount),
          rewardsClaimed: rewardMap.get(offer.offerId) || 0,
        }));
      }
    } catch (err) {
      console.error("Unable to retrieve offer data:", err);
      // Return an empty array instead of mock data
      topOffersWithDetails = [];
    }

    return res.status(MESSAGES.SUCCESS._CODE).json(
      new ApiResponse(
        MESSAGES.SUCCESS._CODE,
        topOffersWithDetails,
        "Popular offers retrieved successfully"
      )
    );
  } catch (error) {
    console.error("Error retrieving top popular offers:", (error as Error).message);
    return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
      error: new ApiError(
        MESSAGES.INTERNAL_SERVER_ERROR._CODE,
        null,
        "Error retrieving top popular offers"
      ),
    });
  }
};