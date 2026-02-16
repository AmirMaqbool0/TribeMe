import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm";
import { User } from "../auth/user.models";
import { Brand } from "../../../models/brand/auth/auth-brand.models";
import { Offer } from "../../../models/brand/offers/offer.models";

export enum InteractionType {
  LIKE = "like",
  DISLIKE = "dislike",
  UNLIKE = "unlike",
}

@Entity()
export class UserBrandInteraction {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, (user) => user.interactions)
  user!: User;

  @ManyToOne(() => Brand, (brand) => brand.interactions)
  brand!: Brand;

  @ManyToOne(() => Offer, (offer) => offer.interactions)
  offer!: Offer;

  @Column({
    type: "enum",
    enum: InteractionType,
    default: InteractionType.LIKE,
  })
  interaction!: InteractionType;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;
}
