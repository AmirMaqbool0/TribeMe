import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { User } from "../auth/user.models";
import { SelectedBrand } from "../selected-brands/selected-brands.models";

@Entity({ name: "deal_matches" })
export class DealMatches {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.dealMatches, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @ManyToOne(() => SelectedBrand, (selectedBrand) => selectedBrand.dealMatches, { onDelete: "CASCADE" })
  @JoinColumn({ name: "selectedBrandId" })
  selectedBrand: SelectedBrand;

  @CreateDateColumn()
  matchedAt: Date;
}
