import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
  } from "typeorm";
import { PaymentMethod } from "./payment-method.models";
import { User } from "../member/auth/user.models";
  
  @Entity({ name: "transaction" })
  export class Transaction {
    @PrimaryGeneratedColumn("uuid")
    id!: number;
  
    @Column()
    amount!: number;
  
    @Column()
    currency!: string;
  
    @Column()
    status!: string;
  
    @CreateDateColumn()
    createdAt!: Date;
  
    @UpdateDateColumn()
    updatedAt!: Date;
  
    @ManyToOne(() => User, (user) => user.transactions)
    @JoinColumn({ name: 'userId' })
    user!: User;
  
    @ManyToOne(() => PaymentMethod, (paymentMethod) => paymentMethod.id)
    @JoinColumn({ name: 'paymentMethodId' })
    paymentMethod!: PaymentMethod;
  }
  