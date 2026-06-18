import "server-only";

import {
  AiUsageActionType,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/lib/db/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";

const PLAN_LIMITS: Record<SubscriptionPlan, number> = {
  [SubscriptionPlan.FREE]: 3,
  [SubscriptionPlan.PRO]: 100,
  [SubscriptionPlan.AGENCY]: 500,
};

export class UsageLimitExceededError extends Error {
  readonly plan: SubscriptionPlan;
  readonly limit: number;
  readonly used: number;
  readonly resetAt: Date;

  constructor(
    plan: SubscriptionPlan,
    limit: number,
    used: number,
    resetAt: Date,
  ) {
    super("Monthly AI generation limit reached.");
    this.name = "UsageLimitExceededError";
    this.plan = plan;
    this.limit = limit;
    this.used = used;
    this.resetAt = resetAt;
  }
}

export function getPlanLimit(plan: SubscriptionPlan): number {
  return PLAN_LIMITS[plan];
}

export function getCurrentMonthWindow(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  );

  return { start, end };
}

export function getNextMonthResetDate(): Date {
  return getCurrentMonthWindow().end;
}

export async function getCurrentUserPlan(
  userId: string,
): Promise<SubscriptionPlan> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true, status: true },
  });

  if (
    subscription &&
    (subscription.status === SubscriptionStatus.ACTIVE ||
      subscription.status === SubscriptionStatus.TRIALING)
  ) {
    return subscription.plan;
  }

  return SubscriptionPlan.FREE;
}

export async function getMonthlyGenerationUsage(userId: string): Promise<number> {
  const { start, end } = getCurrentMonthWindow();

  return prisma.aiUsage.count({
    where: {
      userId,
      actionType: AiUsageActionType.GENERATE_CAMPAIGN,
      createdAt: {
        gte: start,
        lt: end,
      },
    },
  });
}

export async function assertCanGenerateCampaign(userId: string): Promise<void> {
  const [plan, used] = await Promise.all([
    getCurrentUserPlan(userId),
    getMonthlyGenerationUsage(userId),
  ]);
  const limit = getPlanLimit(plan);
  const resetAt = getNextMonthResetDate();

  if (used >= limit) {
    throw new UsageLimitExceededError(plan, limit, used, resetAt);
  }
}
