import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToMany,
} from "typeorm";
import { User } from "../auth/user.models";
import { Brand } from "../../../models/brand/auth/auth-brand.models";

@Entity({ name: "user_interests" })
export class UserInterest {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ nullable: true })
  interestName!: string;

  @ManyToOne(() => User, (user) => user.interests)
  @JoinColumn({ name: "userId" })
  user!: User;

  @ManyToMany(() => Brand, (brand) => brand.interests)
  brands!: Brand[];

  @CreateDateColumn()
  selectedAt!: Date;
}
