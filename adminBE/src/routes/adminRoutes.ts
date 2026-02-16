import { Router, Request, Response, NextFunction } from "express";
import {
  getAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  registerAdmin,
  loginAdmin,
  logoutAdmin,
} from "../controllers/adminController";
import { authMiddleware } from "../middlewares/authMiddleware"; // Import the middleware

const router = Router();

const protectedRoute = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  authMiddleware(req, res, next);
};

// Route to retrieve all admins
router.get("/", getAdmins);

// Route to retrieve a specific admin by ID
router.get("/:id", protectedRoute, getAdminById);

// Route to update an admin by ID
router.put("/:id", protectedRoute, updateAdmin);

// Route to delete an admin by ID
router.delete("/:id", deleteAdmin);

// Route to register a new admin
router.post("/register", registerAdmin);

// Route to login an admin
router.post("/login", loginAdmin);

// Route to logout an admin
router.post("/logout", protectedRoute, logoutAdmin);

export default router;