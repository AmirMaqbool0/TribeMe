import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { SubscriptionPlan } from "../../../models/brand/subscription/subscription-plan.models";

// Create a new subscription plan
export const createSubscriptionPlan = async (req: Request, res: Response) => {
  try {
    const subscriptionPlanRepository = getRepository(SubscriptionPlan);
    const { tier, description } = req.body;

    if (!tier || !description) {
      return res.status(400).json({
        success: false,
        message: "Tier and description are required",
      });
    }

    const newSubscriptionPlan = subscriptionPlanRepository.create({
      tier,
      description,
    });

    await subscriptionPlanRepository.save(newSubscriptionPlan);

    return res.status(201).json({
      success: true,
      message: "Subscription plan created successfully",
      data: newSubscriptionPlan,
    });
  } catch (error) {
    console.error("Error creating subscription plan:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all subscription plans
export const getAllSubscriptionPlans = async (req: Request, res: Response) => {
  try {
    const subscriptionPlanRepository = getRepository(SubscriptionPlan);
    const subscriptionPlans = await subscriptionPlanRepository.find();

    return res.status(200).json({
      success: true,
      data: subscriptionPlans,
    });
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get subscription plan by ID
export const getSubscriptionPlanById = async (req: Request, res: Response) => {
  try {
    const subscriptionPlanRepository = getRepository(SubscriptionPlan);
    const { id } = req.params;

    const subscriptionPlan = await subscriptionPlanRepository.findOne({ where: { id } });

    if (!subscriptionPlan) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: subscriptionPlan,
    });
  } catch (error) {
    console.error("Error fetching subscription plan:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update subscription plan
export const updateSubscriptionPlan = async (req: Request, res: Response) => {
  try {
    const subscriptionPlanRepository = getRepository(SubscriptionPlan);
    const { id } = req.params;
    const { tier, description } = req.body;

    const subscriptionPlan = await subscriptionPlanRepository.findOne({ where: { id } });

    if (!subscriptionPlan) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found",
      });
    }

    if (tier) subscriptionPlan.tier = tier;
    if (description) subscriptionPlan.description = description;

    await subscriptionPlanRepository.save(subscriptionPlan);

    return res.status(200).json({
      success: true,
      message: "Subscription plan updated successfully",
      data: subscriptionPlan,
    });
  } catch (error) {
    console.error("Error updating subscription plan:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete subscription plan
export const deleteSubscriptionPlan = async (req: Request, res: Response) => {
  try {
    const subscriptionPlanRepository = getRepository(SubscriptionPlan);
    const { id } = req.params;

    const subscriptionPlan = await subscriptionPlanRepository.findOne({ where: { id } });

    if (!subscriptionPlan) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found",
      });
    }

    await subscriptionPlanRepository.remove(subscriptionPlan);

    return res.status(200).json({
      success: true,
      message: "Subscription plan deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting subscription plan:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};