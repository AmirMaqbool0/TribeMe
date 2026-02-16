import express from "express";
import { validateRequest } from "../../middleware/validation.middleware";
import { memberMiddleware } from "../../middleware/member.middleware";
import { UserInterests } from "../../controllers/member/user-app-data/user-interests/user-interests.controllers";

const Router = express.Router();
Router.use(validateRequest);

Router.get("/user-interests", memberMiddleware, UserInterests.getUserInterests);
Router.post(
  "/user-interests/select-interests",
  memberMiddleware,
  UserInterests.selectUserInterests
);
Router.put(
  "/user-interests/update-interests",
  memberMiddleware,
  UserInterests.updateUserSelectedInterestsBrands
);
Router.delete('/user-interests/selected-brands/:interests', memberMiddleware, UserInterests.deleteUserSelectedBrand);
Router.get('/user-interests/selected-interests', memberMiddleware, UserInterests.getUserSelectedInterests);

export { Router as userInterests };
