import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Admin } from "./Admin";
import { Brand } from "./Brand";

@Entity()
export class AdminBrandApproval {
  @PrimaryGeneratedColumn()
  approval_id!: number;

  @ManyToOne(() => Admin)
  admin!: Admin;

  @ManyToOne(() => Brand)
  brand!: Brand;

  @Column({ type: "enum", enum: ["approved", "rejected"] })
  status!: string;

  @Column({ type: "timestamp" })
  decision_date!: Date;
}
