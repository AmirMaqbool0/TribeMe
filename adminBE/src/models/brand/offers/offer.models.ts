import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  ManyToMany,
} from "typeorm";
import { Brand } from "../auth/auth-brand.models";
import { RedeemedOffer } from "../../../models/member/redeemed-offers/redeemed-offers.models";
import { SavedOffer } from "../../../models/member/saved-offers/saved-offers.models";
import { RedemptionRequest } from "../redeem-via/redemption-request.model";
import { UserBrandInteraction } from "../../../models/member/brand-interaction/user-brand-interaction.models";

@Entity({ name: "offer" })
export class Offer {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  offerName!: string;

  @Column()
  offerDescription!: string;

  @Column()
  offerTermsCondition!: string;

  @Column("bool", { default: false, nullable: true })
  eCommerce!: boolean;

  @Column("bool", { default: false, nullable: true })
  online!: boolean;

  @Column("bool", { default: false })
  inStore!: boolean;

  @Column()
  cities!: string;

  @Column()
  retailPrice!: string;

  @Column({ nullable: true })
  userLimit!: number;

  @Column()
  offerType!: string;

  @Column({ type: "jsonb", nullable: true })
  offerCode!: string | string[];

  @Column({ nullable: true })
  offerSerial!: string;

  @Column({ type: "jsonb", nullable: true })
  offerCodeStatus!: { code: string; used: boolean }[];

  @Column()
  applyTo!: string;

  @Column()
  offerAmount!: string;

  @Column()
  discountPercentage!: string;

  @Column("timestamp")
  startDate!: Date;

  @Column("timestamp", { nullable: true })
  endDate!: Date;

  @Column("bool", { nullable: true })
  setTimeUnlimited!: Date;

  @Column({ nullable: true })
  offerLimitUses!: string;

  @Column("bool")
  offerLimitUnlimited!: boolean;

  @Column({ nullable: true })
  isShareable!: string;

  @Column("timestamp")
  createdAt!: Date;

  @Column("timestamp")
  updatedAt!: Date;

  @ManyToOne(() => Brand, (brands) => brands.offers)
  @JoinColumn({ name: "brandId" })
  brand!: Brand;

  @OneToMany(() => OfferImage, (offerImage) => offerImage.offer, {
    cascade: true,
    orphanedRowAction: "delete",
    onDelete: "CASCADE",
  })
  offerImages!: OfferImage[];

  @OneToMany(() => RedeemedOffer, (redeemedOffer) => redeemedOffer.offer)
  redeemedOffers!: RedeemedOffer[];

  @OneToMany(() => SavedOffer, (savedOffer) => savedOffer.offer, {
    onDelete: "CASCADE",
  })
  savedOffers!: SavedOffer;

  @OneToMany(() => OfferVideo, (offerVideo) => offerVideo.offer, {
    onDelete: "CASCADE",
  })
  videos!: OfferVideo[];

  @OneToMany(
    () => RedemptionRequest,
    (redemptionRequest) => redemptionRequest.offer
  )
  redemptionRequest!: RedemptionRequest[];

  @OneToMany(() => UserBrandInteraction, (interaction) => interaction.offer)
  interactions!: UserBrandInteraction[];
}

@Entity({ name: "offer_image" })
export class OfferImage {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  originalName!: string;

  @Column()
  url!: string;

  @Column()
  size!: number;

  @ManyToOne(() => Offer, (offer) => offer.offerImages, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "offerId" })
  offer!: Offer;
}

@Entity({ name: "offer_video" })
export class OfferVideo {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  originalName!: string;

  @Column()
  url!: string;

  @Column()
  size!: number;

  @Column({ length: 50, nullable: true })
  mimeType!: string;

  @Column({ nullable: true })
  duration!: string;

  @ManyToOne(() => Offer, (offer) => offer.videos, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "offerId" })
  offer!: Offer;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
