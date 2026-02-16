import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { User } from "../auth/user.models";
import { Offer } from "../../../models/brand/offers/offer.models";

@Entity({ name: "saved_offers" })
export class SavedOffer {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.savedOffers, { onDelete: "CASCADE" })
  user: User;

  @ManyToOne(() => Offer, (offer) => offer.savedOffers, { onDelete: "CASCADE" })
  offer: Offer;

  @CreateDateColumn()
  createdAt: Date;
}
