import { Request, Response } from "express";
import { User } from "../../../../models/member/auth/user.models";
import { getRepository, In } from "typeorm";
import { MESSAGES } from "../../../../utils/message-codes";
import ApiError from "../../../../utils/api-error";
import ApiResponse from "../../../../utils/api-response";
import { Brand } from "../../../../models/brand/auth/auth-brand.models";
import { SelectedBrand } from "../../../../models/member/selected-brands/selected-brands.models";
import { Session } from "../../../../models/member/auth/user-sessions.models";

export class UserInterests {
  static async getUserInterests(_: Request, res: Response) {
    try {
      const interests = [
        "Dining",
        "Personal Care",
        "Travel",
        "Retail",
        "Personal Services",
        "Financial Services",
        "Food & Beverage",
        "Food Truck",
        "Home Services",
        "Health & Wellness",
        "Packaged Goods",
        "Entertainment",
        "Automotive",
        "Pet",
        "Home Goods",
        "Professional Services",
        "Bar",
        "Parental Services",
      ];

      return res
        .status(MESSAGES.CREATED._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            interests,
            "User interests retrieved successfully"
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

  static async selectUserInterests(req: Request, res: Response) {
    try {
      const selectedInterests: string[] = req.body.selectedInterests;
      const { userId } = (req as any).user;

      const user = await getRepository(User).findOneBy({ id: userId });
      if (!user) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(MESSAGES.NOT_FOUND._CODE, null, "User not found"),
        });
      }

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

      const brands = await getRepository(Brand).find({
        where: { category: In(selectedInterests) },
      });

      if (brands.length === 0) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "No brands found for selected interests"
          ),
        });
      }

      const userSelectedBrandsRepository = getRepository(SelectedBrand);
      const existingSelections = await userSelectedBrandsRepository.find({
        where: { user: { id: userId } },
        relations: ["brand"],
      });

      const existingCategories = new Set(
        existingSelections.map((selection) => selection.brand.category)
      );

      const newBrands = brands.filter(
        (brand) => !existingCategories.has(brand.category)
      );

      if (newBrands.length === 0) {
        return res.status(409).json({
          error: new ApiError(
            MESSAGES.CONFLICT._CODE,
            null,
            "User interest already exists"
          ),
        });
      }

      const newSelections = newBrands.map((brand) => {
        const userSelectedBrand = new SelectedBrand();
        userSelectedBrand.user = user;
        userSelectedBrand.brand = brand;
        userSelectedBrand.category = brand.category;
        userSelectedBrand.createdAt = new Date();
        return userSelectedBrand;
      });

      await userSelectedBrandsRepository.save(newSelections);

      return res
        .status(MESSAGES.SUCCESS._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            null,
            "User interest has been selected successfully"
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

  static async updateUserSelectedInterestsBrands(req: Request, res: Response) {
    try {
      const selectedInterests: string[] = req.body.selectedInterests;
      const { userId } = (req as any).user;

      const user = await getRepository(User).findOneBy({ id: userId });
      if (!user) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(MESSAGES.NOT_FOUND._CODE, null, "User not found"),
        });
      }

      const userSelectedBrandsRepository = getRepository(SelectedBrand);
      const brandRepository = getRepository(Brand);

      const existingSelections = await userSelectedBrandsRepository.find({
        where: { user: { id: userId } },
        relations: ["brand"],
      });

      const brands = await brandRepository.find({
        where: { category: In(selectedInterests) },
      });

      if (brands.length === 0) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "No brands found for selected interests"
          ),
        });
      }

      const existingBrandIds = existingSelections.map(
        (selection) => selection.brand.id
      );
      const newBrands = brands.filter(
        (brand) => !existingBrandIds.includes(brand.id)
      );

      if (newBrands.length === 0) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            "All selected brands are already associated with your profile"
          ),
        });
      }

      const newSelections = newBrands.map((brand) => {
        const userSelectedBrand = new SelectedBrand();
        userSelectedBrand.user = user;
        userSelectedBrand.brand = brand;
        userSelectedBrand.category = brand.category;
        userSelectedBrand.createdAt = new Date();
        return userSelectedBrand;
      });

      await userSelectedBrandsRepository.save(newSelections);

      return res
        .status(MESSAGES.SUCCESS._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            newBrands,
            "New interests added successfully"
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

  static async deleteUserSelectedBrand(req: Request, res: Response) {
    try {
      const { interests } = req.params;
      const { userId } = (req as any).user;

      const userSelectedBrandsRepository = getRepository(SelectedBrand);
      const brandRepository = getRepository(Brand);

      const brandsInCategory = await brandRepository.find({
        where: { category: interests },
      });

      if (brandsInCategory.length === 0) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "No brands found for the specified interests"
          ),
        });
      }

      const brandIds = brandsInCategory.map((brand) => brand.id);
      const deleteResult = await userSelectedBrandsRepository.delete({
        user: { id: userId },
        brand: { id: In(brandIds) },
      });

      if (deleteResult.affected === 0) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "No interests found in user's selection"
          ),
        });
      }

      return res
        .status(MESSAGES.SUCCESS._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            null,
            `All brands in ${interests} category removed successfully`
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

  static async getUserSelectedInterests(req: Request, res: Response) {
    try {
      const { userId } = (req as any).user;

      const user = await getRepository(User).findOneBy({ id: userId });
      if (!user) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(MESSAGES.NOT_FOUND._CODE, null, "User not found"),
        });
      }

      const userSelectedBrands = await getRepository(SelectedBrand).find({
        where: { user: { id: userId } },
        relations: ["brand"],
      });

      if (userSelectedBrands.length === 0) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "No selected interests found for the user"
          ),
        });
      }

      const selectedCategories = Array.from(
        new Set(userSelectedBrands.map((selection) => selection.brand.category))
      );

      return res
        .status(MESSAGES.SUCCESS._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            selectedCategories,
            "Selected interests retrieved successfully"
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
