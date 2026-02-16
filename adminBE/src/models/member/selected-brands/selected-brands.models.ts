import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { User } from "../auth/user.models";
import { Brand } from "../../../models/brand/auth/auth-brand.models";
import { DealMatches} from "../deal-match/deal-match.models";

@Entity({ name: "selected-brands" })
export class SelectedBrand {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, (user) => user.selectedBrands, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @ManyToOne(() => Brand, (brand) => brand.selectedBrands)
  @JoinColumn({ name: "brandId" })
  brand!: Brand;

  @Column()
  category!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => DealMatches, (dealMatch) => dealMatch.selectedBrand)
  dealMatches!: DealMatches;
}
