import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../auth/user.models";

export enum NotificationType {
  NEW_OFFER = "new_offer",
  OFFER_REDEMPTION = "offer_redemption",
  REDEMPTION_APPROVED = "redemption_approved",
  REDEMPTION_REJECTED = "redemption_rejected",
  WELCOME = "welcome",
  REFERRAL_REWARD = "referral_reward",
  COIN_TO_CASH_CONVERSION = "coin_to_cash_conversion",
  VIDEO_REWARD = "video_reward",
  PASSWORD_RESET = "password_reset",
  WALLET_UPDATE = "wallet_update",
  REWARD_CLAIMED = "reward_claimed",
  SYSTEM_ANNOUNCEMENT = "system_announcement",
  BRAND_UPDATE = "brand_update",
}

export enum NotificationStatus {
  SENT = "sent",
  DELIVERED = "delivered",
  FAILED = "failed",
  READ = "read",
}

@Entity({ name: "notification" })
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @Column({ type: "enum", enum: NotificationType })
  type: NotificationType;

  @Column()
  title: string;

  @Column({ type: "text" })
  body: string;

  @Column({ type: "json", nullable: true })
  data: any; // Additional data payload

  @Column({ type: "enum", enum: NotificationStatus, default: NotificationStatus.SENT })
  status: NotificationStatus;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  fcmMessageId: string; // Firebase message ID for tracking

  @Column({ nullable: true })
  errorMessage: string; // Error message if delivery failed

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  readAt: Date;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;
}
