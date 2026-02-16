import { IsNotEmpty, IsString } from "class-validator";

export class CreateSubscriptionPlanDto {
  @IsNotEmpty({ message: "Tier is required" })
  @IsString({ message: "Tier must be a string" })
  tier: string;

  @IsNotEmpty({ message: "Description is required" })
  @IsString({ message: "Description must be a string" })
  description: string;
}

export class UpdateSubscriptionPlanDto {
  @IsString({ message: "Tier must be a string" })
  tier?: string;

  @IsString({ message: "Description must be a string" })
  description?: string;
} 