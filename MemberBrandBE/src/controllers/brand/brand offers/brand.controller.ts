import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { MESSAGES } from "../../../utils/message-codes";
import ApiError from "../../../utils/api-error";
import ApiResponse from "../../../utils/api-response";
import {
  Brand,
  BrandImage,
  BrandVideo,
} from "../../../models/brand/auth/auth-brand.models";
import {uploadToS3, uploadToS3Stream } from "../../../services/s3.service";
import sharp from "sharp";
import { parse } from "json2csv";
import { Offer } from "../../../models/brand/offers/offer.models";
import { UserBrandInteraction } from "../../../models/member/brand-interaction/user-brand-interaction.models";
import { PassThrough, Readable } from "stream";

export class BrandController {
  static async getBrands(req: Request, res: Response) {
    const { userId } = req.user as any;
    const id = userId;

    try {
      const brandRepository = getRepository(Brand);
      const brand = await brandRepository.findOne({
        where: { id },
        relations: ["images","videos"],
      });

      if (!brand) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "Brand not found"
          ),
        });
      }

      return res
        .status(MESSAGES.SUCCESS._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            brand,
            "Brand retrieved successfully"
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

  static async updateBrand(req: Request, res: Response) {
    const { brandId } = req.params;

    const {
      city,
      phone,
      address,
      state,
      firstName,
      lastName,
      brandDescription,
    } = req.body;

    try {
      const brandRepository = getRepository(Brand);
      const brand = await brandRepository.findOne({
        where: { id: brandId },
      });

      if (!brand) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "Brand not found"
          ),
        });
      }

      brand.city = city;
      brand.phone = phone;
      brand.address = address;
      brand.state = state;
      brand.firstName = firstName;
      brand.lastName = lastName;
      brand.brandDescription = brandDescription;

      await brandRepository.save(brand);

      return res
        .status(MESSAGES.SUCCESS._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            brand,
            "Brand updated successfully"
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

  static async uploadBrandLogo(req: Request, res: Response) {
    try {
      const { brandId } = req.params;
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
  
      const imageRepository = getRepository(BrandImage);
      const brandRepository = getRepository(Brand);
      const brand = await brandRepository.findOne({
        where: { id: brandId },
        relations: ["images"],
      });
  
      if (!brand) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "Brand not found"
          ),
        });
      }
        await imageRepository.delete({ brand: { id: brandId } });
  
      const imageResponses = [];
      const metadata = await sharp(file.buffer).metadata();
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
        "brandsadmin-upload-brand-brandId",
        brandId
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
  
      const image = new BrandImage();
      image.originalName = file.originalname;
      image.url = cloudUploadUrl;
      image.size = file.size;
      image.brand = brand;
  
      const savedImage = await imageRepository.save(image);
      imageResponses.push(savedImage);
  
      return res
        .status(MESSAGES.CREATED._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            imageResponses,
            "Brand images uploaded successfully"
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

  static async downloadCsvFile(req: Request, res: Response) {
    const { userId } = (req as any).user;

    try {
      const brandRepository = getRepository(Brand);
      const offerRepository = getRepository(Offer);

      const brands = await brandRepository.find({
        where: { id: userId },
        relations: ["images"],
      });
      const offers = await offerRepository.find({
        where: { brand: { id: userId } },
        relations: ["offerImages"],
      });

      if (!brands.length && !offers.length) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "No brands or offers found. Cannot download."
          ),
        });
      }

      const brandCsvFields = [
        "id",
        "firstName",
        "lastName",
        "email",
        "isEmailVerified",
        "category",
        "subCategory",
        "businessName",
        "website",
        "address",
        "phone",
        "city",
        "state",
        "zipCode",
        "brandDescription",
        "createdAt",
        "updatedAt",
        {
          label: "Images",
          value: (row: Brand) =>
            row.images.map((image) => image.url).join(" | "),
        },
      ];

      const brandCsvData = parse(brands, { fields: brandCsvFields });

      const offerCsvFields = [
        "id",
        "offerName",
        "offerDescription",
        "offerTermsCondition",
       
        "inStore",
        "cities",
        "retailPrice",
        "userLimit",
        "offerType",
        "offerCode",
        "applyTo",
        "offerAmount",
        "discountPercentage",
        "startDate",
        "endDate",
        "setTimeUnlimited",
        "offerLimitUses",
        "offerLimitUnlimited",
        "isShareable",
        "createdAt",
        "updatedAt",
        {
          label: "Offer Images",
          value: (row: Offer) =>
            row.offerImages.map((image) => image.url).join(" | "),
        },
      ];

      const offerCsvData = parse(offers, { fields: offerCsvFields });
      const combinedCsvData = `Brands\n${brandCsvData}\n\nOffers\n${offerCsvData}`;

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=brands_and_offers.csv"
      );
      res.setHeader("Content-Type", "text/csv");
      res.status(200).send(combinedCsvData);
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

  static async getTotalLikedOffers(req: Request, res: Response) {
    const { userId } = (req as any).user;
    try {
      const interactionRepository = getRepository(UserBrandInteraction);
      const interactions = await interactionRepository.find({
        where: { brand: { id: userId } },
      });

      if (interactions.length === 0) {
        return res
          .status(MESSAGES.CREATED._CODE)
          .json(
            new ApiResponse(
              MESSAGES.SUCCESS._CODE,
              { totalLikes: 0 },
              "Total likes for the brand retrieved successfully"
            )
          );
      }

      const totalLikes = interactions.map((item) => item.interaction).length;

      if (totalLikes === 0) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(MESSAGES.NOT_FOUND._CODE, null, "No likes found"),
        });
      }

      return res
        .status(MESSAGES.CREATED._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            { totalLikes: totalLikes > 0 ? totalLikes : 0 },
            "Total likes for the brand retrieved successfully"
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

  static async uploadBrandVideo(req: Request, res: Response) {
    try {
      const { brandId } = req.params;
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

      const videoRepository = getRepository(BrandVideo);
      const brandRepository = getRepository(Brand);
      const brand = await brandRepository.findOne({ where: { id: brandId } });

      if (!brand) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "Brand not found"
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
          "brandsadmin-upload-brand-video",
          `${brandId}-${Date.now()}`,
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

        const video = new BrandVideo();
        video.originalName = file.originalname;
        video.url = cloudUploadUrl;
        video.size = file.size;
        video.mimeType = file.mimetype;
        video.brand = brand;

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
            "Brand video uploaded successfully"
          )
        );
    } catch (error) {
      console.error("video upload error: ", error);
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
