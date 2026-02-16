// // import { Request, Response } from "express";
// // import { AdminBrandApproval } from "../entities/AdminBrandApproval";
// // import { AppDataSource } from "../config/db";

// // const approvalRepository = AppDataSource.getRepository(AdminBrandApproval);

// // // Create a new Approval
// // export const approveBrand = async (req: Request, res: Response) => {
// //   try {
// //     const approval = approvalRepository.create(req.body);
// //     const result = await approvalRepository.save(approval);
// //     res.status(201).json(result);
// //   } catch (error) {
// //     res.status(500).json({ error: (error as Error).message });
// //   }
// // };

// // // Retrieve all Approvals
// // export const getApprovals = async (_req: Request, res: Response) => {
// //   try {
// //     const approvals = await approvalRepository.find();
// //     res.json(approvals);
// //   } catch (error) {
// //     res.status(500).json({ error: (error as Error).message });
// //   }
// // };

// // // Retrieve an Approval by ID
// // export const getApprovalById = async (req: Request, res: Response) => {
// //   try {
// //     const approval = await approvalRepository.findOneBy({ approval_id: +req.params.id });
// //     if (!approval) return res.status(404).json({ error: "Approval not found" });
// //     res.json(approval);
// //   } catch (error) {
// //     res.status(500).json({ error: (error as Error).message });
// //   }
// // };

// // // Update an Approval by ID
// // export const updateApproval = async (req: Request, res: Response) => {
// //   try {
// //     const approval = await approvalRepository.findOneBy({ approval_id: +req.params.id });
// //     if (!approval) return res.status(404).json({ error: "Approval not found" });

// //     approvalRepository.merge(approval, req.body);
// //     const result = await approvalRepository.save(approval);
// //     res.json(result);
// //   } catch (error) {
// //     res.status(500).json({ error: (error as Error).message });
// //   }
// // };

// // // Delete an Approval by ID
// // export const deleteApproval = async (req: Request, res: Response) => {
// //   try {
// //     const result = await approvalRepository.delete(req.params.id);
// //     if (result.affected === 0) return res.status(404).json({ error: "Approval not found" });
// //     res.status(204).send();
// //   } catch (error) {
// //     res.status(500).json({ error: (error as Error).message });
// //   }
// // };

// import { Request, Response } from "express";
// import { AdminBrandApproval } from "../entities/AdminBrandApproval";
// import { Brand } from "../entities/Brand";
// import { Admin } from "../entities/Admin";
// import { AppDataSource } from "../config/db";

// const approvalRepository = AppDataSource.getRepository(AdminBrandApproval);
// const brandRepository = AppDataSource.getRepository(Brand);
// const adminRepository = AppDataSource.getRepository(Admin);

// // Approve a Brand
// export const approveBrand = async (req: Request, res: Response) => {
//   try {
//     const { brand_id, admin_id, status } = req.body;

//     if (!brand_id || !admin_id || !status) {
//       return res.status(400).json({ error: "brand_id, admin_id, and status are required" });
//     }

//     const brand = await brandRepository.findOneBy({ brand_id });
//     if (!brand) return res.status(404).json({ error: "Brand not found" });

//     const admin = await adminRepository.findOneBy({ admin_id });
//     if (!admin) return res.status(404).json({ error: "Admin not found" });

//     brand.status = status;
//     brand.approved_at = status === "approved" ? new Date() : null;
//     await brandRepository.save(brand);

//     const approval = new AdminBrandApproval();
//     approval.admin = admin;
//     approval.brand = brand;
//     approval.status = status;
//     approval.decision_date = new Date();

//     const result = await approvalRepository.save(approval);

//     res.status(201).json({ brand, approval: result });
//   } catch (error) {
//     res.status(500).json({ error: (error as Error).message });
//   }
// };

// // Reject a Brand (Updates only the Brand table)
// export const rejectBrand = async (req: Request, res: Response) => {
//   try {
//     const { brand_id } = req.params;

//     const brand = await brandRepository.findOneBy({ brand_id: +brand_id });
//     if (!brand) return res.status(404).json({ error: "Brand not found" });

//     brand.status = "rejected";
//     brand.approved_at = null;
//     await brandRepository.save(brand);

//     res.json({ message: "Brand rejected successfully", brand });
//   } catch (error) {
//     res.status(500).json({ error: (error as Error).message });
//   }
// };

// // Retrieve all Approvals
// export const getApprovals = async (_req: Request, res: Response) => {
//   try {
//     const approvals = await approvalRepository.find({ relations: ["admin", "brand"] });
//     res.json(approvals);
//   } catch (error) {
//     res.status(500).json({ error: (error as Error).message });
//   }
// };

// // Retrieve an Approval by ID
// export const getApprovalById = async (req: Request, res: Response) => {
//   try {
//     const approval = await approvalRepository.findOne({
//       where: { approval_id: +req.params.id },
//       relations: ["admin", "brand"],
//     });
//     if (!approval) return res.status(404).json({ error: "Approval not found" });
//     res.json(approval);
//   } catch (error) {
//     res.status(500).json({ error: (error as Error).message });
//   }
// };

// // Update an Approval by ID
// export const updateApproval = async (req: Request, res: Response) => {
//   try {
//     const approval = await approvalRepository.findOneBy({ approval_id: +req.params.id });
//     if (!approval) return res.status(404).json({ error: "Approval not found" });

//     approvalRepository.merge(approval, req.body);
//     const result = await approvalRepository.save(approval);
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ error: (error as Error).message });
//   }
// };

// // Delete an Approval by ID and Reject Brand
// export const deleteApproval = async (req: Request, res: Response) => {
//   try {
//     const approval = await approvalRepository.findOne({
//       where: { approval_id: +req.params.id },
//       relations: ["brand"],
//     });
//     if (!approval) return res.status(404).json({ error: "Approval not found" });

//     const brand = approval.brand;
//     if (brand) {
//       brand.status = "rejected";
//       brand.approved_at = null;
//       await brandRepository.save(brand);
//     }

//     await approvalRepository.remove(approval);
//     res.json({ message: "Approval deleted and brand status set to rejected", brand });
//   } catch (error) {
//     res.status(500).json({ error: (error as Error).message });
//   }
// };

// adminBrandApprovalController.ts
import { Request, Response } from "express";
import { AdminBrandApproval } from "../entities/AdminBrandApproval";
import { Brand } from "../entities/Brand";
import { Admin } from "../entities/Admin";
import { AppDataSource } from "../config/db";

const approvalRepository = AppDataSource.getRepository(AdminBrandApproval);
const brandRepository = AppDataSource.getRepository(Brand);
const adminRepository = AppDataSource.getRepository(Admin);

export const approveBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const { brand_id, admin_id, status } = req.body;

    if (!brand_id || !admin_id || !status) {
      res.status(400).json({ error: "brand_id, admin_id, and status are required" });
      return;
    }

    const brand = await brandRepository.findOneBy({ brand_id });
    if (!brand) {
      res.status(404).json({ error: "Brand not found" });
      return;
    }

    const admin = await adminRepository.findOneBy({ admin_id });
    if (!admin) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }

    brand.status = status;
    brand.approved_at = status === "approved" ? new Date() : null;
    await brandRepository.save(brand);

    const approval = new AdminBrandApproval();
    approval.admin = admin;
    approval.brand = brand;
    approval.status = status;
    approval.decision_date = new Date();

    const result = await approvalRepository.save(approval);
    res.status(201).json({ brand, approval: result });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const rejectBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const { brand_id } = req.params;

    const brand = await brandRepository.findOneBy({ brand_id: +brand_id });
    if (!brand) {
      res.status(404).json({ error: "Brand not found" });
      return;
    }

    brand.status = "rejected";
    brand.approved_at = null;
    await brandRepository.save(brand);

    res.json({ message: "Brand rejected successfully", brand });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getApprovals = async (_req: Request, res: Response): Promise<void> => {
  try {
    const approvals = await approvalRepository.find({ relations: ["admin", "brand"] });
    res.json(approvals);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getApprovalById = async (req: Request, res: Response): Promise<void> => {
  try {
    const approval = await approvalRepository.findOne({
      where: { approval_id: +req.params.id },
      relations: ["admin", "brand"],
    });
    if (!approval) {
      res.status(404).json({ error: "Approval not found" });
      return;
    }
    res.json(approval);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateApproval = async (req: Request, res: Response): Promise<void> => {
  try {
    const approval = await approvalRepository.findOneBy({ approval_id: +req.params.id });
    if (!approval) {
      res.status(404).json({ error: "Approval not found" });
      return;
    }

    approvalRepository.merge(approval, req.body);
    const result = await approvalRepository.save(approval);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteApproval = async (req: Request, res: Response): Promise<void> => {
  try {
    const approval = await approvalRepository.findOne({
      where: { approval_id: +req.params.id },
      relations: ["brand"],
    });
    if (!approval) {
      res.status(404).json({ error: "Approval not found" });
      return;
    }

    const brand = approval.brand;
    if (brand) {
      brand.status = "rejected";
      brand.approved_at = null;
      await brandRepository.save(brand);
    }

    await approvalRepository.remove(approval);
    res.json({ message: "Approval deleted and brand status set to rejected", brand });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};