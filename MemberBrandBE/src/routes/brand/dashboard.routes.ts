import express from "express";
// import { memberMiddleware } from "../../middleware/member.middleware";
import { dashboardController } from "../../controllers/brand/dashboard/dashboard.controller";

const Router = express.Router();

// Route to get app statistics (total brands, users, redeemed offers, rewards claimed)
Router.get(
  "/dashboard/statistics/summary", 
//  memberMiddleware, 
  dashboardController.getAppStatistics
);

// Route to get top 5 popular offers with details
Router.get(
  "/dashboard/statistics/top-offers", 
//  memberMiddleware, 
  dashboardController.getTopPopularOffers
);


export { Router as dashboardRouter };