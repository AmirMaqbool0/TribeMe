import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from "typeorm";
import { User } from "./user.models";

@Entity({ name: "user_auth_provider" })
export class UserAuthProvider {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ nullable: true })
  googleId!: string;

  @Column({ nullable: true })
  facebookId!: string;

  @Column({ nullable: true })
  appleId!: string;

  @OneToOne(() => User, (user) => user.authProvider)
  user!: User;
}
