import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  AuthorizationError,
  requireCurrentUserId,
} from "@/lib/auth/authorization";
import { getCurrentUserPlan } from "@/lib/billing/usage-limits";
import type { SubscriptionStatus } from "@/lib/db/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";

function formatPlanLabel(plan: "FREE" | "PRO" | "AGENCY"): string {
  if (plan === "PRO") {
    return "Pro";
  }

  if (plan === "AGENCY") {
    return "Agency";
  }

  return "Free";
}

function formatSubscriptionStatus(status: SubscriptionStatus | null): string {
  if (!status) {
    return "Free";
  }

  return status.charAt(0) + status.slice(1).toLowerCase();
}

function getDisplayName(name: string | null, email: string | null): string {
  if (name?.trim()) {
    return name.trim();
  }

  if (email?.trim()) {
    return email.trim();
  }

  return "User";
}

function getInitials(name: string | null, email: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);

    if (parts.length >= 2) {
      return `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`.toUpperCase();
    }

    return name.trim().slice(0, 2).toUpperCase();
  }

  if (email?.trim()) {
    return email.trim().slice(0, 2).toUpperCase();
  }

  return "U";
}

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  let userId: string;

  try {
    userId = await requireCurrentUserId();
  } catch (error) {
    if (error instanceof AuthorizationError) {
      redirect("/sign-in");
    }

    throw error;
  }

  const [user, subscription, plan] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        image: true,
      },
    }),
    prisma.subscription.findUnique({
      where: { userId },
      select: {
        status: true,
      },
    }),
    getCurrentUserPlan(userId),
  ]);

  const shellUser = {
    displayName: getDisplayName(user?.name ?? null, user?.email ?? null),
    email: user?.email ?? null,
    image: user?.image ?? null,
    initials: getInitials(user?.name ?? null, user?.email ?? null),
  };

  const shellPlan = {
    plan,
    planLabel: formatPlanLabel(plan),
    statusLabel: formatSubscriptionStatus(subscription?.status ?? null),
  };

  return (
    <DashboardShell user={shellUser} plan={shellPlan}>
      {children}
    </DashboardShell>
  );
}
