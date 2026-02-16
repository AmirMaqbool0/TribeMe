import express from "express";
import { memberMiddleware } from "../../middleware/member.middleware";
import { RewardsController } from "../../controllers/member/user-app-data/rewards/rewards.controller";

const Router = express.Router();

Router.get("/rewards", memberMiddleware, RewardsController.getRewards);

Router.post(
  "/claim-rewards/:redemptionRequestId",
  memberMiddleware,
  RewardsController.claimRewards
);

Router.post("/rewards/convert-coins", RewardsController.convertCoinsToCash);


export { Router as rewardsRouter };
