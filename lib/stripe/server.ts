import "server-only";

import Stripe from "stripe";

import {
  getStripeServerEnv,
  isStripeConfigured,
} from "@/lib/env";

let stripeClient: Stripe | null = null;

export type CheckoutPlan = "PRO" | "AGENCY";

export function getStripeConfig() {
  if (!isStripeConfigured()) {
    return {
      secretKey: undefined,
      proPriceId: undefined,
      agencyPriceId: undefined,
      appUrl: undefined,
      isConfigured: false,
    };
  }

  const env = getStripeServerEnv();

  return {
    secretKey: env.secretKey,
    proPriceId: env.proPriceId,
    agencyPriceId: env.agencyPriceId,
    appUrl: env.appUrl,
    isConfigured: true,
  };
}

export function getStripe(): Stripe {
  const { secretKey } = getStripeServerEnv();

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey);
  }

  return stripeClient;
}

export function getPriceIdForPlan(plan: CheckoutPlan): string | null {
  if (!isStripeConfigured()) {
    return null;
  }

  const { proPriceId, agencyPriceId } = getStripeServerEnv();

  if (plan === "PRO") {
    return proPriceId;
  }

  return agencyPriceId;
}
