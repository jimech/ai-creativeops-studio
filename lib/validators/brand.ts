import { z } from "zod";

function parseCommaSeparatedList(value: string | undefined): string[] {
  if (!value?.trim()) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export const createBrandSchema = z.object({
  name: z.string().trim().min(1, "Brand name is required."),
  industry: z.string().trim().min(1, "Industry is required."),
  toneOfVoice: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined),
  targetAudience: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined),
  colors: z
    .string()
    .optional()
    .transform((value) => parseCommaSeparatedList(value)),
  fonts: z
    .string()
    .optional()
    .transform((value) => parseCommaSeparatedList(value)),
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>;

export type CreateBrandState = {
  errors?: Record<string, string[] | undefined>;
  message?: string;
};
