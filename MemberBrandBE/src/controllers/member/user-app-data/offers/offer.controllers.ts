import { User } from "../../../../models/member/auth/user.models";
import { Brand } from "../../../../models/brand/auth/auth-brand.models";
import { SelectedBrand } from "../../../../models/member/selected-brands/selected-brands.models";
import ApiError from "../../../../utils/api-error";
import ApiResponse from "../../../../utils/api-response";
import { MESSAGES } from "../../../../utils/message-codes";
import { Request, Response } from "express";
import { getRepository, LessThan, MoreThan } from "typeorm";
import { Offer } from "../../../../models/brand/offers/offer.models";
import { RedeemedOffer } from "../../../../models/member/redeemed-offers/redeemed-offers.models";
import { RedemptionRequest } from "../../../../models/brand/redeem-via/redemption-request.model";
import {
  BrandWithOffersResponse,
  OfferDetailsResponse,
} from "../../../../utils/response.dto";

export class MemberOfferController {
  static async getBrandOffers(req: Request, res: Response) {
    try {
      const { brandId } = req.params;

      if (!brandId) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            "Brand ID is required to fetch brand offers."
          ),
        });
      }

      const brandOffersRepository = getRepository(Brand);

      const brandWithOffers = await brandOffersRepository.findOne({
        where: { id: brandId },
        relations: [
          "selectedBrands",
          "selectedBrands.brand",
          "selectedBrands.brand.offers",
          "selectedBrands.brand.offers.offerImages",
        ],
      });

      if (!brandWithOffers) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "Brand not found."
          ),
        });
      }

      const offers: BrandWithOffersResponse[] =
        brandWithOffers.selectedBrands.flatMap((selectedBrand) =>
          selectedBrand.brand.offers.map((offer) => ({
              brandName: selectedBrand.brand.businessName,
              offers: [
                {
                  offerId: offer.id,
                  offerName: offer.offerName,
                  offerImages: offer.offerImages.map((image: any) => ({
                    url: image.url
                  })),
                  brandId:selectedBrand.brand.id,
                  brandName: selectedBrand.brand.businessName,
                },
              ],
            }))
        );

      if (offers.length === 0) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "No offers found for the brand."
          ),
        });
      }

      return res
        .status(MESSAGES.SUCCESS._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            offers,
            "Brand offers retrieved successfully"
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

  static async getBrandOffersDetails(req: Request, res: Response) {
    try {
      const { brandId } = req.params;

      if (!brandId) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            "Brand ID is required to fetch brand offers."
          ),
        });
      }

      const brandOffersRepository = getRepository(Brand);

      const brandWithOffers = await brandOffersRepository.findOne({
        where: { id: brandId },
        relations: [
          "selectedBrands",
          "selectedBrands.brand",
          "selectedBrands.brand.offers",
          "selectedBrands.brand.offers.offerImages",
        ],
      });

      if (!brandWithOffers) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "Brand not found."
          ),
        });
      }

      const offers: OfferDetailsResponse[] =
        brandWithOffers.selectedBrands.flatMap((selectedBrand) =>
            selectedBrand.brand.offers.map((offer)=>({
              offerId: offer.id,
              offerName: offer.offerName,
              offerDescription: offer.offerDescription,
              offerImage:
                offer.offerImages && Array.isArray(offer.offerImages)
                  ? offer.offerImages.map((image) => image.url)
                  : ["Image not uploaded by offer"],
              offerDiscount: offer.discountPercentage,
              offerInstore: offer.inStore,
              // offerOnline: offer.online,
              offerTermsCondition: offer.offerTermsCondition,
            }))
        );

      return res
        .status(MESSAGES.SUCCESS._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            offers,
            "Offers details retrieved successfully"
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

  static async submitRedemptionRequest(req: Request, res: Response) {
    try {
      const { offerId, paymentMethod } = req.body;
      const { userId } = (req as any).user;

      if (!userId || !offerId || !paymentMethod) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: "User ID, Offer ID, and redemption method are required.",
        });
      }

      const offerRepository = getRepository(Offer);
      const redemptionRequestRepository = getRepository(RedemptionRequest);

      const offer = await offerRepository.findOne({
        where: { id: offerId },
        relations: ["redemptionRequest"],
      });

      if (!offer) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: "Offer not found.",
        });
      }

      const existingRedemption = await redemptionRequestRepository.findOne({
        where: {
          user: { id: userId },
          offer: { id: offerId },
        },
      });

      if (existingRedemption) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: "You have already redeemed this offer.",
        });
      }

      if (
        offer.userLimit &&
        offer.redemptionRequest.length >= offer.userLimit
      ) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: "This offer has reached its redemption limit.",
        });
      }

      const codes = Array.isArray(offer.offerCode)
        ? offer.offerCode
        : [offer.offerCode];
      console.log("codes: ", codes);
      const offerCodeStatusInitialized =
        Array.isArray(offer.offerCodeStatus) &&
        offer.offerCodeStatus.length > 0;

      const unusedPromoCodes = offerCodeStatusInitialized
        ? codes.filter((code) =>
          offer.offerCodeStatus.some(
            (status) => status.code === code && !status.used
          )
        )
        : codes;

      if (!unusedPromoCodes.length) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: "No available promo codes for this offer.",
        });
      }

      const availablePromoCode = unusedPromoCodes[0];

      if (!availablePromoCode) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: "No available promo codes for this offer.",
        });
      }

      const redemptionRequest = redemptionRequestRepository.create({
        user: { id: userId },
        offer,
        paymentMethod,
        promoCodeUsed: availablePromoCode,
        status: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
        points: 20,
        coins: 10,
      });

      if (!Array.isArray(offer.offerCodeStatus)) {
        offer.offerCodeStatus = [];
      }

      const codeIndex = offer.offerCodeStatus.findIndex(
        (status) => status.code === availablePromoCode
      );

      if (codeIndex !== -1) {
        offer.offerCodeStatus[codeIndex].used = true;
      }

      await offerRepository.save(offer);
      const savedRedemption = await redemptionRequestRepository.save(
        redemptionRequest
      );

      return res.status(201).json({
        message: "Redemption request submitted successfully",
        data: {
          redemptionId: savedRedemption.id,
          promoCode: availablePromoCode,
          status: savedRedemption.status,
        },
      });
    } catch (error) {
      return res.status(500).json({
        error: "An error occurred while submitting the redemption request.",
      });
    }
  }

  static async getUserRedemptions(req: Request, res: Response) {
    try {
      const { userId } = (req as any).user;

      if (!userId) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: "User ID is required.",
        });
      }

      const redemptionRequestRepository = getRepository(RedemptionRequest);

      const redemptions = await redemptionRequestRepository.find({
        where: { user: { id: userId } },
        relations: ["offer"],
        order: {
          createdAt: "DESC",
        },
      });

      if (!redemptions.length) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          message: "No redemption requests found for this user.",
        });
      }

      const redemptionDetails = redemptions.map((redemption) => ({
        redemptionId: redemption.id,
        offerName: redemption.offer.offerName,
        offerDescription: redemption.offer.offerDescription,
        promoCodeUsed: redemption.promoCodeUsed,
        status: redemption.status,
        redeemedOn: redemption.createdAt,
      }));

      return res.status(200).json({
        message: "Redemption requests retrieved successfully.",
        data: redemptionDetails,
      });
    } catch (error) {
      return res.status(500).json({
        error: "An error occurred while fetching redemption requests.",
        details: error.message,
      });
    }
  }

  // static async redeemedOfferPromoCode(req: Request, res: Response) {
  //   try {
  //     const { redeemId } = req.params;
  //     const { userId } = (req as any).user;

  //     if (!userId) {
  //       return res.status(MESSAGES.BAD_REQUEST._CODE).json({
  //         error: new ApiError(
  //           MESSAGES.BAD_REQUEST._CODE,
  //           null,
  //           "User ID is required."
  //         ),
  //       });
  //     }

  //     const redeemedOfferRepository = getRepository(RedeemedOffer);
  //     const redeemedOffer = await redeemedOfferRepository.findOne({
  //       where: { id: redeemId },
  //       relations: ["offer"],
  //     });

  //     if (!redeemedOffer) {
  //       return res.status(MESSAGES.NOT_FOUND._CODE).json({
  //         error: new ApiError(
  //           MESSAGES.NOT_FOUND._CODE,
  //           null,
  //           "Redeemed offer not found"
  //         ),
  //       });
  //     }

  //     const { id, points, offer } = redeemedOffer;

  //     return res.status(MESSAGES.CREATED._CODE).json(
  //       new ApiResponse(
  //         MESSAGES.SUCCESS._CODE,
  //         {
  //           redeemId: id,
  //           offerCode: offer.offerCode,
  //           points,
  //         },
  //         "Offer Promo retrieved successfully!"
  //       )
  //     );
  //   } catch (error) {
  //     return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
  //       error: new ApiError(
  //         MESSAGES.INTERNAL_SERVER_ERROR._CODE,
  //         null,
  //         "An error occurred while claiming the promo code"
  //       ),
  //     });
  //   }
  // }

  // static async getTotalRedeemedPoints(req: Request, res: Response) {
  //   try {
  //     const { userId } = (req as any).user;

  //     if (!userId) {
  //       return res.status(MESSAGES.BAD_REQUEST._CODE).json({
  //         error: new ApiError(
  //           MESSAGES.BAD_REQUEST._CODE,
  //           null,
  //           "User ID is required."
  //         ),
  //       });
  //     }

  //     const redeemedOfferRepository = getRepository(RedeemedOffer);
  //     const redeemedOffers = await redeemedOfferRepository.find({
  //       where: { user: { id: userId } },
  //     });

  //     if (redeemedOffers.length === 0) {
  //       return res.status(MESSAGES.NOT_FOUND._CODE).json({
  //         error: new ApiError(
  //           MESSAGES.NOT_FOUND._CODE,
  //           null,
  //           "No redeemed offers found for this user."
  //         ),
  //       });
  //     }
  //     const points = Array.from(new Set(redeemedOffers.map((i) => i.points)));
  //     const uniquePoint = points[0];

  //     const highestRedeemedOffer = redeemedOffers.reduce((highest, offer) => {
  //       if (offer.totalPoints > highest.totalPoints) {
  //         return offer;
  //       }
  //       return highest;
  //     }, redeemedOffers[0]);

  //     return res.status(MESSAGES.CREATED._CODE).json(
  //       new ApiResponse(
  //         MESSAGES.SUCCESS._CODE,
  //         {
  //           points: uniquePoint,
  //           totalPoints: highestRedeemedOffer.totalPoints,
  //           totalDollars: highestRedeemedOffer.totalDollars,
  //         },
  //         "Total redeemed points retrieved successfully!"
  //       )
  //     );
  //   } catch (error) {
  //     return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
  //       error: new ApiError(
  //         MESSAGES.INTERNAL_SERVER_ERROR._CODE,
  //         null,
  //         "An error occurred while retrieving total redeemed points."
  //       ),
  //     });
  //   }
  // }

  static async shareInviteURL(req: Request, res: Response) {
    try {
      const { userId } = (req as any).user;

      if (!userId) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            "UserID is required."
          ),
        });
      }

      const user = await getRepository(User).findOne({ where: { id: userId } });
      if (!user) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "User not found."
          ),
        });
      }



      // Generate the referral link with the user's referral code
      const shareableUrl = `memberapp://inviteUser?referCode=${user.referralCode}`;
      console.log("shareable url: ", shareableUrl);

      return res
        .status(MESSAGES.CREATED._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            { shareableUrl },
            "Invite link has been fetched  successfully!"
          )
        );
    } catch (error) {
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          "An error occurred while generating the shareable link."
        ),
      });
    }
  }

}
