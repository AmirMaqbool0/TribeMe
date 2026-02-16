import express from "express";
import { authMemberRouter } from "./member/auth.routes";
import { paymentRouter } from "./member/payment.routes";
import { brandRouter } from "./brand/brand.routes";
import { userInterests } from "./member/user-interests.routes";
import { dealMatch } from "./member/deal-match.routes";
import { brandOfferRouter } from "./brand/offer.routes";
import { memberOfferRouter } from "./member/offer.routes";
import { termsAndConditionRouter } from "./member/terms-agreed.routes";
import { searchRouter } from "./member/search.routes";
import { memberDashboardRouter } from "./member/dashboard.routes";
import { profileRouter } from "./member/profile.routes";
import { userRouter } from "./member/user.routes";
import { rewardsRouter } from "./member/rewards.routes";
import { authBrandRouter } from "./brand/auth.routes";
import { dashboardRouter } from "./brand/dashboard.routes";
import { subscriptionRouter } from "./brand/subscription.routes";
import notificationRouter from "./member/notification.routes";

const router = express.Router();
const apiPrefix = "/api/v1";

//member
router.use(`${apiPrefix}`, authMemberRouter);
router.use(`${apiPrefix}`, userInterests);
router.use(`${apiPrefix}`, dealMatch);
router.use(`${apiPrefix}`, memberOfferRouter);
router.use(`${apiPrefix}`, termsAndConditionRouter);
router.use(`${apiPrefix}`, searchRouter);
router.use(`${apiPrefix}`, memberDashboardRouter);
router.use(`${apiPrefix}`, profileRouter);
router.use(`${apiPrefix}`, paymentRouter);
router.use(`${apiPrefix}`, userRouter);
router.use(`${apiPrefix}`, rewardsRouter);
router.use(`${apiPrefix}/notifications`, notificationRouter);
//brands
router.use(`${apiPrefix}`, authBrandRouter);
router.use(`${apiPrefix}`, brandRouter);
router.use(`${apiPrefix}`, brandOfferRouter);
router.use(`${apiPrefix}`, dashboardRouter);
//admin
router.use(`${apiPrefix}`, subscriptionRouter);

export default router;
