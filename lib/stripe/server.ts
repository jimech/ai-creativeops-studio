import "server-only";

import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export type CheckoutPlan = "PRO" | "AGENCY";

export function getStripeConfig() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const proPriceId = process.env.STRIPE_PRO_PRICE_ID;
  const agencyPriceId = process.env.STRIPE_AGENCY_PRICE_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  return {
    secretKey,
    proPriceId,
    agencyPriceId,
    appUrl,
    isConfigured: Boolean(
      secretKey && proPriceId && agencyPriceId && appUrl,
    ),
  };
}

export function getStripe(): Stripe {
  const { secretKey } = getStripeConfig();

  if (!secretKey) {
    throw new Error("Stripe is not configured.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey);
  }

  return stripeClient;
}

export function getPriceIdForPlan(plan: CheckoutPlan): string | null {
  const { proPriceId, agencyPriceId } = getStripeConfig();

  if (plan === "PRO") {
    return proPriceId ?? null;
  }

  return agencyPriceId ?? null;
}
