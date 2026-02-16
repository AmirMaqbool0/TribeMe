import { Request, Response } from "express";
import { Brackets, getRepository, Like } from "typeorm";
import ApiError from "../../../utils/api-error";
import ApiResponse from "../../../utils/api-response";
import { MESSAGES } from "../../../utils/message-codes";
import { Brand } from "../../../models/brand/auth/auth-brand.models";
import { Offer, OfferImage } from "../../../models/brand/offers/offer.models";
import { SelectedBrand } from "../../../models/member/selected-brands/selected-brands.models";
import { UserBrandInteraction } from "../../../models/member/brand-interaction/user-brand-interaction.models";
import { InteractionType } from "../../../models/member/brand-interaction/user-brand-interaction.models";
import { RedeemedOffer } from "../../../models/member/redeemed-offers/redeemed-offers.models";
import { SavedOffer } from "../../../models/member/saved-offers/saved-offers.models";
import {
  BrandResponse,
  BrandWithOffersResponse,
  SearchSuggestion,
} from "../../../utils/response.dto";

export class SearchController {
  static async searchSuggestions(req: Request, res: Response) {
    const { query } = req.query;

    try {
      if (!query || typeof query !== "string" || query.trim().length < 2) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            "Please provide at least 2 characters for search"
          ),
        });
      }      const brands = await getRepository(Brand)
        .createQueryBuilder("brand")
        .select(["brand.id", "brand.businessName", "videos.id", "videos.url", "videos.originalName", "videos.createdAt"])
        .leftJoin("brand.videos", "videos")
        .where("brand.businessName ILIKE :query", { query: `%${query}%` })
        .limit(5)
        .getMany();

      const offers = await getRepository(Offer)
        .createQueryBuilder("offer")
        .select([
          "offer.id",
          "offer.offerName",
          "brand.id",
          "brand.businessName",
          "offerImages.id",
          "offerImages.url"
        ])
        .leftJoin("offer.brand", "brand")
        .leftJoin("offer.offerImages", "offerImages")
        .where("offer.offerName ILIKE :query", { query: `%${query}%` })
        .limit(5)
        .getMany();

      if (brands.length === 0 && offers.length === 0) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "No results found"
          ),
        });
      }

      console.log("offers==>:",offers)

      const suggestions: SearchSuggestion[] = [        ...brands.map((brand) => ({
          type: "brand",
          brandId: brand.id,
          brandName: brand.businessName,
          brandVideos: Array.isArray(brand.videos)
            ? brand.videos.map(video => ({
                url: video.url || "",
                thumbnail: video.url || "", // Using video URL as thumbnail
                title: video.originalName || "",
                uploadDate: video.createdAt || new Date(),
              }))
            : [],
        })),
        ...offers.map((offer) => ({
          type: "offer",
          offerId: offer.id,
          offerName: offer.offerName,
          brandId: offer.brand.id,
          brandName: offer.brand.businessName,
          offerImages: offer.offerImages ? offer.offerImages.map((image: any) => ({
            url: image.url
          })) : []
       })),
      ];
      return res
        .status(MESSAGES.CREATED._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            suggestions,
            "Search suggestions retrieved successfully"
          )
        );
    } catch (error) {
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          "Error retrieving search suggestions"
        ),
      });
    }
  }

  static async searchResults(req: Request, res: Response) {
    const { query, type } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    console.log("page: ", page, "limit: ", limit);

    try {
      if (!query || typeof query !== "string" || query.trim().length === 0) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            "Invalid search query"
          ),
        });
      }

      let results, total;

      if (type && type !== "offers" && type !== "brands") {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            "Please specify the type 'offers' or 'brands' for search results. Ensure correct spelling."
          ),
        });
      }

      switch (type) {
        case "brands":
          [results, total] = await getRepository(Brand)
            .createQueryBuilder("brand")
            .where("brand.businessName ILIKE :query", { query: `%${query}%` })
            .leftJoinAndSelect("brand.offers", "offers")
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
          break;

        case "offers":
          [results, total] = await getRepository(Offer)
            .createQueryBuilder("offer")
            .leftJoinAndSelect("offer.brand", "brand")
            .where("offer.offerName ILIKE :query", { query: `%${query}%` })
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
          break;

        default:
          const [brandResults, brandTotal] = await getRepository(Brand)
            .createQueryBuilder("brand")
            .where("brand.businessName ILIKE :query", { query: `%${query}%` })
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

          const [offerResults, offerTotal] = await getRepository(Offer)
            .createQueryBuilder("offer")
            .leftJoinAndSelect("offer.brand", "brand")
            .where("offer.offerName ILIKE :query", { query: `%${query}%` })
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

          results = [...brandResults, ...offerResults];
          total = brandTotal + offerTotal;
      }

      const searchResult = {
        results,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };

      return res
        .status(MESSAGES.CREATED._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            searchResult,
            "Search results retrieved successfully"
          )
        );
    } catch (error) {
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          "Error retrieving search results"
        ),
      });
    }
  }

  static async searchLikedBrands(req: Request, res: Response) {
    try {
      const { userId } = (req as any).user;
      const { query } = req.query;

      if (!query || typeof query !== "string" || query.trim().length < 2) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            "Please provide at least 2 characters for search"
          ),
        });
      }

      const likedBrands = await getRepository(UserBrandInteraction)
        .createQueryBuilder("interaction")
        .leftJoinAndSelect("interaction.brand", "brand")
        .leftJoinAndSelect("brand.images", "images")
        .where("interaction.user.id = :userId", { userId })
        .andWhere("brand.businessName ILIKE :query", {
          query: `%${query}%`,
        })
        .getMany();

      console.log(likedBrands);

      if (likedBrands.length === 0) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "No liked brands found matching the search term"
          ),
        });
      }

      const likedBrandDetails: BrandResponse[] = likedBrands.map((item) => ({
        brandId: item.brand.id,
        brandName: item.brand.businessName,
        brandDescription: item.brand.brandDescription,
        brandLogo: Array.isArray(item.brand.images)
          ? item.brand.images.map((image) => image?.url)
          : ["Image not uploaded by brand"],
      }));

      return res
        .status(MESSAGES.SUCCESS._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            likedBrandDetails,
            "Liked brands retrieved successfully."
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

  static async searchRedeemedOffers(req: Request, res: Response) {
    try {
      const { userId } = (req as any).user;
      const { query } = req.query;

      if (!query || typeof query !== "string" || query.trim().length < 2) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            "Please provide at least 2 characters for search"
          ),
        });
      }

      const redeemOfferRepository = getRepository(RedeemedOffer);
      const redeemedOffers = await redeemOfferRepository.find({
        where: [
          { user: { id: userId }, offer: { offerName: Like(`%${query}%`) } },
          {
            user: { id: userId },
            offer: { brand: { businessName: Like(`%${query}%`) } },
          },
        ],
        relations: ["offer", "offer.brand"],
      });

      if (redeemedOffers.length === 0) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "No redeemed offers found matching the search term"
          ),
        });
      }

      const redeemedOfferDetails: BrandWithOffersResponse[] =
        redeemedOffers.map((item) => ({
          brandName: item.offer.brand.businessName,
          brandLogo: Array.isArray(item.offer.brand.images)
            ? item.offer.brand.images.map((image) => image?.url)
            : ["Image not uploaded by brand"],
          offers: [
            {
              offerId: item.offer.id,
              offerName: item.offer.offerName,
              offerDescription: item.offer.offerDescription,
              redeemedAt: item.redeemedAt,
            },
          ],
        }));

      return res
        .status(MESSAGES.SUCCESS._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            redeemedOfferDetails,
            "Redeemed offers retrieved successfully."
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

  static async searchSavedOffers(req: Request, res: Response) {
    try {
      const { userId } = (req as any).user;
      const { query } = req.query;

      if (!query || typeof query !== "string" || query.trim().length < 2) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            "Please provide at least 2 characters for search"
          ),
        });
      }

      const savedOfferRepository = getRepository(SavedOffer);
      const savedOffers = await savedOfferRepository.find({
        where: [
          { user: { id: userId }, offer: { offerName: Like(`%${query}%`) } },
          {
            user: { id: userId },
            offer: { brand: { businessName: Like(`%${query}%`) } },
          },
        ],
        relations: ["offer", "offer.brand"],
      });

      if (savedOffers.length === 0) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "No saved offers found matching the search term"
          ),
        });
      }

      const savedOfferDetails = savedOffers.map((item) => ({
        offerId: item.offer.id,
        offerName: item.offer.offerName,
        brand: item.offer.brand.businessName,
        BrandImage: Array.isArray(item.offer.brand.images)
          ? item.offer.brand.images.map((image) => image?.url)
          : ["Image not uploaded by brand"],
        offerDescription: item.offer.offerDescription,
        savedAt: item.createdAt,
      }));

      return res
        .status(MESSAGES.SUCCESS._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            savedOfferDetails,
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
