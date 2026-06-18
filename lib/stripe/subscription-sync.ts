import "server-only";

import type Stripe from "stripe";

import {
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/lib/db/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";

import { getStripeConfig, getStripe } from "./server";

export function planFromPriceId(
  priceId: string | null | undefined,
): SubscriptionPlan | null {
  if (!priceId) {
    return null;
  }

  const { proPriceId, agencyPriceId } = getStripeConfig();

  if (priceId === proPriceId) {
    return SubscriptionPlan.PRO;
  }

  if (priceId === agencyPriceId) {
    return SubscriptionPlan.AGENCY;
  }

  return null;
}

export function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): SubscriptionStatus {
  switch (status) {
    case "active":
      return SubscriptionStatus.ACTIVE;
    case "trialing":
      return SubscriptionStatus.TRIALING;
    case "past_due":
      return SubscriptionStatus.PAST_DUE;
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
      return SubscriptionStatus.CANCELED;
    default:
      return SubscriptionStatus.ACTIVE;
  }
}

export function resolvePlanFromSubscription(
  subscription: Stripe.Subscription,
  metadataPlan?: string | null,
): SubscriptionPlan | null {
  const priceId = subscription.items.data[0]?.price?.id;
  const fromPrice = planFromPriceId(priceId);

  if (fromPrice) {
    return fromPrice;
  }

  if (metadataPlan === "PRO") {
    return SubscriptionPlan.PRO;
  }

  if (metadataPlan === "AGENCY") {
    return SubscriptionPlan.AGENCY;
  }

  return null;
}

function getStripeCustomerId(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null,
): string | null {
  if (!customer) {
    return null;
  }

  if (typeof customer === "string") {
    return customer;
  }

  if ("deleted" in customer && customer.deleted) {
    return null;
  }

  return customer.id;
}

export async function resolveUserIdForSubscription(
  subscription: Stripe.Subscription,
): Promise<string | null> {
  if (subscription.metadata?.userId) {
    return subscription.metadata.userId;
  }

  const existing = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
    select: { userId: true },
  });

  if (existing) {
    return existing.userId;
  }

  const customerId = getStripeCustomerId(subscription.customer);

  if (customerId) {
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
      select: { id: true },
    });

    if (user) {
      return user.id;
    }
  }

  return null;
}

function getSubscriptionPeriodEnd(
  subscription: Stripe.Subscription,
): Date | null {
  const subscriptionWithPeriod = subscription as Stripe.Subscription & {
    current_period_end?: number;
  };
  const periodEnd =
    subscriptionWithPeriod.current_period_end ??
    subscription.items.data[0]?.current_period_end;

  return periodEnd ? new Date(periodEnd * 1000) : null;
}

export async function syncSubscriptionFromStripe(
  subscription: Stripe.Subscription,
  options?: {
    userId?: string | null;
    fallbackPlan?: SubscriptionPlan | null;
  },
): Promise<boolean> {
  const userId =
    options?.userId ??
    subscription.metadata?.userId ??
    (await resolveUserIdForSubscription(subscription));

  if (!userId) {
    console.warn(
      `[stripe webhook] Unable to resolve user for subscription ${subscription.id}.`,
    );
    return false;
  }

  const plan =
    options?.fallbackPlan ??
    resolvePlanFromSubscription(subscription, subscription.metadata?.plan);

  if (!plan) {
    console.warn(
      `[stripe webhook] Unable to resolve plan for subscription ${subscription.id}.`,
    );
    return false;
  }

  const customerId = getStripeCustomerId(subscription.customer);
  const currentPeriodEnd = getSubscriptionPeriodEnd(subscription);
  const status = mapStripeSubscriptionStatus(subscription.status);

  await prisma.$transaction(async (tx) => {
    if (customerId) {
      await tx.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    await tx.subscription.upsert({
      where: { userId },
      create: {
        userId,
        stripeSubscriptionId: subscription.id,
        plan,
        status,
        currentPeriodEnd,
      },
      update: {
        stripeSubscriptionId: subscription.id,
        plan,
        status,
        currentPeriodEnd,
      },
    });
  });

  return true;
}

export async function markSubscriptionCanceled(
  subscription: Stripe.Subscription,
): Promise<boolean> {
  const userId = await resolveUserIdForSubscription(subscription);

  if (!userId) {
    console.warn(
      `[stripe webhook] Unable to resolve user for deleted subscription ${subscription.id}.`,
    );
    return false;
  }

  const plan =
    resolvePlanFromSubscription(subscription, subscription.metadata?.plan) ??
    SubscriptionPlan.FREE;
  const currentPeriodEnd = getSubscriptionPeriodEnd(subscription);

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeSubscriptionId: subscription.id,
      plan,
      status: SubscriptionStatus.CANCELED,
      currentPeriodEnd,
    },
    update: {
      stripeSubscriptionId: subscription.id,
      status: SubscriptionStatus.CANCELED,
      currentPeriodEnd,
    },
  });

  return true;
}

export async function syncSubscriptionFromCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<boolean> {
  const userId = session.metadata?.userId ?? session.client_reference_id ?? null;

  if (!userId) {
    console.warn(
      `[stripe webhook] checkout.session.completed missing user mapping for session ${session.id}.`,
    );
    return false;
  }

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!subscriptionId) {
    console.warn(
      `[stripe webhook] checkout.session.completed missing subscription for session ${session.id}.`,
    );
    return false;
  }

  const customerId = getStripeCustomerId(session.customer);

  if (customerId) {
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customerId },
    });
  }

  const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
  const fallbackPlan =
    session.metadata?.plan === "PRO"
      ? SubscriptionPlan.PRO
      : session.metadata?.plan === "AGENCY"
        ? SubscriptionPlan.AGENCY
        : null;

  return syncSubscriptionFromStripe(subscription, { userId, fallbackPlan });
}
