import express from "express";
import { memberMiddleware } from "../../middleware/member.middleware";
import { MemberOfferController } from "../../controllers/member/user-app-data/offers/offer.controllers";

const Router = express.Router();

Router.get(
  "/member/offers/:brandId",
  memberMiddleware,
  MemberOfferController.getBrandOffers
);
Router.get(
  "/member/offers/details/:brandId",
  memberMiddleware,
  MemberOfferController.getBrandOffersDetails
);

Router.post(
  "/redemption/redeem-offer",
  memberMiddleware,
  MemberOfferController.submitRedemptionRequest
);
Router.get(
  "/redemptions",
  memberMiddleware,
  MemberOfferController.getUserRedemptions
);

Router.get(
  "/invitation-url/share",
  memberMiddleware,
  MemberOfferController.shareInviteURL
);

// Router.get(
//   "/redeem-offer-promo/:redeemId",
//   memberMiddleware,
//   MemberOfferController.redeemedOfferPromoCode
// );
// Router.get(
//   "/user/total-redeemed-points",
//   memberMiddleware,
//   MemberOfferController.getTotalRedeemedPoints
// );

export { Router as memberOfferRouter };
