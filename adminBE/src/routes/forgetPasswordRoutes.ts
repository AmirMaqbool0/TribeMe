// import { Router } from "express";
// import {
//   requestPasswordReset,
//   getPasswordResetRequests,
//   validatePasswordReset,
//   deletePasswordResetRequest
// } from "../controllers/forgetPasswordController";

// const router = Router();

// // Route to create a new password reset request
// router.post("/forgot-password", requestPasswordReset);

// // Route to get all password reset requests
// router.get("/forgot-password", getPasswordResetRequests);

// // // Route to validate a specific password reset request by ID
// // router.get("/forgot-password/:id", validatePasswordReset);

// // // Route to delete a password reset request by ID
// // router.delete("/forgot-password/:id", deletePasswordResetRequest);

// export default router;
import { Router } from 'express';
import { initiatePasswordReset, verifyOTPAndResetPassword } from '../controllers/forgetPasswordController';

const router = Router();

router.post('/initiate', initiatePasswordReset);
router.post('/verify', verifyOTPAndResetPassword);

export default router;