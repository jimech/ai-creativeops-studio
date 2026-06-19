import "server-only";

import type Stripe from "stripe";

import {
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/lib/db/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";

import { getStripeConfig, getStripe } from "./server";

type WebhookLogContext = {
  stripeSubscriptionId?: string;
  stripeSessionId?: string;
  stripeCustomerId?: string;
};

export function parseMetadataUserId(
  userId: string | null | undefined,
): string | null {
  const trimmed = userId?.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed;
}

export function parseMetadataPlan(
  plan: string | null | undefined,
): SubscriptionPlan | null {
  if (plan === "PRO") {
    return SubscriptionPlan.PRO;
  }

  if (plan === "AGENCY") {
    return SubscriptionPlan.AGENCY;
  }

  return null;
}

export function logWebhookSkip(
  eventType: string,
  reason: string,
  context?: WebhookLogContext,
): void {
  console.warn("[stripe webhook] Skipped event", {
    eventType,
    reason,
    ...context,
  });
}

export function logWebhookProcessed(
  eventType: string,
  action: string,
  context?: WebhookLogContext,
): void {
  console.info("[stripe webhook] Processed event", {
    eventType,
    action,
    ...context,
  });
}

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

  return parseMetadataPlan(metadataPlan);
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

async function findUserIdByStripeCustomerId(
  customerId: string,
): Promise<string | null> {
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  });

  return user?.id ?? null;
}

export async function resolveUserIdForSubscription(
  subscription: Stripe.Subscription,
  eventType = "resolve_user",
): Promise<string | null> {
  const metadataUserId = parseMetadataUserId(subscription.metadata?.userId);

  if (metadataUserId) {
    const user = await prisma.user.findUnique({
      where: { id: metadataUserId },
      select: { id: true },
    });

    if (user) {
      return user.id;
    }

    logWebhookSkip(eventType, "metadata_user_not_found", {
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: getStripeCustomerId(subscription.customer) ?? undefined,
    });
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
    const userId = await findUserIdByStripeCustomerId(customerId);

    if (userId) {
      return userId;
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
    eventType?: string;
  },
): Promise<boolean> {
  const eventType = options?.eventType ?? "customer.subscription.updated";

  const explicitUserId = parseMetadataUserId(options?.userId ?? null);
  let userId: string | null = null;

  if (explicitUserId) {
    const user = await prisma.user.findUnique({
      where: { id: explicitUserId },
      select: { id: true },
    });

    if (user) {
      userId = user.id;
    } else {
      logWebhookSkip(eventType, "explicit_user_not_found", {
        stripeSubscriptionId: subscription.id,
      });
      return false;
    }
  } else {
    userId = await resolveUserIdForSubscription(subscription, eventType);
  }

  if (!userId) {
    logWebhookSkip(eventType, "unable_to_resolve_user", {
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: getStripeCustomerId(subscription.customer) ?? undefined,
    });
    return false;
  }

  const plan =
    options?.fallbackPlan ??
    resolvePlanFromSubscription(subscription, subscription.metadata?.plan);

  if (!plan) {
    logWebhookSkip(eventType, "unable_to_resolve_plan", {
      stripeSubscriptionId: subscription.id,
    });
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

  logWebhookProcessed(eventType, "subscription_synced", {
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: customerId ?? undefined,
  });

  return true;
}

export async function markSubscriptionCanceled(
  subscription: Stripe.Subscription,
  eventType = "customer.subscription.deleted",
): Promise<boolean> {
  const stripeSubscriptionId = subscription.id;
  const customerId = getStripeCustomerId(subscription.customer) ?? undefined;
  const currentPeriodEnd = getSubscriptionPeriodEnd(subscription);

  const existingByStripeId = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId },
    select: { userId: true },
  });

  if (existingByStripeId) {
    await prisma.subscription.update({
      where: { userId: existingByStripeId.userId },
      data: {
        status: SubscriptionStatus.CANCELED,
        currentPeriodEnd,
      },
    });

    logWebhookProcessed(eventType, "subscription_canceled", {
      stripeSubscriptionId,
      stripeCustomerId: customerId,
    });

    return true;
  }

  const userId = await resolveUserIdForSubscription(subscription, eventType);

  if (!userId) {
    logWebhookSkip(eventType, "no_matching_user_or_subscription", {
      stripeSubscriptionId,
      stripeCustomerId: customerId,
    });
    return false;
  }

  const existingByUser = await prisma.subscription.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!existingByUser) {
    logWebhookSkip(eventType, "no_subscription_row_for_user", {
      stripeSubscriptionId,
      stripeCustomerId: customerId,
    });
    return false;
  }

  await prisma.subscription.update({
    where: { userId },
    data: {
      stripeSubscriptionId,
      status: SubscriptionStatus.CANCELED,
      currentPeriodEnd,
    },
  });

  logWebhookProcessed(eventType, "subscription_canceled", {
    stripeSubscriptionId,
    stripeCustomerId: customerId,
  });

  return true;
}

export async function syncSubscriptionFromCheckoutSession(
  session: Stripe.Checkout.Session,
  eventType = "checkout.session.completed",
): Promise<boolean> {
  const metadataUserId = parseMetadataUserId(session.metadata?.userId);
  const referenceUserId = parseMetadataUserId(session.client_reference_id);
  const userId = metadataUserId ?? referenceUserId;

  if (!userId) {
    logWebhookSkip(eventType, "missing_user_mapping", {
      stripeSessionId: session.id,
      stripeCustomerId: getStripeCustomerId(session.customer) ?? undefined,
    });
    return false;
  }

  if (metadataUserId && referenceUserId && metadataUserId !== referenceUserId) {
    logWebhookSkip(eventType, "conflicting_user_mapping", {
      stripeSessionId: session.id,
    });
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    logWebhookSkip(eventType, "user_not_found", {
      stripeSessionId: session.id,
      stripeCustomerId: getStripeCustomerId(session.customer) ?? undefined,
    });
    return false;
  }

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!subscriptionId) {
    logWebhookSkip(eventType, "missing_subscription", {
      stripeSessionId: session.id,
      stripeCustomerId: getStripeCustomerId(session.customer) ?? undefined,
    });
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
  const fallbackPlan = parseMetadataPlan(session.metadata?.plan);

  return syncSubscriptionFromStripe(subscription, {
    userId,
    fallbackPlan,
    eventType,
  });
}
