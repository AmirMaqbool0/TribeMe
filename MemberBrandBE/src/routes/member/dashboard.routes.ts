import express from "express";
import { memberMiddleware } from "../../middleware/member.middleware";
import { MemberDashboard } from "../../controllers/member/user-app-data/dashboard/dashboard.controller";

const Router = express.Router();

Router.get("/dashboard", memberMiddleware, MemberDashboard.dashboard);
Router.get(
  "/popular-brands",
  memberMiddleware,
  MemberDashboard.getPopularBrands
);
Router.post(
  "/brand/like-dislike",
  memberMiddleware,
  MemberDashboard.likeOrDislikeBrand
);

Router.post(
  "/filter/offer-type",
  memberMiddleware,
  MemberDashboard.filterOfferType
);

Router.get(
  "/sort/latest-deals",
  memberMiddleware,
  MemberDashboard.fetchLatestDeals
);

Router.get("/status-video", memberMiddleware, MemberDashboard.statusVideo);

Router.post(
  "/status-video/track-completion",
  memberMiddleware,
  MemberDashboard.trackVideoCompletion
);

Router.get(
  "/wallet",
  memberMiddleware,
  MemberDashboard.getUserWalletCoins
);

export { Router as memberDashboardRouter };
