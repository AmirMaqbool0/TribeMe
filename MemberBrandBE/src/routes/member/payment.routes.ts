import express from "express";
import { PaymentController } from "../../controllers/member/user-app-data/payment/payment.controller";
import { memberMiddleware } from "../../middleware/member.middleware";

const Router = express.Router();

Router.post(
  "/member/connect-account",
  memberMiddleware,
  PaymentController.connectAccount
);

Router.post(
  "/member/initiate-withdrawal",
  memberMiddleware,
  PaymentController.initiateWithdrawal
);

Router.get(
  "/member/funds-in-account",
  memberMiddleware,
  PaymentController.fundsInPlatformAccount
);

Router.get(
  "/member/transfer-to-connected",
  memberMiddleware,
  PaymentController.transferFundsToConnectedAccount
);

Router.get("/", PaymentController.paymentIntentConfirm);

export { Router as paymentRouter };
