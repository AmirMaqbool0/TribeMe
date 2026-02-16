import { Request, Response } from "express";
import ApiError from "../../../../utils/api-error";
import ApiResponse from "../../../../utils/api-response";
import { MESSAGES } from "../../../../utils/message-codes";
import { getRepository } from "typeorm";
import { UserBrandInteraction } from "../../../../models/member/brand-interaction/user-brand-interaction.models";
import { RedeemedOffer } from "../../../../models/member/redeemed-offers/redeemed-offers.models";
import { Offer } from "../../../../models/brand/offers/offer.models";
import { SavedOffer } from "../../../../models/member/saved-offers/saved-offers.models";
import { SelectedBrand } from "../../../../models/member/selected-brands/selected-brands.models";
import { Brand } from "../../../../models/brand/auth/auth-brand.models";
import {
  BrandResponse,
  BrandWithOffersResponse,
} from "../../../../utils/response.dto";

export class ProfileController {
  static async brandInteraction(req: Request, res: Response) {
    const { userId } = (req as any).user;

    try {
      const brandInteractionRepository = getRepository(UserBrandInteraction);
      const brandInteraction = await brandInteractionRepository.find({
        where: { user: { id: userId } },
        relations: ["brand"],
      });

      if (brandInteraction.length === 0) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "Likes doesn't exist of this user"
          ),
        });
      }

      const brandInteractionDetails: BrandResponse[] = brandInteraction.map(
        (item) => ({
          brandId: item.id,
          brandName: item.brand.businessName,
          brandDescription: item.brand.brandDescription,
          brandLogo: Array.isArray(item.brand.images)
            ? item.brand.images.map((image) => image?.url)
            : ["Image not uploaded by brand"],
          interaction: item.interaction,
        })
      );

      return res
        .status(MESSAGES.CREATED._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            brandInteractionDetails,
            "Likes retrieved of selected user."
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

  static async redeemedOffers(req: Request, res: Response) {
    const { userId } = (req as any).user;

    try {
      const redeemOfferRepository = getRepository(RedeemedOffer);
      const redeemOffer = await redeemOfferRepository.find({
        where: { user: { id: userId } },
        relations: [
          "offer.brand",
          "offer.brand.images",
          "offer.brand.interactions",
        ],
      });

      if (redeemOffer.length === 0) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "Redeem offer doesn't exist of this user"
          ),
        });
      }

      const redeemedOffersDetails: BrandWithOffersResponse[] = redeemOffer.map(
        (item) => ({
          brandId: item.offer.brand.id,
          brandName: item.offer.brand.businessName,
          brandDescription: item.offer.brand.brandDescription,
          brandLogo: Array.isArray(item.offer.brand.images)
            ? item.offer.brand.images.map((image) => image?.url)
            : ["Image not uploaded by brand"],
          interaction:
            Array.isArray(item.offer.brand.interactions) &&
            item.offer.brand.interactions.length > 0
              ? item.offer.brand.interactions[0].interaction
              : "No interaction",
          offers: [{ offerName: item.offer.offerName }],
        })
      );

      return res
        .status(MESSAGES.CREATED._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            redeemedOffersDetails,
            "Redeemed offers retrieved successfully of selected user."
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

  static async saveOffers(req: Request, res: Response) {
    try {
      const { userId } = (req as any).user;
      const { offerId } = req.body;

      const selectedBrandRepository = getRepository(Offer);
      const savedOfferRepository = getRepository(SavedOffer);
      const offer = await selectedBrandRepository.findOneById(offerId);

      if (!offer) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "Offer not found"
          ),
        });
      }

      const alreadySaved = await savedOfferRepository.findOne({
        where: { user: { id: userId }, offer: { id: offerId } },
      });

      if (alreadySaved) {
        return res.status(MESSAGES.CONFLICT._CODE).json({
          error: new ApiError(
            MESSAGES.CONFLICT._CODE,
            null,
            "Offer already saved"
          ),
        });
      }

      const savedOffer = savedOfferRepository.create({
        user: { id: userId },
        offer: offer,
      });
      await savedOfferRepository.save(savedOffer);

      return res
        .status(MESSAGES.CREATED._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            null,
            "Offer saved successfully."
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

  static async getSavedOffers(req: Request, res: Response) {
    const { userId } = (req as any).user;

    try {
      const savedOfferRepository = getRepository(SavedOffer);
      const savedOffers = await savedOfferRepository.find({
        where: { user: { id: userId } },
        relations: ["offer", "offer.brand"],
      });

      if (savedOffers.length === 0) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "No saved offers found for this user"
          ),
        });
      }

      const savedOffersDetails: BrandWithOffersResponse[] = savedOffers.map(
        (item) => ({
          brandId: item.offer.brand.id,
          brandName: item.offer.brand.businessName,
          brandLogo: Array.isArray(item.offer.brand.images)
            ? item.offer.brand.images.map((image) => image?.url)
            : ["Image not uploaded by brand"],
          offers: [
            {
              offerId: item.offer.id,
              offerName: item.offer.offerName,
              offerDescription: item.offer.offerDescription,
              savedAt: item.createdAt,
            },
          ],
        })
      );

      return res
        .status(MESSAGES.SUCCESS._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            savedOffersDetails,
            "Saved offers retrieved successfully."
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
