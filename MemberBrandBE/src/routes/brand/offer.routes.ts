import express from "express";
import { BrandOfferController } from "../../controllers/brand/brand offers/offer.controllers";
import { brandMiddleware } from "../../middleware/brand.middleware";
import { validateRequest } from "../../middleware/validation.middleware";
import { videoUpload, imageUpload } from "../../middleware/multer.middleware";
import { multerErrorHandler } from "../../middleware/multer.middleware";

const Router = express.Router();
Router.use(validateRequest);

Router.post(
  "/brand/create-offers",
  brandMiddleware,
  BrandOfferController.createOffers
);

Router.put(
  "/brand/upload-offer-image/:offerId",
  brandMiddleware,
  imageUpload,multerErrorHandler,
  BrandOfferController.uploadImage
);

Router.put(
  "/brand/upload-offer-video/:offerId",
  brandMiddleware,
  videoUpload, multerErrorHandler,
  BrandOfferController.uploadVideo
);

Router.get(
  "/brand/promo-codes/:offerId",
  brandMiddleware,
  BrandOfferController.promoCodesByOfferID
);

Router.get(
  "/brand/:brandId/offer-name",
  brandMiddleware,
  BrandOfferController.getOfferNameByBrandID
);

Router.get(
  "/brand/redemptions-request/promo",
  brandMiddleware,
  BrandOfferController.getRedemptionRequests
);

Router.post(
  "/brand/redemptions-request/action/:redemptionId",
  brandMiddleware,
  BrandOfferController.approveRejectRedemptionRequest
);

Router.get(
  "/brand/offers/live",
  brandMiddleware,
  BrandOfferController.getLiveOffers
);

Router.get(
  "/brand/offers/past",
  brandMiddleware,
  BrandOfferController.getPastOffers
);

Router.put(
  "/brand/offers/update/:offerId",
  brandMiddleware,
  BrandOfferController.updateOfferById
);

Router.put(
  "/brand/offers/renew/:offerId",
  brandMiddleware,
  BrandOfferController.renewOfferById
);

Router.delete(
  "/brand/offers/remove/:offerId",
  brandMiddleware,
  BrandOfferController.deleteOfferById
);

export { Router as brandOfferRouter };
