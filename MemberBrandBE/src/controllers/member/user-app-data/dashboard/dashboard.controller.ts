import { Request, Response } from "express";
import { Brand } from "../../../../models/brand/auth/auth-brand.models";
import {
  Offer,
  OfferVideo,
} from "../../../../models/brand/offers/offer.models";
import { SelectedBrand } from "../../../../models/member/selected-brands/selected-brands.models";
import ApiError from "../../../../utils/api-error";
import ApiResponse from "../../../../utils/api-response";
import { MESSAGES } from "../../../../utils/message-codes";
import { getRepository } from "typeorm";
import { UserBrandInteraction } from "../../../../models/member/brand-interaction/user-brand-interaction.models";
import { InteractionType } from "../../../../models/member/brand-interaction/user-brand-interaction.models";
import { User } from "../../../../models/member/auth/user.models";
import { Session } from "../../../../models/member/auth/user-sessions.models";
import {
  BrandResponse,
  BrandWithOffersResponse,
  VideoStatusResponse,
} from "../../../../utils/response.dto";
import { rewards } from "../../../../services/rewards-points.service";
import { VideoReward } from "../../../../models/member/video-reward/video-reward.model";
import { validate as uuidValidate } from "uuid"; // Use the 'uuid' package to validate UUID
import { Wallet } from "../../../../models/member/wallet/wallet.models";
import { FcmService } from "../../../../services/fcm.service";
import { NotificationType } from "../../../../models/member/notification/notification.models";

export class MemberDashboard {
   static async dashboard(req: Request, res: Response) {
    try {
      const { userId } = (req as any).user;

      const selectedBrandRepository = getRepository(SelectedBrand);
      const brandRepository = getRepository(Brand);
      const sessionRepository = getRepository(Session);
      const session = await sessionRepository.findOne({
        where: { user: { id: userId } },
      });

      if (!session || new Date() > session.expiresAt) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            "Session expired. Redirect to Login again"
          ),
        });
      }

      const userSelectedData = await selectedBrandRepository.find({
        where: { user: { id: userId } },
        relations: [
          "brand",
          "brand.images",
          "brand.interactions",
          "brand.offers.offerImages",
          "brand.videos",
        ],
      });

      const brandsData = await brandRepository.find({
        relations: ["images", "interactions.user", "offers.offerImages", "videos"],
      });

      const currentDate = new Date();

      const userData: BrandWithOffersResponse[] = userSelectedData
        .filter((item) => item.brand.offers && item.brand.offers.length > 0)
        .map((item) => ({
          brandId: item.brand.id,
          brandName: item.brand.businessName,
          brandLogo: Array.isArray(item.brand.images)
            ? item.brand.images.map((image) => image?.url)
            : ["Image not uploaded by brand"],
          brandVideos: Array.isArray(item.brand.videos)
            ? item.brand.videos.map((video) => ({
                url: video.url || "",
                thumbnail: video.url || "", // Using video URL as thumbnail
                title: video.originalName || "",
                uploadDate: video.createdAt || new Date(),
              }))
            : [],
          interaction:
            item.brand.interactions.length > 0
              ? item.brand.interactions[0].interaction
              : "No interaction",
          offers: item.brand.offers
            .filter(
              (offer) =>
                (!offer.endDate || new Date(offer.endDate) > currentDate) &&
                offer.offerImages &&
                offer.offerImages.length > 0
            )
            .map((offer) => {
              return {
            offerId: offer.id,
            offerName: offer.offerName,
            offerDescription: offer.offerDescription,
                offerImage:
                  offer.offerImages && Array.isArray(offer.offerImages)
                    ? offer.offerImages.map((image) => image?.url)
              : ["Image not uploaded by offer"],
              };
            }),
        }));

      if (userData.length === 0) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "Please first select your interests to view dashboard"
          ),
        });
      }

      const userBrandIds = new Set(userData.map((item) => item.brandId));

      const brandData: BrandWithOffersResponse[] = brandsData
        .filter(
          (item) =>
            item.offers && item.offers.length > 0
        )
        .map((item) => {
          const userInteractions = item.interactions
            .map((interaction) => {
              if (interaction.user && interaction.user.id === userId) {
                return interaction;
              }
              return null;
            })
            .filter((interaction) => interaction !== null);

          return {
            brandId: item.id,
            brandName: item.businessName,
            brandDescription: item.brandDescription,
            brandLogo: Array.isArray(item.images)
              ? item.images.map((image) => image?.url)
              : ["Image not uploaded by brand"],
            brandVideos: Array.isArray(item.videos)
              ? item.videos.map((video) => ({
                  url: video.url || "",
                  thumbnail: video.url || "", // Using video URL as thumbnail
                  title: video.originalName || "",
                  uploadDate: video.createdAt || new Date(),
                }))
              : [],
            interaction:
              userInteractions.length > 0
                ? userInteractions[0].interaction
                : "No interaction",
            offers: item.offers
              .filter(
                (offer) =>
                  (!offer.endDate || new Date(offer.endDate) > currentDate) &&
                  !userBrandIds.has(item.id) &&
                  offer.offerImages &&
                  offer.offerImages.length > 0
              )
              .map((offer) => ({
              offerId: offer.id,
              offerName: offer.offerName,
              offerDescription: offer.offerDescription,
              offerImage:
                offer.offerImages && Array.isArray(offer.offerImages)
                    ? offer.offerImages.map((image) => image?.url)
                  : ["Image not uploaded by offer"],
            })),
          };
        });

      const allData = [...userData, ...brandData];

      let restructuredData: BrandWithOffersResponse[] = [];

      allData.forEach((brand) => {
        if (!brand.offers || brand.offers.length === 0) return;

        brand.offers.forEach((offer) => {
          restructuredData.push({
            brandId: brand.brandId,
            brandName: brand.brandName,
            brandLogo: brand.brandLogo,
            brandVideos: brand.brandVideos,
            interaction: brand.interaction,
            offers: [
              {
                offerId: offer.offerId,
                offerName: offer.offerName,
                offerDescription: offer.offerDescription,
                offerImage: offer.offerImage,
              },
            ],
          });
        });
      });

      for (let i = restructuredData.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [restructuredData[i], restructuredData[j]] = [
          restructuredData[j],
          restructuredData[i],
        ];
      }

      return res
        .status(MESSAGES.CREATED._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            restructuredData,
            "Brands retrieved successfully"
          )
        );
    } catch (error) {
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          "Error retrieving brands"
        ),
      });
    }
  }

  static async getPopularBrands(_: Request, res: Response) {
    try {
      const selectedBrandRepository = getRepository(SelectedBrand);
      const popularBrands = await selectedBrandRepository
        .createQueryBuilder("selectedBrand")
        .leftJoin("selectedBrand.brand", "brand")
        .leftJoin("brand.images", "images")

        .select("selectedBrand.category")
        .addSelect("brand.id", "id")
        .addSelect("MAX(brand.businessName)", "businessName")
        .addSelect("MAX(brand.brandDescription)", "brandDescription")
        .addSelect("images.url", "url")
        .addSelect("COUNT(DISTINCT selectedBrand.userId)", "userCount")

        .groupBy("selectedBrand.category")
        .addGroupBy("brand.id")
        .addGroupBy("brand.businessName")
        .addGroupBy("brand.brandDescription")
        .addGroupBy("images.url")

        .orderBy("COUNT(selectedBrand.category)", "DESC")
        .getRawMany();

      if (popularBrands.length === 0) {
        return res
          .status(MESSAGES.SUCCESS._CODE)
          .json(
            new ApiResponse(
              MESSAGES.SUCCESS._CODE,
              null,
              "No popular brands found"
            )
          );
      }

      const mostPopularCategory = popularBrands
        .sort((a, b) => parseInt(b.userCount) - parseInt(a.userCount))
        .slice(0, 4);

      return res
        .status(MESSAGES.SUCCESS._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            mostPopularCategory,
            "Popular brands retrieved successfully"
          )
        );
    } catch (error) {
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          "Error retrieving popular brands"
        ),
      });
    }
  }

  static async likeOrDislikeBrand(req: Request, res: Response) {
    try {
      const { userId } = (req as any).user;
      const { brandId, action } = req.body;

      if (!["like", "dislike", "unlike"].includes(action)) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            'Invalid action. Must be "like" or "dislike" or "unlike".'
          ),
        });
      }

      const userRepository = getRepository(User);
      const brandRepository = getRepository(Brand);
      const interactionRepository = getRepository(UserBrandInteraction);

      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(MESSAGES.NOT_FOUND._CODE, null, "User not found"),
        });
      }

      const brand = await brandRepository.findOne({ where: { id: brandId } });
      if (!brand) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "Brand not found. "
          ),
        });
      }

      let existingInteraction = await interactionRepository.findOne({
        where: { user: { id: userId }, brand: { id: brandId } },
      });

      if (existingInteraction) {
        existingInteraction.interaction =
          action === "like"
            ? InteractionType.LIKE
            : action === "dislike"
              ? InteractionType.DISLIKE
              : InteractionType.UNLIKE;
        await interactionRepository.save(existingInteraction);

        return res
          .status(200)
          .json(
            new ApiResponse(
              MESSAGES.SUCCESS._CODE,
              existingInteraction,
              "Brand interaction updated successfully"
            )
          );
      }

      const newInteraction = new UserBrandInteraction();
      newInteraction.user = user;
      newInteraction.brand = brand;
      newInteraction.interaction =
        action === "like"
          ? InteractionType.LIKE
          : action === "dislike"
            ? InteractionType.DISLIKE
            : InteractionType.UNLIKE;
      await interactionRepository.save(newInteraction);

      const responseData: BrandResponse = {
        brandId: newInteraction.brand.id,
        brandName: newInteraction.brand.businessName,
        interaction: newInteraction.interaction,
        createdAt: newInteraction.createdAt,
      };

      return res
        .status(MESSAGES.CREATED._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            responseData,
            "Brand interaction created successfully"
          )
        );
    } catch (error) {
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          "Internal Server Error"
        ),
      });
    }
  }

  static async filterOfferType(req: Request, res: Response) {
    try {
      const { offerType } = req.body;

      console.log("Received offerTypes:", offerType);

      if (!offerType || !Array.isArray(offerType)) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            "offerTypes should be an array."
          ),
        });
      }

      const validOfferTypes = [
        "Discount",
        "Free Shipping",
        "Cashback",
        "Sale Price",
        "Buy X Get Y Free",
      ];

      const filteredOfferTypes = offerType.filter((type: string) => {
        return validOfferTypes.some(validType => type.startsWith(validType));
      });
      console.log("Filtered offer types:", filteredOfferTypes);

      if (filteredOfferTypes.length === 0) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            "No valid offer types provided. Allowed values are: " +
            validOfferTypes.join(", ")
          ),
        });
      }

      const cleanedOfferTypes = offerType
        .map((type: string) => {
          return type.replace(/^[^\w\s]+|[^\w\s]+$/g, '').trim();
        })
        .filter((type: string) => validOfferTypes.some(validType => type.startsWith(validType))); // Match valid types only

      console.log("Cleaned offer types:", cleanedOfferTypes);

      if (cleanedOfferTypes.length === 0) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            "No valid offer types provided. Allowed values are: " +
            validOfferTypes.join(", ")
          ),
        });
      }


      const offerTypeRepository = getRepository(Offer)

      const query = "offer.offerType IN (:...offerTypes)";
      const params = {
        offerTypes: cleanedOfferTypes,
      };

      console.log("Generated Query:", query);
      console.log("Params:", params);

      const offers = await offerTypeRepository
        .createQueryBuilder("offer")
        .leftJoinAndSelect("offer.brand", "brand")
        .leftJoinAndSelect("brand.images", "images")
        .leftJoinAndSelect("brand.interactions", "interactions")
        .leftJoinAndSelect("offer.videos", "videos")
        .leftJoinAndSelect("offer.offerImages", "offerImages")
        .where(query, params)
        .getMany();

      console.log("Offers retrieved:", offers);

      if (offers.length === 0) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "Data not found ofs offerType"
          ),
        });
      }

      const response: BrandWithOffersResponse[] = offers.map((offer) => ({
        brandId: offer.brand.id,
        brandName: offer.brand.businessName,
        brandLogo: offer.brand.images && Array.isArray(offer.brand.images) ? offer.brand.images.map((image) => image.url) : ["Image not uploaded by brand"],
        interaction: offer.brand.interactions.length > 0 ? offer.brand.interactions[0].interaction : "No interaction",

        offers: [
          {
            offerId: offer.id,
            offerName: offer.offerName,
            offerDescription: offer.offerDescription,
            offerImage: offer.offerImages && Array.isArray(offer.offerImages) ? offer.offerImages.map((image) => image.url) : ["Image not uploaded by offer"],
            offerType: offer.offerType,
          },
        ],
      }));

      console.log("Mapped response:", response);

      return res.status(MESSAGES.CREATED._CODE).json(
        new ApiResponse(
          MESSAGES.SUCCESS._CODE,
          response,
          "Filter has been applied successfully"
        )
      );
    } catch (error) {
      console.error("Error:", error);
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          "Error fetching offer type"
        ),
      });
    }
  }

  static async fetchLatestDeals(req: Request, res: Response) {
    try {
      const offerRepository = getRepository(Offer);      const latestDeals = await offerRepository
        .createQueryBuilder("offer")
        .leftJoinAndSelect("offer.brand", "brand")
        .leftJoinAndSelect("brand.images", "images")
        .leftJoinAndSelect("brand.interactions", "interactions")
        .leftJoinAndSelect("brand.videos", "videos")
        .leftJoinAndSelect("offer.offerImages", "offerImages")
        .orderBy("offer.createdAt", "DESC")
        .getMany();

      if (!latestDeals || latestDeals.length === 0) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "No latest deals available."
          ),
        });
      }

      const seenBrandsIds = new Set();
      const response: BrandWithOffersResponse[] = latestDeals
        .map((offer) => ({          brandId: offer.brand.id,
          brandName: offer.brand.businessName,
          brandLogo: Array.isArray(offer.brand.images)
            ? offer.brand.images.map((image) => image.url)
            : ["Image not uploaded by brand"],
          brandVideos: Array.isArray(offer.brand.videos)
            ? offer.brand.videos.map((video) => ({
                url: video.url || "",
                thumbnail: video.url || "", // Using video URL as thumbnail
                title: video.originalName || "",
                uploadDate: video.createdAt || new Date(),
              }))
            : [],
          interaction:
            offer.brand.interactions.length > 0
              ? offer.brand.interactions[0].interaction
              : "No interaction",
          offers: [
            {
              offerId: offer.id,
              offerName: offer.offerName,
              offerDescription: offer.offerDescription,
              offerImage:
                offer.offerImages && Array.isArray(offer.offerImages)
                  ? offer.offerImages.map((image) => image.url)
                  : ["Image not uploaded by offer"],
            },
          ],
        }))
        .filter((brand) => {
          if (seenBrandsIds.has(brand.brandId)) {
            return false;
          }
          seenBrandsIds.add(brand.brandId);
          return true;
        });

      return res
        .status(MESSAGES.SUCCESS._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            response,
            "Latest deals fetched successfully."
          )
        );
    } catch (error) {
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          "Error fetching latest deals"
        ),
      });
    }
  }

  static async statusVideo(req: Request, res: Response) {
    try {
      const { userId } = (req as any).user;
      const currentDate = new Date();

      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(MESSAGES.NOT_FOUND._CODE, null, "User not found"),
        });
      }

      const userSelectedBrands = await getRepository(SelectedBrand).find({
        where: { user: { id: userId } },
        relations: [
          "brand",
          "brand.offers",
          "brand.offers.offerImages",
          "brand.offers.videos",
          "brand.offers.brand",
        ],
      });

      if (!userSelectedBrands || userSelectedBrands.length === 0) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "No selected brands found for the user"
          ),
        });
      }

      const isStatusUploaded = userSelectedBrands.some((brand) =>
        brand.brand.offers.some(
          (offer) => 
            offer.videos && 
            offer.videos.length > 0 && 
            (!offer.endDate || new Date(offer.endDate) > currentDate)
        )
      );

      if (!isStatusUploaded) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "No active videos found"
          ),
        });
      }

      const uniqueVideos: Map<string, VideoStatusResponse> = new Map();

      userSelectedBrands.forEach((brand) => {
        brand.brand.offers?.forEach((offer) => {
          // Skip expired offers
          if (offer.endDate && new Date(offer.endDate) <= currentDate) {
            return;
          }

          offer.videos?.forEach((video) => {
            if (!uniqueVideos.has(offer.id)) {
              uniqueVideos.set(offer.id, {
                offerId: offer.id,
                offerName: offer.offerName,
                brandName: offer.brand.businessName,
                offerImage:
                  offer.offerImages && Array.isArray(offer.offerImages)
                    ? offer.offerImages.map((image) => image.url)
                    : ["Image not uploaded by offer"],
                videoId: video.id,
                videoUrl: [video.url],
                duration: video.duration,
                postedAt: video.createdAt,
              });
            }
          });
        });
      });

      const statusBar = Array.from(uniqueVideos.values());

      return res
        .status(MESSAGES.SUCCESS._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            statusBar,
            "Status video fetched successfully"
          )
        );
    } catch (error) {
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          "Internal Server Error. Error fetching status video"
        ),
      });
    }
  }

  static async trackVideoCompletion(req: Request, res: Response) {
    try {
      const { watchedFull, videoId } = req.body; // Receive userId, videoId, and watched status from the frontend
      const { userId } = (req as any).user;
      console.log("Received videoId:", videoId); // Log the videoId

      if (!uuidValidate(videoId)) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            "Invalid videoId format"
          ),
        });
      }

      // Validate the request data
      if (!videoId || typeof watchedFull === "undefined") {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            "Bad Request! Missing videoId or watchedFull is undefined"
          ),
        });
      }

      // Get the user from the database
      const userRepository = getRepository(User);
      const offerVideoRepository = getRepository(OfferVideo);
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(MESSAGES.NOT_FOUND._CODE, null, "User not found"),
        });
      }

      const offerVideo = await offerVideoRepository.findOne({
        where: { id: videoId },
      });

      console.log(offerVideo);
      if (!offerVideo) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "Offer's Video not found"
          ),
        });
      }

      // Check if the user has already been rewarded for this video
      const videoRewardRepository = getRepository(VideoReward);
      const existingReward = await videoRewardRepository.findOne({
        where: { videoId, userId },
      });
      console.log(existingReward);

      if (existingReward) {
        return res
          .status(MESSAGES.SUCCESS._CODE)
          .json(
            new ApiResponse(
              MESSAGES.SUCCESS._CODE,
              null,
              `User has already been rewarded for this video.`
            )
          );
      }

      // If the user watched the full video, award the reward points
      if (watchedFull === "true") {
        const rewardAmount = rewards.video.awareness;        // Update the user's points balance (assuming the user has a points field)
        user.points += rewardAmount;
        await userRepository.save(user); // Save the updated user data

        const newReward = new VideoReward();
        newReward.userId = userId;
        newReward.videoId = videoId;
        newReward.rewardAmount = rewardAmount;
        await videoRewardRepository.save(newReward);

        // Send FCM notification for video reward
        try {
          const fcmTemplate = FcmService.getVideoRewardNotification(rewardAmount);

          const fcmPayload = {
            title: fcmTemplate.title,
            body: fcmTemplate.body,
            data: {
              ...fcmTemplate.data,
              videoId: videoId,
              pointsEarned: rewardAmount.toString(),
            },
          };

          await FcmService.sendToUser(
            userId,
            fcmPayload,
            NotificationType.VIDEO_REWARD
          );

          console.log(`Video reward notification sent to user ${userId} for ${rewardAmount} points`);
        } catch (fcmError) {
          console.error("Error sending video reward notification:", fcmError);
          // Don't fail the request if notification fails
        }

        // Send a success response with the reward details
        return res
          .status(MESSAGES.SUCCESS._CODE)
          .json(
            new ApiResponse(
              MESSAGES.SUCCESS._CODE,
              { rewardAmount },
              `User has been rewarded with ${rewardAmount} points for watching the full video.`
            )
          );
      }

      return res
        .status(MESSAGES.SUCCESS._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            null,
            `Video status recorded, but no reward given as the video was not watched fully.`
          )
        );
    } catch (error) {
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          "Internal Server Error. Error tracking video completion"
        ),
      });
    }
  }

  static async getUserWalletCoins(req: Request, res: Response) {
    try {
      const { userId } = (req as any).user;

      const walletRepository = getRepository(Wallet);
      const wallet = await walletRepository.findOne({
        where: { user: { id: userId } },
        select: ["id", "coins", "points"],
      });

      if (!wallet) {
        return res.status(404).json({
          message: "Wallet not found for this user.",
        });
      }

      return res.status(200).json({
        message: "Wallet retrieved successfully",
        coins: wallet.coins,
        points: wallet.points,
        coinsWorth: 0.05,
      });
    } catch (error) {
      console.error("Error retrieving wallet:", error);
      return res.status(500).json({
        error: "An error occurred while retrieving wallet information.",
      });
    }
  }
}
