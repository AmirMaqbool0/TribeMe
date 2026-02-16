import express from "express";
import { memberMiddleware } from "../../middleware/member.middleware";
import { SearchController } from "../../controllers/member/search/search.controller";

const Router = express.Router();

Router.get(
  "/search/suggestions",
  memberMiddleware,
  SearchController.searchSuggestions
);
Router.get("/search/results", memberMiddleware, SearchController.searchResults);
Router.get(
  "/search/liked-brands",
  memberMiddleware,
  SearchController.searchLikedBrands
);
Router.get(
  "/search/redeemed-offers",
  memberMiddleware,
  SearchController.searchRedeemedOffers
);
Router.get(
  "/search/saved-offers",
  memberMiddleware,
  SearchController.searchSavedOffers
);

export { Router as searchRouter };
