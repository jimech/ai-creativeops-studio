import { NextResponse } from "next/server";

import { getCurrentUserId } from "@/lib/auth/authorization";
import {
  getPriceIdForPlan,
  getStripe,
  getStripeConfig,
} from "@/lib/stripe/server";
import { stripeCheckoutPlanSchema } from "@/lib/validators/stripe-checkout";

export async function POST(request: Request) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = stripeCheckoutPlanSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid request.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const config = getStripeConfig();

  if (!config.isConfigured) {
    return NextResponse.json(
      { error: "Stripe checkout is not configured." },
      { status: 503 },
    );
  }

  const priceId = getPriceIdForPlan(parsed.data.plan);

  if (!priceId) {
    return NextResponse.json(
      { error: "Stripe checkout is not configured." },
      { status: 503 },
    );
  }

  const stripe = getStripe();
  const appUrl = config.appUrl!;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/billing?checkout=success`,
    cancel_url: `${appUrl}/dashboard/billing?checkout=canceled`,
    client_reference_id: userId,
    metadata: {
      userId,
      plan: parsed.data.plan,
    },
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Unable to create checkout session." },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: session.url });
}
