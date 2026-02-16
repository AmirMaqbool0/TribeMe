import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../member/auth/user.models";

@Entity({ name: "stripe_customer" })
export class StripeCustomer {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  stripeCustomerId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToOne(() => User, (user) => user.stripeCustomer)
  @JoinColumn()
  user!: User;
}
