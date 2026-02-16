import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";

@Entity({ name: "subscription_plan" })
export class SubscriptionPlan {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  tier: string;

  @Column({ type: "text" })
  description: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  edited: Date;
} 