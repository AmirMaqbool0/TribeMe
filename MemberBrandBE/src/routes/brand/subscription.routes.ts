import express from "express";
import {
  createSubscriptionPlan,
  getAllSubscriptionPlans,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
} from "../../controllers/brand/subscription/subscription.controller";
import { brandMiddleware } from "../../../src/middleware/brand.middleware";
const router = express.Router();

router.post(
  "/brand/createSubscriptions",
  brandMiddleware,
  createSubscriptionPlan
);

router.get(
  "/brand/getSubscriptions", 
  brandMiddleware,
  getAllSubscriptionPlans
);

router.put(
  "/brand/updateSubscriptions/:id", 
  brandMiddleware,
  updateSubscriptionPlan
);

router.delete(
  "/brand/deleteSubscriptions/:id", 
  brandMiddleware,
  deleteSubscriptionPlan
);

export const subscriptionRouter = router; 