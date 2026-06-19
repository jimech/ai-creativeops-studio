import Link from "next/link";

import { CheckoutButton } from "@/components/billing/checkout-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireCurrentUserId } from "@/lib/auth/authorization";
import {
  getCurrentUserPlan,
  getMonthlyGenerationUsage,
  getNextMonthResetDate,
  getPlanLimit,
} from "@/lib/billing/usage-limits";
import type {
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/lib/db/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";

const plans = [
  {
    plan: "PRO" as const,
    name: "Pro",
    price: "€12",
    interval: "per month",
    description:
      "For solo founders and small teams running regular campaign generation.",
    features: [
      "100 AI campaign generations per month",
      "Unlimited brand profiles",
      "Campaign generation workspace",
      "Saved campaign library",
    ],
  },
  {
    plan: "AGENCY" as const,
    name: "Agency",
    price: "€39",
    interval: "per month",
    description:
      "For agencies managing multiple client brands and higher campaign volume.",
    features: [
      "500 AI campaign generations per month",
      "Everything in Pro",
      "Multi-brand operations",
      "Priority generation workflow",
    ],
  },
];

type BillingPageProps = {
  searchParams: Promise<{
    checkout?: string;
  }>;
};

function formatPlanLabel(plan: SubscriptionPlan): string {
  if (plan === "PRO") {
    return "Pro";
  }

  if (plan === "AGENCY") {
    return "Agency";
  }

  return "Free";
}

function formatStatus(status: SubscriptionStatus | null): string {
  if (!status) {
    return "Free tier";
  }

  return status.charAt(0) + status.slice(1).toLowerCase();
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

function usagePercent(used: number, limit: number): number {
  if (limit <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((used / limit) * 100));
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const userId = await requireCurrentUserId();
  const { checkout } = await searchParams;

  const [plan, used, subscription] = await Promise.all([
    getCurrentUserPlan(userId),
    getMonthlyGenerationUsage(userId),
    prisma.subscription.findUnique({
      where: { userId },
      select: {
        plan: true,
        status: true,
        currentPeriodEnd: true,
        stripeSubscriptionId: true,
      },
    }),
  ]);

  const limit = getPlanLimit(plan);
  const resetAt = getNextMonthResetDate();
  const percent = usagePercent(used, limit);
  const atOrOverLimit = used >= limit;
  const nearLimit = !atOrOverLimit && used >= Math.ceil(limit * 0.8);
  const showUpgradeCta = plan === "FREE" || atOrOverLimit || nearLimit;
  const subscriptionStatus = subscription?.status ?? null;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-[2rem] border border-border/80 bg-card/75 p-6 shadow-sm sm:p-8">
        <Badge variant="outline" className="w-fit bg-background/60">
          Billing
        </Badge>
        <h2 className="mt-3 font-heading text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
          Plan & usage
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
          Your current subscription, monthly AI generation usage, and upgrade
          options. Checkout runs in Stripe test mode during development.
        </p>
        {checkout === "success" ? (
          <p className="mt-4 rounded-2xl border border-border/80 bg-background/65 px-4 py-3 text-sm text-muted-foreground">
            Checkout completed in Stripe. Your subscription will sync here after
            the webhook processes.
          </p>
        ) : null}
        {checkout === "canceled" ? (
          <p className="mt-4 rounded-2xl border border-border/80 bg-background/65 px-4 py-3 text-sm text-muted-foreground">
            Checkout was canceled. You can try again when ready.
          </p>
        ) : null}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(6)]">
          <CardHeader>
            <CardDescription>Current plan</CardDescription>
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="font-heading text-4xl tracking-[-0.03em]">
                {formatPlanLabel(plan)}
              </CardTitle>
              <Badge variant={atOrOverLimit ? "destructive" : "secondary"}>
                {formatStatus(subscriptionStatus)}
              </Badge>
            </div>
            <CardDescription className="text-base leading-7">
              {subscription?.stripeSubscriptionId
                ? "Subscription synced from Stripe."
                : "No paid subscription on file — free tier limits apply."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-medium text-foreground">
                  Monthly AI generations
                </p>
                <p className="font-heading text-2xl font-semibold">
                  {used}
                  <span className="text-base font-normal text-muted-foreground">
                    {" "}
                    / {limit}
                  </span>
                </p>
              </div>
              <div
                className="mt-3 h-3 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={used}
                aria-valuemin={0}
                aria-valuemax={limit}
                aria-label="Monthly AI generation usage"
              >
                <div
                  className={`h-full rounded-full transition-all ${
                    atOrOverLimit ? "bg-destructive" : "bg-primary"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Resets on {formatDate(resetAt)}.
              </p>
              {subscription?.currentPeriodEnd ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  Current billing period ends{" "}
                  {formatDate(subscription.currentPeriodEnd)}.
                </p>
              ) : null}
            </div>

            {atOrOverLimit ? (
              <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm leading-6 text-destructive">
                You&apos;ve reached your monthly generation limit. Upgrade or
                wait until {formatDate(resetAt)} for your quota to reset.
              </p>
            ) : nearLimit ? (
              <p className="rounded-2xl border border-border/80 bg-background/65 px-4 py-3 text-sm leading-6 text-muted-foreground">
                You&apos;re close to your monthly limit. Consider upgrading if
                you need more generations this month.
              </p>
            ) : null}

            {showUpgradeCta ? (
              <Button asChild className="w-fit rounded-full">
                <Link href="#upgrade-plans">View upgrade options</Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-primary text-primary-foreground shadow-sm [--card-spacing:--spacing(6)]">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">
              Monthly limits
            </CardTitle>
            <CardDescription className="text-primary-foreground/75">
              Campaign generations counted per calendar month (UTC).
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <span>Free</span>
              <span className="font-medium">3 / month</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Pro</span>
              <span className="font-medium">100 / month</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Agency</span>
              <span className="font-medium">500 / month</span>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="upgrade-plans" className="flex flex-col gap-4">
        <div>
          <h3 className="font-heading text-2xl font-semibold tracking-[-0.03em]">
            Upgrade plans
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Subscribe in Stripe test mode to increase your monthly generation
            quota.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {plans.map((item) => (
            <Card
              key={item.plan}
              className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(6)]"
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardDescription>{item.name}</CardDescription>
                  {plan === item.plan ? (
                    <Badge variant="secondary">Current plan</Badge>
                  ) : null}
                </div>
                <CardTitle className="font-heading text-4xl tracking-[-0.03em]">
                  {item.price}
                  <span className="ml-2 text-base font-normal text-muted-foreground">
                    {item.interval}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <p className="text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
                <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                  {item.features.map((feature) => (
                    <li key={feature}>• {feature}</li>
                  ))}
                </ul>
                <CheckoutButton
                  plan={item.plan}
                  label={`Subscribe to ${item.name}`}
                  variant={item.plan === "PRO" ? "default" : "outline"}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-dashed border-border/80 bg-background/65 p-6 text-sm leading-6 text-muted-foreground">
        <p className="font-medium text-foreground">Stripe test mode</p>
        <p className="mt-2">
          Use Stripe test-mode keys and price IDs in your local environment.
          Successful checkout redirects back here; subscription updates sync via
          Stripe webhooks.
        </p>
        <Button
          asChild
          variant="outline"
          className="mt-4 rounded-full bg-background/60"
        >
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </section>
    </div>
  );
}
