import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user.models";
import { Brand } from "../../../models/brand/auth/auth-brand.models";

@Entity({ name: "sessions" })
export class Session {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", nullable: false })
  sessionToken!: string;

  @Column({ type: "varchar", nullable: true })
  deviceType!: string;

  @Column({ type: "varchar", nullable: true })
  ipAddress!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: "timestamp", nullable: true })
  lastActivityAt!: Date;

  @Column({ type: "timestamp", nullable: true })
  expiresAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.sessions, {
    onDelete: "CASCADE",
  })
  user!: User;
  

}
