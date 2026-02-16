import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { User } from "./user.models";

export enum VerificationType {
  AccountCreation = "AccountCreation",
  PasswordReset = "PasswordReset",
  PhoneNumberVerification = "PhoneNumberVerification"
}

@Entity({ name: "user_verification" })
export class UsersVerification {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: VerificationType,
  })
  verificationType: VerificationType;

  @Column({ nullable: true })
  resetToken: string;

  @Column({ nullable: true })
  otp: string;

  @Column({ type: "timestamp", nullable: true })
  otpExpiration: Date;

  @Column({ type: "boolean", default: false })
  isUsed: boolean;

  @CreateDateColumn()
  requestedAt: Date;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ type: "timestamp", nullable: true })
  lastSentAt: Date;

  @Column({ type: "int", nullable: true })
  resendInterval: number;

  @ManyToOne(() => User, (user) => user.verifications, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ nullable: false })
  userId: string;
}
