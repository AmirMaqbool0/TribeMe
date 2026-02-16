import express from "express";
import { AuthController } from "../../controllers/member/auth/auth.controller";
import passport from "passport";
import { validateRequest } from "../../middleware/validation.middleware";
import { UserController } from "../../controllers/member/user/user.controller";
import { memberMiddleware } from "../../middleware/member.middleware";
import { AuthBrandController } from "../../controllers/brand/auth/auth.controller";

const Router = express.Router();
Router.use(validateRequest);

Router.post("/create-user", AuthController.createUser);
Router.post("/verification-type-otp", AuthController.verificationTypeOtp);
Router.post("/request-new-otp", AuthController.requestNewOtp);
Router.post("/member/login", AuthController.login);
Router.post("/forgot-password", AuthController.forgotPassword);
Router.post("/reset-password", AuthController.resetPassword);

//Social Login
Router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
Router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  AuthController.googleCallback
);

Router.get("/auth/apple", passport.authenticate("apple"));
Router.get(
  "/auth/apple/callback",
  passport.authenticate("apple", {
    failureRedirect: "/login",
    // successRedirect: "/",
  }),
  AuthController.appleCallback
);

Router.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);
Router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "/login",
    // successRedirect: "/",
  }),
  AuthController.facebookCallback
);

Router.get("/auth/dashboard", AuthController.successAuth);

//Tested or dummy data only
Router.delete("/user/delete", UserController.deleteUser);
export { Router as authMemberRouter };
