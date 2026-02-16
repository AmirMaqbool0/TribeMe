import express from "express";
import { validateRequest } from "../../middleware/validation.middleware";
import { validateSession } from "../../middleware/auth.middleware";
import { BrandController } from "../../controllers/brand/brand offers/brand.controller";
import { imageUpload, multerErrorHandler, videoUpload } from "../../middleware/multer.middleware";
import { brandMiddleware } from "../../middleware/brand.middleware";

const Router = express.Router();
Router.use(validateRequest);

Router.get(
  "/brand",
  brandMiddleware,
  BrandController.getBrands
);

Router.put("/brand/:brandId", brandMiddleware, BrandController.updateBrand);
Router.put(
  "/brand/upload-logo/:brandId",
  imageUpload,
  brandMiddleware,multerErrorHandler,
  BrandController.uploadBrandLogo
);

Router.put(
  "/brand/upload-brand-video/:brandId",
  brandMiddleware,
  videoUpload, multerErrorHandler,
  BrandController.uploadBrandVideo
);

Router.get(
  "/brand/download-file",
  brandMiddleware,
  BrandController.downloadCsvFile
);

Router.get(
  "/brand/total-likes",
  brandMiddleware,
  BrandController.getTotalLikedOffers
);

export { Router as brandRouter };
