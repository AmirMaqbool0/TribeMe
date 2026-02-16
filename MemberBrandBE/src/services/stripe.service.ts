import config from "../config";
import Stripe from "stripe";

export const stripe = new Stripe(config.stripe.apikey, {
  typescript: true,
});
