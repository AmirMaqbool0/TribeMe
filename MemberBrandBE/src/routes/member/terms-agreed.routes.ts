import express from "express";
import { TermsAndCondition } from "../../controllers/member/terms-agreed/terms-agreed.controllers";

const Router = express.Router();

Router.get("/privacy-policy", TermsAndCondition.privacyPolicy);

export { Router as termsAndConditionRouter };
