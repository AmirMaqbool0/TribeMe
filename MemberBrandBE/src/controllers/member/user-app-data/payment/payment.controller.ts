import { Request, Response } from "express";
import ApiError from "../../../../utils/api-error";
import ApiResponse from "../../../../utils/api-response";
import { MESSAGES } from "../../../../utils/message-codes";
import { stripe } from "../../../../services/stripe.service";
import { getRepository } from "typeorm";
import { RedeemedOffer } from "../../../../models/member/redeemed-offers/redeemed-offers.models";
import { nextTick } from "process";
import { StripeCustomer } from "../../../../models/payment/stripe-customer.models";
import { PaymentMethod } from "../../../../models/payment/payment-method.models";
import { User } from "../../../../models/member/auth/user.models";

export class PaymentController {

  static async fundsInPlatformAccount(req: Request, res: Response) {
    try {
      const balance = await stripe.balance.retrieve();

      if (!balance) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "Balance not found in your platform"
          ),
        });
      }

      return res
        .status(MESSAGES.CREATED._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            balance,
            "funds in platform account retrieved successfully."
          )
        );
    } catch (error) {
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          MESSAGES.INTERNAL_SERVER_ERROR.message
        ),
      });
    }
  }

  static async connectAccount(req: Request, res: Response) {
    const { userId } = (req as any).user;

    try {
      const {
        accountHolderName,
        accountNumber,
        routingNumber,
        accountHolderType,
      } = req.body;

      const bankAccountToken = await stripe.tokens.create({
        bank_account: {
          country: "US",
          currency: "usd",
          account_holder_name: accountHolderName,
          account_holder_type: accountHolderType,
          routing_number: routingNumber,
          account_number: accountNumber,
        },
      });

      // Create a Custom Connect account with required fields
      const account = await stripe.accounts.create({
        type: "custom",
        country: "US",
        business_type: "individual",
        capabilities: {
          transfers: { requested: true },
          card_payments: { requested: true },
        },

        tos_acceptance: {
          date: Math.floor(Date.now() / 1000),
          ip: req.ip,
        },
        business_profile: {
          mcc: "5734",
          url: "https://yourdomain.com",
          product_description: "Digital products and services",
        },

        individual: {
          email: "user@example.com",
          phone: "+1 561-555-7689",
          first_name: "Jahanzeb",
          last_name: "Khan",
          address: {
            line1: "123 Main St",
            city: "Sample City",
            state: "CA",
            postal_code: "90001",
            country: "US",
          },
          dob: {
            day: 15,
            month: 6,
            year: 1990,
          },
          ssn_last_4: "6789",
          id_number: "123456789",
          verification: {
            document: {
              front: null,
              back: null,
            },
          },
        },
      });

      const bankAccount = await stripe.accounts.createExternalAccount(
        account.id,
        {
          external_account: bankAccountToken.id,
        }
      );

      const checkTransfer = await stripe.accounts.update(account.id, {
        capabilities: {
          transfers: { requested: true },
        },
      });

      const accountids = await stripe.accounts.retrieve(account.id);
      // console.log(accountids);

      const userRepository = getRepository(User);
      const stripeCustomerRepository = getRepository(StripeCustomer);

      const user = await userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        return res
          .status(MESSAGES.NOT_FOUND._CODE)
          .json({ error: "User not found" });
      }
      const stripeCustomer = new StripeCustomer();
      stripeCustomer.stripeCustomerId = account.id;
      stripeCustomer.user = user;

      const accountId = await stripeCustomerRepository.save(stripeCustomer);
      console.log("account id: ", accountId);

      const verifiedAccount = await stripe.accounts.retrieve(account.id);

      return res.json({
        success: true,
        accountId: account.id,
        capabilities: verifiedAccount.capabilities,
        payouts_enabled: verifiedAccount.payouts_enabled,
        charges_enabled: verifiedAccount.charges_enabled,
      });
    } catch (error) {
      console.error("Error connecting bank account:", error);
      res.status(400).json({ error: error.message });
    }
  }

  static async initiateWithdrawal(req: Request, res: Response) {
    try {
      const { amount } = req.body; // Amount in cents

      const { userId } = (req as any).user; 
      console.log(userId);

      // Get the connected account from database
      const stripeCustomerRepository = getRepository(StripeCustomer);
      const stripeCustomer = await stripeCustomerRepository.findOne({
        where: { user: { id: userId } },
      });
      console.log(stripeCustomer);

      if (!stripeCustomer) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: "No connected account found",
        });
      }

      const balance = await stripe.balance.retrieve();
      const availableBalance =
        balance.available.find((bal) => bal.currency === "usd")?.amount || 0;

      if (availableBalance < amount) {
        return res.status(400).json({
          error: "Insufficient funds in platform account",
          available: availableBalance,
          requested: amount,
        });
      }

      // 3. Verify account capabilities
      const account = await stripe.accounts.retrieve(
        stripeCustomer.stripeCustomerId
      );
      console.log("Account capabilities:", account.capabilities);

      if (account.capabilities?.transfers !== "active") {
        return res.status(400).json({
          error:
            "Transfers capability is not active. Please complete account verification.",
          currentCapabilities: account.capabilities,
        });
      }

      // First, create a Transfer to the connected account
      const transfer = await stripe.transfers.create({
        amount: amount,
        currency: "usd",
        destination: stripeCustomer.stripeCustomerId, 
        transfer_group: `withdrawal-${Date.now()}`, 
      });

      console.log("Transfer created:", transfer);

      // Then, create a Payout from the connected account to their bank account
      const payout = await stripe.payouts.create(
        {
          amount: amount,
          currency: "usd",
          method: "standard",
          source_type: "card", 
        },
        {
          stripeAccount: stripeCustomer.stripeCustomerId,
        }
      );

      console.log("Payout created:", payout);

      // Save transaction details to database
      const paymentMethodRepository = getRepository(PaymentMethod);
      const paymentMethod = new PaymentMethod();

      paymentMethod.stripeChargeId = transfer.id;
      paymentMethod.amount = amount;
      paymentMethod.currency = "usd";
      paymentMethod.status = "pending";
      paymentMethod.stripeCustomer = stripeCustomer;
      // paymentMethod.user = req.user;

      await paymentMethodRepository.save(paymentMethod);

      return res.json({
        success: true,
        transfer: {
          id: transfer.id,
          // status: transfer.st,
          amount: transfer.amount,
        },
        payout: {
          id: payout.id,
          status: payout.status,
          amount: payout.amount,
          arrival_date: payout.arrival_date,
        },
        balance: {
          available: availableBalance,
          remaining: availableBalance - amount,
        },
      });
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      res.status(400).json({ error: error.message });
    }
  }

  static async transferFundsToConnectedAccount(req: Request, res: Response) {
    const { userId, amount } = req.body; 

    try {
      const stripeCustomerRepository = getRepository(StripeCustomer);
      const stripeCustomer = await stripeCustomerRepository.findOne({
        where: { user: { id: userId } },
      });

      if (!stripeCustomer) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: "No connected account found for the user",
        });
      }

      // Check the platform account balance
      const balance = await stripe.balance.retrieve();
      const availableBalance =
        balance.available.find((bal) => bal.currency === "usd")?.amount || 0;

      if (availableBalance < amount) {
        return res.status(400).json({
          error: "Insufficient funds in platform account",
          available: availableBalance,
          requested: amount,
        });
      }

      // Verify if the connected account is capable of receiving transfers
      const account = await stripe.accounts.retrieve(
        stripeCustomer.stripeCustomerId
      );
      if (account.capabilities?.transfers !== "active") {
        return res.status(400).json({
          error: "Transfers capability is not active for the connected account",
          currentCapabilities: account.capabilities,
        });
      }

      // Create a Transfer to the connected account
      const transfer = await stripe.transfers.create({
        amount: amount, 
        currency: "usd",
        destination: stripeCustomer.stripeCustomerId,
        transfer_group: `platform-to-connected-${Date.now()}`,
      });

      const payout = await stripe.payouts.create(
        {
          amount: amount,
          currency: "usd",
          method: "standard",
          source_type: "card",
        },
        {
          stripeAccount: stripeCustomer.stripeCustomerId,
        }
      );

      console.log("Transfer created:", transfer);
      console.log("Payout created:", payout);

      return res.json({
        success: true,
        transfer: {
          id: transfer.id,
          amount: transfer.amount,
        },
        payout: {
          id: payout.id,
          status: payout.status,
          amount: payout.amount,
        },
        balance: {
          available: availableBalance,
          remaining: availableBalance - amount,
        },
      });
    } catch (error) {
      console.error("Error transferring funds:", error);
      res.status(400).json({ error: error.message });
    }
  }

  static async paymentIntentConfirm(req: Request, res: Response) {
    res.render("index.ejs");
  }
}
