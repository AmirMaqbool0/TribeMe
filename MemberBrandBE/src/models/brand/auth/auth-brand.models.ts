import { Offer } from "../offers/offer.models";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Session } from "../../../models/member/auth/user-sessions.models";
import { UserInterest } from "../../../models/member/user-interests/user-interests.model";
import { SelectedBrand } from "../../../models/member/selected-brands/selected-brands.models";
import { UserBrandInteraction } from "../../../models/member/brand-interaction/user-brand-interaction.models";

@Entity({ name: "auth_brand" })
export class Brand {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column({ type: "boolean", default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  password: string;

  @Column()
  category: string;

  @Column({ nullable: true })
  subCategory: string;

  @Column()
  businessName: string;

  @Column({ nullable: true })
  website: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  zipCode: string;

  @Column({ nullable: true })
  brandDescription: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Offer, (offer) => offer.brand, { cascade: true })
  @JoinColumn({ name: "offerId" })
  offers: Offer[];

  @OneToMany(() => BrandImage, (image) => image.brand, {
    cascade: true,
    onDelete: "CASCADE",
  })
  images: BrandImage[];

  @OneToMany(() => BrandVideo, (video) => video.brand, {
    cascade: true,
    onDelete: "CASCADE",
  })
  videos: BrandVideo[];

  @ManyToMany(() => UserInterest, (interest) => interest.brands)
  @JoinTable({ name: "brand_interests" })
  interests: UserInterest[];

  @OneToMany(() => SelectedBrand, (selectedBrand) => selectedBrand.brand)
  selectedBrands: SelectedBrand[];

  @OneToMany(() => UserBrandInteraction, (interaction) => interaction.brand)
  interactions: UserBrandInteraction[];

}

@Entity({ name: "brand_image" })
export class BrandImage {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  originalName: string;

  @Column()
  url: string;

  @Column()
  size: number;

  @ManyToOne(() => Brand, (brand) => brand.images)
  brand: Brand;
}

@Entity({ name: "brand_video" })
export class BrandVideo {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  originalName: string;

  @Column()
  url: string;

  @Column()
  size: number;

  @Column({ length: 50, nullable: true })
  mimeType: string;

  @Column({ nullable: true })
  duration: string;

  @ManyToOne(() => Brand, (brand) => brand.videos, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "brandId" })
  brand: Brand;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
