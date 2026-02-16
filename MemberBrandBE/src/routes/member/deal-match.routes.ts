import express from "express";
import { validateRequest } from "../../middleware/validation.middleware";
import { DealMatch } from "../../controllers/member/user-app-data/deal-match/deal-match.controller";
import { memberMiddleware } from "../../middleware/member.middleware";

const Router = express.Router();
Router.use(validateRequest);

Router.get("/deal-match", memberMiddleware, DealMatch.getDealMatch);

export { Router as dealMatch };
