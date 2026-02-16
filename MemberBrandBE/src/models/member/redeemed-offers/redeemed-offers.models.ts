import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "../auth/user.models";
import { Offer } from "../../../models/brand/offers/offer.models";

@Entity({ name: "redeemed_offers" })
export class RedeemedOffer {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.redeemedOffers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
  

  @ManyToOne(() => Offer, (offer) => offer.redeemedOffers)
  offer: Offer;

  @Column({ type: "int", default: 30 })
  points: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0.0 })
  dollarValue: number;

  @Column({ type: "int", default: 0 })
  totalPoints: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0.0 })
  totalDollars: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  redeemedAt: Date;
}
