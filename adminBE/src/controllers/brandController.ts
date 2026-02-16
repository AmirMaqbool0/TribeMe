// brandController.ts
import { Request, Response } from "express";
import { Brand } from "../entities/Brand";
import { AppDataSource } from "../config/db";
import { IsNull } from "typeorm";

const brandRepository = AppDataSource.getRepository(Brand);

export const createBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    // const brand = brandRepository.create(req.body); 
    // const result = await brandRepository.save(brand);
    res.status(201).json({ message: "Register brand using onboarding page" });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}; // previous screen for brand signups // not being used anymore 


export const getBrands = async (_req: Request, res: Response): Promise<void> => {
  try {
    const brands = await brandRepository.find({
      where: {
        deleted_at: IsNull()
      }
    });
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getApprovedBrands = async (_req: Request, res: Response): Promise<void> => {
  try {
    const brands = await brandRepository.find({
      where: {
        deleted_at: IsNull(),
        status : 'approved'
      }
    });
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getBrandById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id)
    const brand = await brandRepository.findOne({
      where: {
        brand_id: id,
        deleted_at: IsNull()
      }
    });
    if (!brand) {
      res.status(404).json({ error: "Brand not found" });
      return;
    }
    res.json(brand);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id)
    const brand = await brandRepository.findOne({
      where: {
        brand_id: id,
        deleted_at: IsNull()
      }
    });
    if (!brand) {
      res.status(404).json({ error: "Brand not found" });
      return;
    }

    brandRepository.merge(brand, req.body);
    const result = await brandRepository.save(brand);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10); // Parse with radix 10 to avoid potential NaN issues
    const result = await brandRepository.update(
      { brand_id: id ,
        deleted_at: IsNull()
      },
      { deleted_at: new Date() }  // Use new Date() instead of Date.now()
    );
    if (result.affected === 0) {
      res.status(404).json({ error: "Brand not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
