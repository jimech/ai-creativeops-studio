import { NextResponse } from "next/server";

import {
  CampaignGenerationError,
  generateCampaignIdeas,
} from "@/lib/ai/campaign-generator";
import { getCurrentUserId } from "@/lib/auth/authorization";
import { prisma } from "@/lib/db/prisma";
import { generateCampaignRequestSchema } from "@/lib/validators/generate-campaign";

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

  const parsed = generateCampaignRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid request.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const {
    brandId,
    campaignGoal,
    platform,
    campaignType,
    productOrOffer,
    audience,
    keyMessage,
    desiredTone,
    timeline,
    additionalNotes,
  } = parsed.data;

  const brand = await prisma.brand.findFirst({
    where: {
      id: brandId,
      ownerId: userId,
    },
    select: {
      name: true,
      industry: true,
      toneOfVoice: true,
      targetAudience: true,
      colors: true,
      fonts: true,
    },
  });

  if (!brand) {
    return NextResponse.json({ error: "Brand not found." }, { status: 404 });
  }

  try {
    const result = await generateCampaignIdeas({
      brand: {
        name: brand.name,
        industry: brand.industry,
        toneOfVoice: brand.toneOfVoice,
        targetAudience: brand.targetAudience,
        colors: brand.colors,
        fonts: brand.fonts,
      },
      brief: {
        campaignGoal,
        platform,
        campaignType,
        productOrOffer,
        audience,
        keyMessage,
        desiredTone,
        timeline,
        additionalNotes,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof CampaignGenerationError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Campaign generation failed. Please try again." },
      { status: 500 },
    );
  }
}
