/**
 * Server-side OpenAI campaign generation.
 * Do not import this module from client components.
 */

import "server-only";

import OpenAI from "openai";
import { z } from "zod";

export type BrandContext = {
  name: string;
  industry: string;
  toneOfVoice?: string | null;
  targetAudience?: string | null;
  colors?: string[];
  fonts?: string[];
};

export type CampaignBriefInput = {
  campaignGoal: string;
  platform: string;
  campaignType?: string;
  productOrOffer?: string;
  audience?: string;
  keyMessage?: string;
  desiredTone?: string;
  timeline?: string;
  additionalNotes?: string;
};

export type GenerateCampaignIdeasInput = {
  brand: BrandContext;
  brief: CampaignBriefInput;
};

export type CampaignGenerationResult = {
  campaignConcepts: string[];
  captions: string[];
  adHooks: string[];
  imagePrompts: string[];
  videoIdeas: string[];
  contentCalendarIdeas: string[];
};

export class CampaignGenerationError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "CampaignGenerationError";
  }
}

const campaignGenerationResultSchema = z.object({
  campaignConcepts: z.array(z.string().trim().min(1)).min(1),
  captions: z.array(z.string().trim().min(1)).min(1),
  adHooks: z.array(z.string().trim().min(1)).min(1),
  imagePrompts: z.array(z.string().trim().min(1)).min(1),
  videoIdeas: z.array(z.string().trim().min(1)).min(1),
  contentCalendarIdeas: z.array(z.string().trim().min(1)).min(1),
});

const DEFAULT_MODEL = "gpt-4o-mini";

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey?.trim()) {
    throw new CampaignGenerationError(
      "OpenAI is not configured. Set OPENAI_API_KEY before generating campaigns.",
    );
  }

  return new OpenAI({ apiKey });
}

function formatBrandContext(brand: BrandContext): string {
  const lines = [
    `Brand name: ${brand.name}`,
    `Industry: ${brand.industry}`,
  ];

  if (brand.toneOfVoice?.trim()) {
    lines.push(`Tone of voice: ${brand.toneOfVoice.trim()}`);
  }

  if (brand.targetAudience?.trim()) {
    lines.push(`Target audience: ${brand.targetAudience.trim()}`);
  }

  if (brand.colors?.length) {
    lines.push(`Brand colors: ${brand.colors.join(", ")}`);
  }

  if (brand.fonts?.length) {
    lines.push(`Brand fonts: ${brand.fonts.join(", ")}`);
  }

  return lines.join("\n");
}

function formatCampaignBrief(brief: CampaignBriefInput): string {
  const lines = [
    `Campaign goal: ${brief.campaignGoal}`,
    `Platform: ${brief.platform}`,
  ];

  const optionalFields: Array<[string, string | undefined]> = [
    ["Campaign type", brief.campaignType],
    ["Product or offer", brief.productOrOffer],
    ["Audience", brief.audience],
    ["Key message", brief.keyMessage],
    ["Desired tone", brief.desiredTone],
    ["Timeline", brief.timeline],
    ["Additional notes", brief.additionalNotes],
  ];

  for (const [label, value] of optionalFields) {
    if (value?.trim()) {
      lines.push(`${label}: ${value.trim()}`);
    }
  }

  return lines.join("\n");
}

function buildPrompt(input: GenerateCampaignIdeasInput): string {
  return [
    "You are a senior creative director generating campaign ideas for a lifestyle brand studio.",
    "Use the brand context and campaign brief below.",
    "Return concise, actionable ideas tailored to the brand voice and platform.",
    "Respond with JSON only. Do not include markdown or commentary.",
    "",
    "Brand context:",
    formatBrandContext(input.brand),
    "",
    "Campaign brief:",
    formatCampaignBrief(input.brief),
    "",
    "Return JSON with exactly these keys:",
    "- campaignConcepts: string[] (2-3 campaign concept summaries)",
    "- captions: string[] (2-3 social captions)",
    "- adHooks: string[] (2-3 short ad hooks)",
    "- imagePrompts: string[] (2-3 image generation prompts)",
    "- videoIdeas: string[] (2-3 short-form video ideas)",
    "- contentCalendarIdeas: string[] (2-3 calendar post ideas)",
  ].join("\n");
}

function parseModelJson(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new CampaignGenerationError(
      "OpenAI returned an invalid JSON response.",
      { cause: error },
    );
  }
}

function validateGenerationResult(payload: unknown): CampaignGenerationResult {
  const parsed = campaignGenerationResultSchema.safeParse(payload);

  if (!parsed.success) {
    throw new CampaignGenerationError(
      "OpenAI returned campaign data in an unexpected format.",
      { cause: parsed.error },
    );
  }

  return parsed.data;
}

function toCampaignGenerationError(error: unknown): CampaignGenerationError {
  if (error instanceof CampaignGenerationError) {
    return error;
  }

  if (error instanceof OpenAI.APIError) {
    return new CampaignGenerationError(
      "OpenAI could not generate campaign ideas. Please try again.",
      { cause: error },
    );
  }

  return new CampaignGenerationError(
    "Campaign generation failed. Please try again.",
    { cause: error },
  );
}

export async function generateCampaignIdeas(
  input: GenerateCampaignIdeasInput,
): Promise<CampaignGenerationResult> {
  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You generate structured marketing campaign ideas. Always respond with valid JSON matching the requested schema.",
        },
        {
          role: "user",
          content: buildPrompt(input),
        },
      ],
    });

    const content = response.choices[0]?.message?.content;

    if (!content?.trim()) {
      throw new CampaignGenerationError(
        "OpenAI returned an empty campaign response.",
      );
    }

    return validateGenerationResult(parseModelJson(content));
  } catch (error) {
    throw toCampaignGenerationError(error);
  }
}
