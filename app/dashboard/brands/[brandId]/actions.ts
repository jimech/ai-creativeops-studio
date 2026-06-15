"use server";

import { notFound, redirect } from "next/navigation";

import { AuthorizationError } from "@/lib/auth/authorization";
import { ensureCurrentUser } from "@/lib/auth/ensure-current-user";
import { prisma } from "@/lib/db/prisma";
import { createBrandSchema, type CreateBrandState } from "@/lib/validators/brand";

export async function updateBrand(
  brandId: string,
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

    const result = await prisma.brand.updateMany({
      where: {
        id: brandId,
        ownerId: user.id,
      },
      data: {
        name: parsed.data.name,
        industry: parsed.data.industry,
        toneOfVoice: parsed.data.toneOfVoice,
        targetAudience: parsed.data.targetAudience,
        colors: parsed.data.colors,
        fonts: parsed.data.fonts,
      },
    });

    if (result.count === 0) {
      notFound();
    }
  } catch (error) {
    if (error instanceof AuthorizationError) {
      redirect("/sign-in");
    }

    return {
      message: "Unable to update brand profile. Please try again.",
    };
  }

  redirect(`/dashboard/brands/${brandId}`);
}
