import { NextFunction, Request, Response } from "express";
import { authentication } from "./auth.middleware";

export const brandMiddleware = [
  authentication,
  (req: Request, res: Response, next: NextFunction) => {
    const { role } = req.user as any;

    if (role === "brand") {
      console.log("role: ", role);
      return next();
    } else {
      return res.status(403).json({ message: "Access denied. Brands only." });
    }
  },
];
