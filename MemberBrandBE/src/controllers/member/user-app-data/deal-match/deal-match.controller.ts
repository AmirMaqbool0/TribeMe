import { Request, Response } from "express";
import { User } from "../../../../models/member/auth/user.models";
import { getRepository, In } from "typeorm";
import { MESSAGES } from "../../../../utils/message-codes";
import ApiError from "../../../../utils/api-error";
import ApiResponse from "../../../../utils/api-response";
import { SelectedBrand } from "../../../../models/member/selected-brands/selected-brands.models";
import { DealMatches } from "../../../../models/member/deal-match/deal-match.models";
import { BrandResponse } from "../../../../utils/response.dto";

export class DealMatch {
  static async getDealMatch(req: Request, res: Response) {
    try {
      const { userId } = (req as any).user;

      const user = await getRepository(User).findOneBy({ id: userId });
      if (!user) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(MESSAGES.NOT_FOUND._CODE, null, "User not found"),
        });
      }

      const selectedBrandRepository = getRepository(SelectedBrand);
      const userSelectedBrands = await selectedBrandRepository.find({
        where: { user: { id: userId } },
        relations: [
          "brand",
          "brand.images",
          "brand.interactions",
          "brand.videos",
        ],
      });

      if (userSelectedBrands.length === 0) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "No selected brands available for this user. First select your user interests."
          ),
        });
      }

      const brandsData: BrandResponse[] = userSelectedBrands.map((brand) => ({
        brandId: brand.brand.id,
        brandName: brand.brand.businessName,
        brandDescription: brand.brand.brandDescription,
        brandVideos:
          Array.isArray(brand.brand.videos) &&
          brand.brand.videos.length > 0
            ? brand.brand.videos.map((video) => ({
                url: video.url || "",                thumbnail: video.url || "",
                title: video.originalName || "",
                uploadDate: video.createdAt || new Date(),
              }))
            : [],
        brandLogo: Array.isArray(brand.brand.images)
          ? brand.brand.images.map((image) => image?.url)
          : ["Image not uploaded by brand"],
        interactions:
          brand.brand.interactions.length > 0
            ? brand.brand.interactions[0].interaction
            : "No interaction",
      }));

      return res
        .status(MESSAGES.SUCCESS._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            brandsData,
            "Dealmatch retrieved successfully."
          )
        );
    } catch (error) {
      console.error("Error in getDealMatch:", error);
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
