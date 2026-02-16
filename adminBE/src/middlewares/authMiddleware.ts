// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { Admin } from "../entities/Admin";
import { AppDataSource } from "../config/db";
import * as jwt from "jsonwebtoken";

const adminRepository = AppDataSource.getRepository(Admin);

// Middleware to verify the token
export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // const token = req.session.token; // Retrieve token from session
  if (!req.headers.authorization) {
    res.status(401).json({ error: "Access token missing" });
    return;
  }
  let token;
  const hasBearerPrefix = req.headers.authorization.startsWith('Bearer ');
  if (hasBearerPrefix)
    token = req.headers.authorization.substring(7);
  else
    token = req.headers.authorization

  if (!token || token == null) {
    res.status(401).json({ error: "No token provided" });
    return;
  }
  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    const admin = await adminRepository.findOneBy({
      admin_id: (decoded as any).adminId,
    });
    if (!admin) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }
    req.admin = admin; // Attach the admin object to the request
    next(); // Call the next middleware or route handler
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
