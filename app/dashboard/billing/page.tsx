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

const plans = [
  {
    plan: "PRO" as const,
    name: "Pro",
    price: "€12",
    interval: "per month",
    description:
      "For solo founders and small teams running regular campaign generation.",
    features: [
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

export default async function BillingPage({ searchParams }: BillingPageProps) {
  await requireCurrentUserId();
  const { checkout } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-[2rem] border border-border/80 bg-card/75 p-6 shadow-sm sm:p-8">
        <Badge variant="outline" className="w-fit bg-background/60">
          Billing
        </Badge>
        <h2 className="mt-3 font-heading text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
          Choose a plan
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
          Upgrade your studio with a subscription. Checkout runs in Stripe test
          mode during development — use Stripe test cards only, not live payment
          details.
        </p>
        {checkout === "success" ? (
          <p className="mt-4 rounded-2xl border border-border/80 bg-background/65 px-4 py-3 text-sm text-muted-foreground">
            Checkout completed in Stripe. Subscription sync will be handled in a
            later release.
          </p>
        ) : null}
        {checkout === "canceled" ? (
          <p className="mt-4 rounded-2xl border border-border/80 bg-background/65 px-4 py-3 text-sm text-muted-foreground">
            Checkout was canceled. You can try again when ready.
          </p>
        ) : null}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {plans.map((item) => (
          <Card
            key={item.plan}
            className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(6)]"
          >
            <CardHeader>
              <CardDescription>{item.name}</CardDescription>
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
      </section>

      <section className="rounded-[2rem] border border-dashed border-border/80 bg-background/65 p-6 text-sm leading-6 text-muted-foreground">
        <p className="font-medium text-foreground">Stripe test mode</p>
        <p className="mt-2">
          Use Stripe test-mode keys and price IDs in your local environment.
          Successful checkout redirects back here; database subscription updates
          will arrive in Ticket 28 via webhooks.
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
