import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { StripeCustomer } from "../../payment/stripe-customer.models";
import { UserAuthProvider } from "./user-auth-provider.models";
import { PaymentMethod } from "../../payment/payment-method.models";
import { Transaction } from "../../payment/transaction.models";
import { UsersVerification } from "./user-verification";
import { Session } from "./user-sessions.models";
import { UserInterest } from "../user-interests/user-interests.model";
import { SelectedBrand } from "../selected-brands/selected-brands.models";
import { DealMatches } from "../deal-match/deal-match.models";
import { RedeemedOffer } from "../redeemed-offers/redeemed-offers.models";
import { UserBrandInteraction } from "../brand-interaction/user-brand-interaction.models";
import { SavedOffer } from "../saved-offers/saved-offers.models";
import { RedemptionRequest } from "../../brand/redeem-via/redemption-request.model";
import { Wallet } from "../wallet/wallet.models";
import { FcmToken } from "../notification/fcm-token.models";
import { Notification } from "../notification/notification.models";

@Entity({ name: "user" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  fullName: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  password: string;

  @Column({ type: "boolean", default: false })
  termsAgreed: boolean;

  @Column({ type: "boolean", default: false })
  isPhoneVerified: boolean;

  @Column({ type: "boolean", default: false })
  isEmailVerified: boolean;

  @Column({ type: "boolean", default: false })
  isActive: boolean;

  @Column({ type: "varchar", nullable: true })
  rememberToken: string;

  @CreateDateColumn({ nullable: true })
  rememberTokenExpiry: Date;

  @Column({ nullable: true })
  profilePictureUrl: string;

  @Column({ nullable: true })
  referralCode: string;

  @Column({ nullable: true, default: null })
  referrer: string;

  @Column({ default: 0, nullable: true })
  points: number;

  @Column({
    default: 0,
    nullable: true,
    type: "decimal",
    scale: 2,
    precision: 10,
  })
  coins: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => UserAuthProvider, (authProvider) => authProvider.user, {
    cascade: true,
  })
  @JoinColumn({ name: "authProviderId" })
  authProvider: UserAuthProvider;

  @OneToMany(() => UsersVerification, (verification) => verification.user)
  verifications: UsersVerification[];

  @OneToOne(() => StripeCustomer, (customer) => customer.user, {
    cascade: true,
  })
  stripeCustomer: StripeCustomer;

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction;

  @OneToMany(() => PaymentMethod, (payment) => payment.user)
  paymentMethods: PaymentMethod;

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];

  @OneToMany(() => UserInterest, (userInterests) => userInterests.user)
  interests: UserInterest[];

  @OneToMany(() => SelectedBrand, (selectedBrand) => selectedBrand.user)
  selectedBrands: SelectedBrand[];

  @OneToMany(() => DealMatches, (dealMatch) => dealMatch.user)
  dealMatches: DealMatches;

  @OneToMany(() => RedeemedOffer, (redeemedOffer) => redeemedOffer.user)
  redeemedOffers: RedeemedOffer[];

  @OneToMany(() => UserBrandInteraction, (interaction) => interaction.user)
  interactions: UserBrandInteraction;

  @OneToMany(() => SavedOffer, (savedOffer) => savedOffer.user, {
    onDelete: "CASCADE",
  })
  savedOffers: SavedOffer;

  @OneToMany(
    () => RedemptionRequest,
    (redemptionRequest) => redemptionRequest.user
  )
  redemptionRequest: RedemptionRequest;

  @OneToOne(() => Wallet, (wallet) => wallet.user)
  wallet: Wallet;

  @OneToMany(() => FcmToken, (fcmToken) => fcmToken.user, { cascade: true })
  fcmTokens: FcmToken[];

  @OneToMany(() => Notification, (notification) => notification.user, { cascade: true })
  notifications: Notification[];
}
