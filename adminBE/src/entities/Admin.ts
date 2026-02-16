import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { ForgotPassword } from "./ForgotPassword";

@Entity()
export class Admin {
  @PrimaryGeneratedColumn()
  admin_id!: number;

  @Column()
  username!: string;

  @Column()
  email!: string;

  @Column()
  password!: string;

  @Column({ type: "varchar", length: 15, nullable: true })
  phone_number?: string;

  @Column({ type: "timestamp", nullable: true })
  login_at?: Date;

  @OneToMany(() => ForgotPassword, (forgotPassword) => forgotPassword.admin)
  forgotPasswordRequests!: ForgotPassword[]; // No initialization needed
}
