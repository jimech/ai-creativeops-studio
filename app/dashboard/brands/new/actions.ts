"use server";

import { redirect } from "next/navigation";

import { AuthorizationError } from "@/lib/auth/authorization";
import { ensureCurrentUser } from "@/lib/auth/ensure-current-user";
import { prisma } from "@/lib/db/prisma";
import { createBrandSchema, type CreateBrandState } from "@/lib/validators/brand";

export async function createBrand(
  _prevState: CreateBrandState,
  formData: FormData,
): Promise<CreateBrandState> {
  try {
    const user = await ensureCurrentUser();

    const parsed = createBrandSchema.safeParse({
      name: formData.get("name"),
      industry: formData.get("industry"),
      toneOfVoice: formData.get("toneOfVoice") ?? undefined,
      targetAudience: formData.get("targetAudience") ?? undefined,
      colors: formData.get("colors") ?? undefined,
      fonts: formData.get("fonts") ?? undefined,
    });

    if (!parsed.success) {
      return {
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    await prisma.brand.create({
      data: {
        ownerId: user.id,
        name: parsed.data.name,
        industry: parsed.data.industry,
        toneOfVoice: parsed.data.toneOfVoice,
        targetAudience: parsed.data.targetAudience,
        colors: parsed.data.colors,
        fonts: parsed.data.fonts,
      },
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      redirect("/sign-in");
    }

    return {
      message: "Unable to save brand profile. Please try again.",
    };
  }

  redirect("/dashboard");
}
