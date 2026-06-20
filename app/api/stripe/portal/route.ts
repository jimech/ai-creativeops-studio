import { NextResponse } from "next/server";

import { getCurrentUserId } from "@/lib/auth/authorization";
import { prisma } from "@/lib/db/prisma";
import { getStripe, getStripeConfig } from "@/lib/stripe/server";

export async function POST() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  const config = getStripeConfig();

  if (!config.isConfigured || !config.appUrl) {
    return NextResponse.json(
      { error: "Billing portal is not configured." },
      { status: 503 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.json(
      {
        error:
          "No Stripe customer on file. Subscribe to a plan first, then you can manage billing.",
      },
      { status: 400 },
    );
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${config.appUrl}/dashboard/billing`,
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Unable to open billing portal." },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: session.url });
}
