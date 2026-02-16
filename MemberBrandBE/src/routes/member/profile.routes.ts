import express from "express";
import { memberMiddleware } from "../../middleware/member.middleware";
import { ProfileController } from "../../controllers/member/user-app-data/profile/profile.controller";

const Router = express.Router();

Router.get(
  "/profile/brand-interaction",
  memberMiddleware,
  ProfileController.brandInteraction
);
Router.get(
  "/profile/redeemed-offers",
  memberMiddleware,
  ProfileController.redeemedOffers
);
Router.post(
  "/profile/save-offer",
  memberMiddleware,
  ProfileController.saveOffers
);
Router.get(
  "/profile/saved-offers",
  memberMiddleware,
  ProfileController.getSavedOffers
);

export { Router as profileRouter };
