import { z } from "zod";

function optionalTrimmedString() {
  return z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined);
}

export const generateCampaignRequestSchema = z.object({
  brandId: z.string().trim().min(1, "Brand is required."),
  campaignGoal: z.string().trim().min(1, "Campaign goal is required."),
  platform: z.string().trim().min(1, "Platform is required."),
  campaignType: optionalTrimmedString(),
  productOrOffer: optionalTrimmedString(),
  audience: optionalTrimmedString(),
  keyMessage: optionalTrimmedString(),
  desiredTone: optionalTrimmedString(),
  timeline: optionalTrimmedString(),
  additionalNotes: optionalTrimmedString(),
});

export type GenerateCampaignRequest = z.infer<
  typeof generateCampaignRequestSchema
>;
