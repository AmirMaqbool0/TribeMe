import { DataSource } from "typeorm";
import { Admin } from "../entities/Admin";
import { Brand as EntityBrand } from "../entities/Brand";
import { AdminBrandApproval } from "../entities/AdminBrandApproval";
import { ForgotPassword } from "../entities/ForgotPassword";
import { Brand, BrandImage } from "../models/brand/auth/auth-brand.models";
import { Offer, OfferImage, OfferVideo } from "../models/brand/offers/offer.models";
import { User } from "../models/member/auth/user.models";
import { UsersVerification } from "../models/member/auth/user-verification";
import { Session } from "../models/member/auth/user-sessions.models";
import { UserAuthProvider } from "../models/member/auth/user-auth-provider.models";
import { Wallet } from "../models/member/wallet/wallet.models";
import { UserInterest } from "../models/member/user-interests/user-interests.model";
import { SelectedBrand } from "../models/member/selected-brands/selected-brands.models";
import { DealMatches } from "../models/member/deal-match/deal-match.models";
import { UserBrandInteraction } from "../models/member/brand-interaction/user-brand-interaction.models";
import { SavedOffer } from "../models/member/saved-offers/saved-offers.models";
import { RedeemedOffer } from "../models/member/redeemed-offers/redeemed-offers.models";
import { RedemptionRequest } from "../models/brand/redeem-via/redemption-request.model";
import { StripeCustomer } from "../models/payment/stripe-customer.models";
import { PaymentMethod } from "../models/payment/payment-method.models";
import { Transaction } from "../models/payment/transaction.models";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT as string, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: true,
  ssl: {
    rejectUnauthorized: false
  },
  entities: [
    Admin,
    EntityBrand,
    ForgotPassword,
    AdminBrandApproval,
    Brand,
    BrandImage,
    Offer,
    OfferImage,
    OfferVideo,
    User,
    UsersVerification,
    Session,
    UserAuthProvider,
    Wallet,
    UserInterest,
    SelectedBrand,
    DealMatches,
    UserBrandInteraction,
    SavedOffer,
    RedeemedOffer,
    RedemptionRequest,
    StripeCustomer,
    PaymentMethod,
    Transaction
  ],
  migrations: [],
  subscribers: [],
});

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source  been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err.message || err);
  });
