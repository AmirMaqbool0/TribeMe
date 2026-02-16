import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/db";
import { ForgotPassword } from "../entities/ForgotPassword";
import { Admin } from "../entities/Admin";
import twilio from "twilio";
import * as bcrypt from "bcrypt";
import { sendForgotPasswordOtpEmail } from "../services/otp.service";

const forgotPasswordRepository = AppDataSource.getRepository(ForgotPassword);
const adminRepository = AppDataSource.getRepository(Admin);

const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
);

// Initiate password reset
export const initiatePasswordReset = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { identifier, contact_method }: { identifier: string, contact_method: 'email' | 'phone' } = req.body;
        if(!contact_method || !identifier){
            res.status(422).json({error: "missing body data"})
            return
        }
        const admin: Admin | null = await adminRepository.findOneBy(
            contact_method === 'email'
                ? { email: identifier }
                : { phone_number: identifier }
        );

        if (!admin) {
            res.status(404).json({ error: "Admin not found" });
            return;
        }
        if(contact_method == 'phone'){
            res.status(201).json({message: "sending otp to phone number is not available right now. Please choose email option."})
            return
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

        const resetRequest: ForgotPassword = forgotPasswordRepository.create({
            admin,
            otp,
            contact_method,
            is_verified: false,
            requested_at: new Date(),
            expires_at: expiresAt,
        });

        await forgotPasswordRepository.save(resetRequest);

        if (contact_method === 'email') {
            try {
                const otpSent = await sendForgotPasswordOtpEmail(identifier, otp);
                if (!otpSent) {
                    res.status(500).json({ message: "Failed to send OTP email." });
                    return;
                }
            } catch (error) {
                console.error('Error sending email:', error);
                res.status(500).json({ error: 'Failed to send OTP via email' });
                return;
            }
        } else if (contact_method === 'phone' && admin.phone_number) {
            await twilioClient.messages.create({
                body: `Your OTP for password reset is: ${otp}`,
                from: process.env.TWILIO_PHONE_NUMBER!,
                to: admin.phone_number,
            }).then(result=>{
                res.status(200).json({ message: "OTP sent successfully" });
                return 
   
            });
        } else {
            res.status(400).json({ error: "Invalid or missing phone number" });
            return;
        }

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

// Verify OTP and reset password
// export const verifyOTPAndResetPassword = async (
//     req: Request,
//     res: Response
// ): Promise<void> => {
//     try {
//         const { identifier, otp, newPassword } = req.body;

//         const resetRequest = await forgotPasswordRepository.findOneBy({
//             admin: { email: identifier },
//             otp,
//             is_verified: false,
//         });

//         if (!resetRequest) {
//             res.status(400).json({ error: "Invalid OTP or request" });
//             return;
//         }

//         resetRequest.is_verified = true;
//         await forgotPasswordRepository.save(resetRequest);

//         const admin = resetRequest.admin;
//         admin.password = await bcrypt.hash(newPassword, 10);
//         await adminRepository.save(admin);

//         res.status(200).json({ message: "Password reset successful" });
//     } catch (error) {
//         res.status(500).json({ error: (error as Error).message });
//     }
// };


// UPDATED CODE FOR ABOVE
// _____________________
// Verify OTP and reset password
export const verifyOTPAndResetPassword = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { identifier, otp, newPassword } = req.body;

        // Check if newPassword is provided
        if (!newPassword || newPassword.trim() === '') {
            res.status(400).json({ error: "New password is required" });
            return;
        }

        // Retrieve the forgot password request and include the admin relation
        const resetRequest = await forgotPasswordRepository.findOne({
            where: {
                admin: { email: identifier },
                otp,
                is_verified: false,
            },
            relations: ["admin"], // Include admin relation
        });

        // Check if reset request is valid
        if (!resetRequest) {
            res.status(400).json({ error: "Invalid or Expired OTP " });
            return;
        }

        // Mark the reset request as verified
        resetRequest.is_verified = true;
        await forgotPasswordRepository.save(resetRequest);

        // Check if the admin is retrieved successfully
        const admin = resetRequest.admin;
        if (!admin) {
            res.status(400).json({ error: "Admin not found" });
            return;
        }

        // Hash the new password and update the admin's password
        admin.password = await bcrypt.hash(newPassword, 10);
        await adminRepository.save(admin);

        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};