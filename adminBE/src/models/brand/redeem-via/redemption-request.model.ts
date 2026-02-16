import { User } from "../../../models/member/auth/user.models";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Offer } from "../offers/offer.models";

@Entity({ name: "redemption_request" })
export class RedemptionRequest {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, (user) => user.redemptionRequest, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user!: User;
  

  @ManyToOne(() => Offer, (offer) => offer.redemptionRequest)
  @JoinColumn({ name: "offerId" })
  offer!: Offer;

  @Column({
    type: "enum",
    enum: ["cash", "coin"],
    default: "cash",
  })
  paymentMethod!: string;

  @Column({
    type: "enum",
    enum: ["PENDING", "APPROVED", "REJECTED"],
    default: "PENDING",
  })
  status!: string;

  @Column({ default: 0 })
  points!: number;

  @Column({
    default: 0,
    nullable: true,
    type: "decimal",
    scale: 2,
    precision: 10,
  })
  coins!: number;

  @Column({ default: false })
  approved!: boolean;

  @Column({ default: false })
  isClaimed!: boolean;

  @Column({ nullable: true })
  approvalDate!: Date;
  
  @Column({ nullable: true })
  rejected!: boolean;

  @Column({ nullable: true, type: "text" })
  rejectionReason!: string | null;

  @Column({ nullable: true })
  promoCodeUsed!: string;

  @Column({ nullable: true })
  redeemedDate!: Date;

  @Column({ default: false })
  isExpired!: boolean;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;

  isApproved(): boolean {
    return this.status === "APPROVED";
  }

  isPending(): boolean {
    return this.status === "PENDING";
  }

  isRejected(): boolean {
    return this.status === "REJECTED";
  }

  approve(approvalDate: Date = new Date()): void {
    this.status = "APPROVED";
    this.approved = true;
    this.rejected = false;
    this.approvalDate = approvalDate;
    this.rejectionReason = null;
  }

  reject(reason: string): void {
    this.status = "REJECTED";
    this.rejected = true;
    this.approved = false;
    this.rejectionReason = reason;
  }

  markAsExpired(): void {
    this.isExpired = true;
    if (this.status === "PENDING") {
      this.status = "REJECTED";
      this.rejected = true;
      this.rejectionReason = "Offer expired";
    }
  }

  markAsRedeemed(): void {
    if (this.status === "APPROVED") {
      this.redeemedDate = new Date();
    }
  }
}
