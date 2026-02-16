import { Router, RequestHandler } from "express";
import { getAppStatistics, getTopPopularOffers } from "../controllers/dashboardController";

const router = Router();
router.get("/statistics", getAppStatistics as RequestHandler);
router.get("/popular-offers", getTopPopularOffers as RequestHandler);

export default router;