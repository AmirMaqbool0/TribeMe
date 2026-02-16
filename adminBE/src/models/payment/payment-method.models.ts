import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { StripeCustomer } from "./stripe-customer.models";
import { User } from "../member/auth/user.models";

@Entity({ name: "payment_method" })
export class PaymentMethod {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ nullable: true })
  stripeChargeId!: string;

  @Column({ nullable: true })
  amount!: number;

  @Column({ nullable: true })
  currency!: string;

  @Column({ nullable: true })
  status!: string;

  @Column({ nullable: true })
  stripePaymentMethodId!: string;

  @Column({ nullable: true })
  cardLast4!: string;

  @Column({ nullable: true })
  cardBrand!: string;

  @Column({ nullable: true })
  cardExpMonth!: number;

  @Column({ nullable: true })
  cardExpYear!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => StripeCustomer, (customer) => customer.user)
  stripeCustomer!: StripeCustomer;

  @ManyToOne(() => User, (user) => user.paymentMethods)
  user!: User;
}
