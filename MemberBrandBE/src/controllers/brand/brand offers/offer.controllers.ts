import { Request, Response } from "express";
import { getRepository, LessThan, Like, MoreThan, Raw } from "typeorm";
import { MESSAGES } from "../../../utils/message-codes";
import ApiError from "../../../utils/api-error";
import ApiResponse from "../../../utils/api-response";
import {
  Offer,
  OfferImage,
  OfferVideo,
} from "../../../models/brand/offers/offer.models";
import currentRegionDate from "../../../services/date-region.service";
import { Brand } from "../../../models/brand/auth/auth-brand.models";
import { SocketService } from "../../../services/socket.service";
import sharp from "sharp";
import { PassThrough, Readable } from "stream";
import Ffmpeg from "fluent-ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import { uploadToS3, uploadToS3Stream } from "../../../services/s3.service";
import { RedemptionRequest } from "../../../models/brand/redeem-via/redemption-request.model";
import { rewards } from "../../../services/rewards-points.service";
import { User } from "../../../models/member/auth/user.models";
import { generateOfferCodes } from "../../../services/generate-promo.service";
import { RedeemedOffer } from "../../../models/member/redeemed-offers/redeemed-offers.models";
import { Wallet } from "../../../models/member/wallet/wallet.models";
import { FcmService } from "../../../services/fcm.service";
import { NotificationType } from "../../../models/member/notification/notification.models";

export class BrandOfferController {
  private static socketService: SocketService;
  public static setSocketService(socketService: SocketService) {
    this.socketService = socketService;
  }
  static async createOffers(req: Request, res: Response) {
    const {
      offerName,
      offerDescription,
      offerTermsCondition,
      cities,
      inStore,
      userLimit,
      retailPrice,
      offerType,
      applyTo,
      offerAmount,
      discountPercentage,
      isShareable,
      startDate,
      endDate,
      setTimeUnlimited,
    } = req.body;

    const userIp = req.ip;
    const regionDateInfo = await currentRegionDate(userIp);
    const currentDate = regionDateInfo.localDateTime;
    const { userId } = (req as any).user;
    const brandId = userId;

    if (!validateOfferType(offerType)) {
      return res.status(MESSAGES.BAD_REQUEST._CODE).json({
        error: new ApiError(
          MESSAGES.BAD_REQUEST._CODE,
          null,
          "'offerType' must be one of the allowed values: % Discount, $ Discount, Free Shipping, Cash Back, Sale Price, Buy X Get Y Free"
        ),
      });
    }

    if (
      endDate &&
      new Date(endDate) < new Date(currentDate) &&
      !setTimeUnlimited
    ) {
      return res.status(MESSAGES.BAD_REQUEST._CODE).json({
        error: new ApiError(
          MESSAGES.BAD_REQUEST._CODE,
          null,
          "End date should be greater than current date"
        ),
      });
    }

    try {
      const offerRepository = getRepository(Offer);
      const brandRepository = getRepository(Brand);

      const { offerSerial, promoCodes } = generateOfferCodes(offerName, userLimit);

      const brand = await brandRepository.findOne({
        where: { id: brandId },
      });

      if (!brand) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            `Brand not found with this ID`
          ),
        });
      }

      const existingOfferName = await offerRepository.findOne({
        where: {
          offerName: offerName,
          brand: { id: brandId },
        },
      });

      if (existingOfferName) {
        return res.status(MESSAGES.CONFLICT._CODE).json({
          error: new ApiError(
            MESSAGES.CONFLICT._CODE,
            null,
            "An offer with this name already exists for this brand"
          ),
        });
      }

      let isShareableValue = null;
      if (isShareable !== undefined) {
        isShareableValue = isShareable ? "yes" : "no";
      }

      let offerLimitUnlimited = false;
      let offerLimitUses = "1";

      if (isShareable === "yes") {
        offerLimitUnlimited = true;
        offerLimitUses = null;
      } else {
        offerLimitUnlimited = false;
        offerLimitUses = "1";
      }

      let finalEndDate = endDate;
      if (setTimeUnlimited) {
        finalEndDate = null;
      }

      const offer = offerRepository.create({
        offerName,
        offerDescription,
        offerTermsCondition,
        cities,
        inStore: inStore,
        retailPrice,
        userLimit,
        offerType,
        offerCode: promoCodes,
        offerSerial,
        applyTo,
        offerAmount,
        discountPercentage,
        startDate: new Date(startDate),
        endDate: finalEndDate,
        setTimeUnlimited,
        isShareable,
        offerLimitUses,
        offerLimitUnlimited,
        createdAt: new Date(),
        updatedAt: new Date(),
        brand,
      });

      const savedOffer = await offerRepository.save(offer, { reload: true });

      if (!savedOffer.id) {
        return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
          error: new ApiError(
            MESSAGES.INTERNAL_SERVER_ERROR._CODE,
            "Failed to create offer",
            MESSAGES.INTERNAL_SERVER_ERROR.message
          ),
        });
      }

      try {
        await BrandOfferController.socketService.notifyUsersOfNewOffer(
          brand.id,
          savedOffer.id
        );
      } catch (error) {
        return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
          error: new ApiError(
            MESSAGES.INTERNAL_SERVER_ERROR._CODE,
            "Failed to send notifications",
            MESSAGES.INTERNAL_SERVER_ERROR.message
          ),
        });
      }

      const offerWithBrand = await offerRepository.findOne({
        where: { id: savedOffer.id },
        relations: ["brand"],
      });

      return res
        .status(MESSAGES.CREATED._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            offerWithBrand,
            "Offer created successfully"
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

  static async uploadImage(req: Request, res: Response) {
    try {
      const offerId = req.params.offerId;
      const file = req.file

      if (!file) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            MESSAGES.NO_FILES_SELECTED.message
          ),
        });
      }

      const imageRepository = getRepository(OfferImage);
      const offerRepository = getRepository(Offer);
      const offer = await offerRepository.findOne({ where: { id: offerId } });

      if (!offer) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "Offer not found"
          ),
        });
      }


      const metadata = await sharp(file.buffer).metadata();
      console.log("height: ", metadata.height, "width: ", metadata.width);

      if (metadata.width < 1000 || metadata.height < 1000) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            "Image dimensions must be greater than 1000x1000"
          ),
        });
      }

      const cloudUploadUrl = await uploadToS3(
        file.buffer,
        "brandsadmin-upload-offer-offerId",
        offerId
      );

      if (!cloudUploadUrl) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "URL not found"
          ),
        });
      }

      const image = new OfferImage();
      image.originalName = file.originalname;
      image.url = cloudUploadUrl;
      image.size = file.size;
      image.offer = offer;

      const savedImage = await imageRepository.save(image);

      return res
        .status(MESSAGES.CREATED._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            savedImage,
            "Offer Image uploaded successfully"
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

  static async uploadVideo(req: Request, res: Response) {
    try {
      const offerId = req.params.offerId;
      const file = req.file;

      if (!file) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            MESSAGES.NO_FILES_SELECTED.message
          ),
        });
      }

      const videoRepository = getRepository(OfferVideo);
      const offerRepository = getRepository(Offer);
      const offer = await offerRepository.findOne({ where: { id: offerId } });

      if (!offer) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "Offer not found"
          ),
        });
      }
      const results = [];

      try {
        const fileBufferStream = Readable.from(file.buffer);
        const uploadStream = fileBufferStream;

        const allowedMimeTypes = [
          "video/mp4",
          "video/quicktime",
          "video/x-msvideo",
        ];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return res.status(MESSAGES.BAD_REQUEST._CODE).json({
            error: new ApiError(
              MESSAGES.BAD_REQUEST._CODE,
              null,
              `Invalid file type. Allowed types: ${allowedMimeTypes.join(
                ", "
              )}`
            ),
          });
        }

        const cloudUploadUrl = await uploadToS3Stream(
          uploadStream,
          "brandsadmin-upload-offer-video",
          `${offerId}-${Date.now()}`,
          file.mimetype
        );

        if (!cloudUploadUrl) {
          return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
            error: new ApiError(
              MESSAGES.INTERNAL_SERVER_ERROR._CODE,
              null,
              "Failed to upload video to storage"
            ),
          });
        }

        const video = new OfferVideo();
        video.originalName = file.originalname;
        video.url = cloudUploadUrl;
        video.size = file.size;
        video.mimeType = file.mimetype;
        video.offer = offer;

        const savedVideo = await videoRepository.save(video);
        results.push({ video: savedVideo });
      } catch (error) {
        results.push({
          success: false,
          fileName: file.originalname,
          error: error.message,
        });
      }


      return res
        .status(MESSAGES.CREATED._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            results,
            "Offer video uploaded successfully"
          )
        );
    } catch (error) {
      console.error("video limit error: ", error)
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          MESSAGES.INTERNAL_SERVER_ERROR.message
        ),
      });
    }
  }

  static async promoCodesByOfferID(req: Request, res: Response) {
    const { offerId } = req.params;

    try {
      const offerRepository = getRepository(Offer);

      const isOfferIDValid = await offerRepository.findOne({
        where: { id: offerId },
      });

      if (!isOfferIDValid) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            `Invalid offerID or Not exists`
          ),
        });
      }

      const offer = await offerRepository.findOne({
        where: { id: offerId },
        select: ["offerCode", "offerCodeStatus"],
      });

      if (
        !offer.offerCode &&
        (!offer.offerCodeStatus || offer.offerCodeStatus.length === 0)
      ) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            `No promo codes found for this offer`
          ),
        });
      }

      const codes = Array.isArray(offer.offerCode)
        ? offer.offerCode
        : [offer.offerCode];

      let promoCodes = codes.map((code) => {
        const statusEntry = Array.isArray(offer.offerCodeStatus)
          ? offer.offerCodeStatus.find((c) => c.code === code)
          : undefined;
        return {
          promoCode: code,
          used: statusEntry ? statusEntry.used : false,
        };
      });

      if (promoCodes.length === 0) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            `No promo codes found`
          ),
        });
      }

      return res
        .status(MESSAGES.SUCCESS._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            promoCodes,
            "Promo codes retrieved successfully"
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

  static async getOfferNameByBrandID(req: Request, res: Response) {
    const { brandId } = req.params;

    try {
      const offerRepository = getRepository(Offer);
      const offers = await offerRepository.find({
        where: { brand: { id: brandId } },
      });

      if (offers.length === 0) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "No offers found for this brand"
          ),
        });
      }
      const offerData = offers.map((offer) => ({
        offerId: offer.id,
        offerName: offer.offerName,
      }));

      return res
        .status(MESSAGES.SUCCESS._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            offerData,
            "Offer name retrieved successfully"
          )
        );
    } catch (error) {
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          "Failed to retrieve offer name",
          MESSAGES.INTERNAL_SERVER_ERROR.message
        ),
      });
    }
  }

  static async getRedemptionRequests(req: Request, res: Response) {
    try {
      const { status, startDate, endDate, offerId, page, limit } = req.query;

      const redemptionRequestRepository = getRepository(RedemptionRequest);

      const queryBuilder = redemptionRequestRepository
        .createQueryBuilder("redemption")
        .leftJoinAndSelect("redemption.offer", "offer")
        .leftJoinAndSelect("redemption.user", "user")
        .orderBy("redemption.createdAt", "DESC");

      if (status) {
        queryBuilder.andWhere("redemption.status = :status", { status });
      }

      if (offerId) {
        queryBuilder.andWhere("offer.id = :offerId", { offerId });
      }

      if (startDate && endDate) {
        queryBuilder.andWhere(
          "redemption.createdAt BETWEEN :startDate AND :endDate",
          {
            startDate: new Date(startDate as string),
            endDate: new Date(endDate as string),
          }
        );
      }

      const skip = (Number(page) - 1) * Number(limit);
      queryBuilder.skip(skip).take(Number(limit));

      const [redemptions, total] = await queryBuilder.getManyAndCount();

      if (redemptions.length === 0) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          message: "No redemption requests found matching the criteria.",
        });
      }

      // Update isExpired status for each redemption request
      const currentDate = new Date();
      const updatedRedemptions = [];

      for (const redemption of redemptions) {
        // Check if offer is expired
        const isOfferExpired =
          redemption.offer?.endDate &&
          new Date(redemption.offer.endDate) < currentDate &&
          !redemption.offer.setTimeUnlimited;

        // Update isExpired field if needed
        if (isOfferExpired && !redemption.isExpired) {
          redemption.isExpired = true;

          // If the redemption is still pending, mark it as rejected due to expiration
          if (redemption.status === "PENDING") {
            redemption.status = "REJECTED";
            redemption.rejected = true;
            redemption.rejectionReason = "Offer has expired";
          }

          // Save the updated redemption
          await redemptionRequestRepository.save(redemption);
        }

        updatedRedemptions.push(redemption);
      }

      return res.status(200).json({
        message: "Redemption requests retrieved successfully",
        data: {
          redemptions: updatedRedemptions.map((redemption) => ({
            id: redemption.id,
            status: redemption.status,
            paymentMethod: redemption.paymentMethod,
            promoCodeUsed: redemption.promoCodeUsed,
            createdAt: redemption.createdAt,
            approvalDate: redemption.approvalDate,
            isExpired: redemption.isExpired,
            user: {
              id: redemption.user?.id,
              name: redemption.user?.fullName,
              email: redemption.user?.email,
            },
            offer: {
              id: redemption.offer?.id,
              name: redemption.offer?.offerName,
              description: redemption.offer?.offerDescription,
            },
          })),
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            totalItems: total,
            itemsPerPage: Number(limit),
          },
        },
      });
    } catch (error) {
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          "An error occurred while fetching redemption requests."
        ),
      });
    }
  }

  static async approveRejectRedemptionRequest(req: Request, res: Response) {
    try {
      const { redemptionId } = req.params;
      const { approve, rejectionReason } = req.body;

      if (!redemptionId) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            "Redemption request ID is required."
          ),
        });
      }

      const redemptionRequestRepository = getRepository(RedemptionRequest);
      const userRepository = getRepository(User);
      const redeemedOfferRepository = getRepository(RedeemedOffer);
      const walletRepository = getRepository(Wallet); const redemptionRequest = await redemptionRequestRepository.findOne({
        where: { id: redemptionId },
        relations: ["offer", "offer.brand", "user"],
      });

      if (!redemptionRequest) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: "Redemption request not found.",
        });
      }

      if (redemptionRequest.approved) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: "This redemption request has already been approved.",
        });
      }

      if (redemptionRequest.rejected) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: "Cannot approve a rejected redemption request.",
        });
      }

      const currentDate = new Date();
      if (
        redemptionRequest.offer.endDate &&
        new Date(redemptionRequest.offer.endDate) < currentDate &&
        !redemptionRequest.offer.setTimeUnlimited
      ) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: "Cannot approve redemption for an expired offer.",
        });
      }

      let redemptionResponse;
      if (approve) {
        // Check if this is the first redemption BEFORE changing approval status
        const previousApprovedCount = await redemptionRequestRepository.count({
          where: { user: redemptionRequest.user, approved: true },
        });
        const isFirstRedemption = previousApprovedCount === 0;

        console.log("Previously approved redemptions:", previousApprovedCount);
        console.log("Is first redemption:", isFirstRedemption);
        console.log("User:", redemptionRequest.user);

        redemptionResponse = "approved";
        redemptionRequest.approved = true;
        redemptionRequest.status = "APPROVED";
        redemptionRequest.approvalDate = currentDate;

        // Create redeemed offer record without updating points/coins
        await redeemedOfferRepository.save(
          redeemedOfferRepository.create({
            user: redemptionRequest.user,
            offer: redemptionRequest.offer,
            points: redemptionRequest.points,
            dollarValue: Number(redemptionRequest.coins) * 0.05, // Convert coins to dollar value
            totalPoints: redemptionRequest.user.points || 0,
            totalDollars: redemptionRequest.user.coins || 0,
          })
        );

      } else {
        redemptionResponse = "rejected";
        redemptionRequest.rejected = true;
        redemptionRequest.status = "REJECTED";
        redemptionRequest.rejectionReason =
          rejectionReason || "No specific reason provided.";
      } const updatedRedemption = await redemptionRequestRepository.save(
        redemptionRequest
      );

      // Send FCM notification for redemption approval/rejection
      try {
        if (approve) {
          const fcmTemplate = FcmService.getRedemptionApprovedNotification(
            redemptionRequest.offer.offerName,
            redemptionRequest.points,
            redemptionRequest.offer.brand?.businessName,
            redemptionRequest.offer.brand?.id,
            redemptionRequest.isClaimed
          );

          const fcmPayload = {
            title: fcmTemplate.title,
            body: fcmTemplate.body,
            data: {
              ...fcmTemplate.data,
              redemptionId: redemptionRequest.id,
              offerId: redemptionRequest.offer.id,
            },
          }; const result = await FcmService.sendToUser(
            redemptionRequest.user.id,
            fcmPayload,
            NotificationType.REDEMPTION_APPROVED
          );

          if (result.notificationSaved) {
            console.log(`Notification saved for user ${redemptionRequest.user.id}. Push notification: ${result.success ? 'sent' : 'failed/skipped'}`);
          } else {
            console.log(`Failed to save notification for user ${redemptionRequest.user.id}`);
          }
        } else {
          const fcmTemplate = FcmService.getRedemptionRejectedNotification(
            redemptionRequest.offer.offerName,
            rejectionReason,
            redemptionRequest.offer.brand?.businessName,
            redemptionRequest.offer.brand?.id,
            redemptionRequest.isClaimed
          );

          const fcmPayload = {
            title: fcmTemplate.title,
            body: fcmTemplate.body,
            data: {
              ...fcmTemplate.data,
              redemptionId: redemptionRequest.id,
              offerId: redemptionRequest.offer.id,
            },
          }; const result = await FcmService.sendToUser(
            redemptionRequest.user.id,
            fcmPayload,
            NotificationType.REDEMPTION_REJECTED
          );

          if (result.notificationSaved) {
            console.log(`Notification saved for user ${redemptionRequest.user.id}. Push notification: ${result.success ? 'sent' : 'failed/skipped'}`);
          } else {
            console.log(`Failed to save notification for user ${redemptionRequest.user.id}`);
          }
        }
      } catch (notificationError) {
        console.error("Failed to send redemption notification:", notificationError);
        // Don't fail the request if notification fails
      }

      return res.status(200).json({
        message: `Redemption request ${redemptionResponse} successfully`,
        data: {
          redemptionId: updatedRedemption.id,
          approvalDate: updatedRedemption.approvalDate,
          promoCode: updatedRedemption.promoCodeUsed,
          status: updatedRedemption.status,
        },
      });
    } catch (error) {
      return res.status(500).json({
        error: "An error occurred while processing the redemption request.",
        details: error.message,
      });
    }
  }

  static async getLiveOffers(req: Request, res: Response) {
    const { userId } = (req as any).user;

    try {
      const currentDate = new Date();

      const offerRepository = getRepository(Offer);
      const liveOffers = await offerRepository.find({
        where: {
          brand: { id: userId },
          endDate: MoreThan(currentDate),
        },
        relations: ["offerImages", "redeemedOffers", "videos"],
      });

      if (liveOffers.length === 0) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "No live offers found. Please upload first"
          ),
        });
      }

      const image = liveOffers.map((img) =>
        img.offerImages.map((offerImg) => offerImg.id)
      );
      const flattenedImage = image.flat();

      if (flattenedImage.length === 0) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "Please upload image to view all offers"
          ),
        });
      }

      const parseToArray = (value: string) => {
        return value
          ? value
            .replace(/[{}"\\]/g, "")
            .split(",")
            .map((item) => item.trim())
          : [];
      };

      const formattedOffers = liveOffers.map((offer) => ({
        ...offer,
        cities: parseToArray(offer.cities),
        applyTo: parseToArray(offer.applyTo),
        sales: 0,
        redemption: "under maintainance",
        remaining: "under maintaince",
        deliveryCost: "under maintainance",
        offerImages: offer.offerImages.map((image) => ({
          id: image.id,
          originalName: image.originalName,
          url: image.url,
        })),
        offerVideo: offer.videos.map((video) => ({
          id: video.id,
          originalName: video.originalName,
          url: video.url,
        })),
      }));

      return res
        .status(MESSAGES.SUCCESS._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            formattedOffers,
            "Live offers retrieved successfully"
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

  static async getPastOffers(req: Request, res: Response) {
    const { userId } = (req as any).user;

    const currentDate = new Date();
    const offerRepository = getRepository(Offer);
    try {
      const pastOffers = await offerRepository.find({
        where: {
          brand: { id: userId },
          endDate: LessThan(currentDate),
        },
        relations: ["offerImages", "videos"],
      });

      if (pastOffers.length === 0) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "There is no any past offers"
          ),
        });
      }

      const parseToArray = (value: string) => {
        return value
          ? value
            .replace(/[{}"\\]/g, "")
            .split(",")
            .map((item) => item.trim())
          : [];
      };

      const formattedOffers = pastOffers.map((offer) => ({
        ...offer,
        cities: parseToArray(offer.cities),
        applyTo: parseToArray(offer.applyTo),
        sales: 0,
        redemption: "under maintainance",
        remaining: "under maintainance",
        deliveryCost: "under maintainance",
        offerImages: offer.offerImages.map((image) => ({
          id: image.id,
          originalName: image.originalName,
          url: image.url,
        })),
        offerVideo: offer.videos.map((video) => ({
          id: video.id,
          originalName: video.originalName,
          url: video.url,
        })),
      }));

      return res
        .status(MESSAGES.SUCCESS._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            formattedOffers,
            "Past offers retrieved successfully"
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

  static async updateOfferById(req: Request, res: Response) {
    const offerId = req.params.offerId;
    const {
      offerName,
      offerDescription,
      offerTermsCondition,
      cities,
      inStore,
      userLimit,
      retailPrice,
      offerType,
      applyTo,
      offerAmount,
      discountPercentage,
      isShareable,
      startDate,
      endDate,
      setTimeUnlimited,
    } = req.body;

    const userIp = req.ip;
    const regionDateInfo = await currentRegionDate(userIp);
    const currentDate = regionDateInfo.localDateTime;

    if (!validateOfferType(offerType)) {
      return res.status(MESSAGES.BAD_REQUEST._CODE).json({
        error: new ApiError(
          MESSAGES.BAD_REQUEST._CODE,
          null,
          "'offerType' must be one of the allowed values: % Discount, $ Discount, Free Shipping, Cash Back, Sale Price, Buy X Get Y Free"
        ),
      });
    }
    if (endDate && endDate < currentDate && !setTimeUnlimited) {
      return res.status(MESSAGES.BAD_REQUEST._CODE).json({
        error: new ApiError(
          MESSAGES.BAD_REQUEST._CODE,
          null,
          "End date should be greater than current date"
        ),
      });
    }

    try {
      const offerRepository = getRepository(Offer);
      const brandRepository = getRepository(Brand);

      const offer = await offerRepository.findOne({
        where: { id: offerId },
        relations: ["brand"],
      });

      if (!offer) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            `Offer not found with ID: ${offerId}`
          ),
        });
      }

      // Only check for existing offerName conflict if the offerName is being updated
      if (offerName && offerName !== offer.offerName) {
        const existingOfferName = await offerRepository.findOne({
          where: {
            offerName: offerName,
            brand: { id: offer.brand.id },
          },
        });

        if (existingOfferName) {
          return res.status(MESSAGES.CONFLICT._CODE).json({
            error: new ApiError(
              MESSAGES.CONFLICT._CODE,
              null,
              "Offer with this name already exists for this brand"
            ),
          });
        }
      }

      // Update the fields conditionally
      offer.offerName = offerName || offer.offerName;
      offer.offerDescription = offerDescription || offer.offerDescription;
      offer.offerTermsCondition =
        offerTermsCondition || offer.offerTermsCondition;
      offer.cities = cities || offer.cities;
      offer.inStore = inStore !== undefined ? inStore : offer.inStore;
      offer.retailPrice = retailPrice || offer.retailPrice;
      offer.userLimit = userLimit || offer.userLimit;
      offer.offerType = offerType || offer.offerType;
      offer.applyTo = applyTo || offer.applyTo;
      offer.offerAmount = offerAmount || offer.offerAmount;
      offer.discountPercentage = discountPercentage || offer.discountPercentage;
      offer.startDate = new Date(startDate);
      offer.endDate = endDate ? new Date(endDate) : offer.endDate;
      offer.setTimeUnlimited = setTimeUnlimited || offer.setTimeUnlimited;
      offer.isShareable = isShareable;
      offer.updatedAt = new Date();

      const updatedOffer = await offerRepository.save(offer, { reload: true });

      if (!updatedOffer.id) {
        throw new Error("Failed to update offer");
      }

      try {
        await BrandOfferController.socketService.notifyUsersOfNewOffer(
          offer.brand.id,
          updatedOffer.id
        );
      } catch (error) {
        console.error("Failed to send notifications:", error);
      }

      const offerWithBrand = await offerRepository.findOne({
        where: { id: updatedOffer.id },
        relations: ["brand"],
      });

      return res
        .status(MESSAGES.SUCCESS._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            offerWithBrand,
            "Offer updated successfully"
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

  static async renewOfferById(req: Request, res: Response) {
    const offerId = req.params.offerId;

    const { offerName, applyTo, deliveryCost, endDate } = req.body;

    const userIp = req.ip;
    const regionDateInfo = await currentRegionDate(userIp);
    const currentDate = regionDateInfo.localDateTime;

    if (endDate && new Date(endDate) < new Date(currentDate)) {
      return res.status(MESSAGES.BAD_REQUEST._CODE).json({
        error: new ApiError(
          MESSAGES.BAD_REQUEST._CODE,
          null,
          "End date should be greater than current date"
        ),
      });
    }

    try {
      const offerRepository = getRepository(Offer);
      const offer = await offerRepository.findOne({
        where: { id: offerId },
        relations: ["brand"],
      });

      if (!offer) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            `Offer not found`
          ),
        });
      }

      const existingOfferName = await offerRepository.findOne({
        where: {
          offerName: offerName,
          id: offerId,
        },
      });

      if (existingOfferName) {
        return res.status(MESSAGES.CONFLICT._CODE).json({
          error: new ApiError(
            MESSAGES.CONFLICT._CODE,
            null,
            "Renew offer with new name. Offer with this name already live"
          ),
        });
      }

      offer.offerName = offerName || offer.offerName;
      offer.applyTo = applyTo || offer.applyTo;
      offer.startDate = new Date(currentDate);
      offer.endDate = endDate;
      offer.updatedAt = new Date();

      const renewedOffer = await offerRepository.save(offer, { reload: true });

      if (!renewedOffer.id) {
        throw new Error("Failed to renew offer");
      }

      try {
        await BrandOfferController.socketService.notifyUsersOfNewOffer(
          offer.brand.id,
          renewedOffer.id
        );
      } catch (error) {
        console.error("Failed to send notifications:", error);
      }

      const offerWithBrand = await offerRepository.findOne({
        where: { id: renewedOffer.id },
        relations: ["brand"],
      });

      return res
        .status(MESSAGES.SUCCESS._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            offerWithBrand,
            "Offer renewed successfully"
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

  static async deleteOfferById(req: Request, res: Response) {
    const offerId = req.params.offerId;

    try {
      const offerRepository = getRepository(Offer);
      const offer = await offerRepository.findOne({ where: { id: offerId } });

      if (!offer) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "Offer not found."
          ),
        });
      }

      await offerRepository.remove(offer);

      return res
        .status(MESSAGES.SUCCESS._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            null,
            "Offer deleted successfully"
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

const validateOfferType = (offerType: string) => {
  const validPredefinedValues = [
    "% Discount",
    "$ Discount",
    "Free Shipping",
    "Cash Back",
    "Sale Price",
    "Buy X Get Y Free",
  ];

  if (validPredefinedValues.includes(offerType)) {
    return true;
  }

  const discountPattern =
    /^(Cash Back|Sale Price|% Discount|\$ Discount)( \d+)?$/;
  if (discountPattern.test(offerType)) {
    return true;
  }

  const buyGetPattern = /^Buy \d+ Get \d+ Free$/;
  if (buyGetPattern.test(offerType)) {
    return true;
  }

  return false;
};
