import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";
import { User } from "../auth/user.models";

@Entity({ name: "fcm_token" })
@Index("idx_user_device", ["userId", "deviceId"]) // Index for faster lookups
@Unique("unique_user_device", ["userId", "deviceId"]) // Prevent duplicate device registrations
export class FcmToken {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @Column({ type: "text" })
  token: string;

  @Column({ nullable: true })
  deviceId: string;

  @Column({ nullable: true })
  deviceType: string; // 'ios', 'android', 'web'

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.fcmTokens, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;
}
