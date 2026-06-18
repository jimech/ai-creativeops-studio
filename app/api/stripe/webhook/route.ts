import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { getStripe } from "@/lib/stripe/server";
import {
  markSubscriptionCanceled,
  syncSubscriptionFromCheckoutSession,
  syncSubscriptionFromStripe,
} from "@/lib/stripe/subscription-sync";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook not configured." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 },
    );
  }

  const body = await request.text();

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json(
      { error: "Invalid Stripe signature." },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await syncSubscriptionFromCheckoutSession(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await syncSubscriptionFromStripe(
          event.data.object as Stripe.Subscription,
        );
        break;
      case "customer.subscription.deleted":
        await markSubscriptionCanceled(
          event.data.object as Stripe.Subscription,
        );
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(
      "[stripe webhook] Handler error:",
      error instanceof Error ? error.message : "unknown",
    );

    return NextResponse.json(
      { error: "Webhook handler failed." },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
