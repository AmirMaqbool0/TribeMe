import express from "express";
import { UserController } from "../../controllers/member/user/user.controller";
import { validateRequest } from "../../middleware/validation.middleware";
import { memberMiddleware } from "../../middleware/member.middleware";
import { multerErrorHandler, profileUpload } from "../../middleware/multer.middleware";

const Router = express.Router();
Router.use(validateRequest);

Router.post(
  "/user/request-phone-verification",
  memberMiddleware,
  UserController.requestPhoneNumberVerification
);
Router.post(
  "/user/verify-phone-otp",
  memberMiddleware,
  UserController.verifyPhoneNumberOtp
);
Router.post(
  "/user/set-new-password",
  memberMiddleware,
  UserController.setNewPassword
);
Router.get("/user", memberMiddleware, UserController.getUser);
Router.put(
  "/user/edit-profile",
  memberMiddleware,
  UserController.updateProfile
);
Router.put(
  "/user/upload-profile-picture",
  profileUpload,multerErrorHandler,
  memberMiddleware,
  UserController.uploadProfilePicture
);
Router.delete("/delete-user/:userId", UserController.deleteUser);

export { Router as userRouter };
