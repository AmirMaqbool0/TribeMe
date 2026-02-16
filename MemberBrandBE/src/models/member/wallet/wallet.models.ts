import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
} from "typeorm";
import { User } from "../auth/user.models";

@Entity({ name: "wallet" })
export class Wallet {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    default: 0,
    nullable: true,
    type: "decimal",
    scale: 2,
    precision: 10,
  })
  coins: number;

  @Column({ default: 0, nullable: true })
  points: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.wallet, { cascade: true ,
    onDelete: "CASCADE",
  })
  @JoinColumn()
  user: User;
}
