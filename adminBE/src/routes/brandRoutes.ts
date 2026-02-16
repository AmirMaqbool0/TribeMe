// import { Router } from "express";
// import {
//   createBrand,
//   getBrands,
//   getBrandById,
//   updateBrand,
//   deleteBrand
// } from "../controllers/brandController";
// import {
//   approveBrand,
//   rejectBrand,
//   deleteApproval
// } from "../controllers/adminBrandApprovalController";


// const router = Router();

// // POST /api/brands - Create a new Brand
// router.post("/", createBrand);

// // GET /api/brands - Retrieve all Brands
// router.get("/", getBrands);

// // GET /api/brands/:id - Retrieve a single Brand by ID
// router.get("/:id", getBrandById);

// // PUT /api/brands/:id - Update a Brand by ID
// router.put("/:id", updateBrand);

// // DELETE /api/brands/:id - Delete a Brand by ID
// router.delete("/:id", deleteBrand);

// // POST /api/brands/:id/approve - Approve a Brand
// router.post("/:id/approve", approveBrand);

// // POST /api/brands/:id/reject - Reject a Brand (Updates only the Brand table)
// router.post("/:id/reject", rejectBrand);

// // DELETE /api/approvals/:id - Delete an Approval by ID and set the status to rejected
// router.delete("/approvals/:id", deleteApproval);

// export default router;

// routes.ts
import { Router } from "express";
import {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
  getApprovedBrands
} from "../controllers/brandController";
import {
  approveBrand,
  rejectBrand,
  getApprovals,
  getApprovalById,
  updateApproval,
  deleteApproval,
} from "../controllers/adminBrandApprovalController";
import { authMiddleware } from "../middlewares/authMiddleware"; // Import the middleware

const router = Router();

router.post("/create", authMiddleware, createBrand);
router.get("/approved-brand", authMiddleware, getApprovedBrands);
router.get("/", authMiddleware, getBrands);
router.get("/:id", authMiddleware, getBrandById);
router.put("/:id", authMiddleware, updateBrand);
router.delete("/:id", authMiddleware, deleteBrand);

router.post("/:id/approve", authMiddleware, approveBrand);
router.post("/:id/reject", authMiddleware, rejectBrand);

router.get("/approvals", authMiddleware, getApprovals);
router.get("/approvals/:id", authMiddleware, getApprovalById);
router.put("/approvals/:id", authMiddleware, updateApproval);
router.delete("/approvals/:id", authMiddleware, deleteApproval);

export default router;