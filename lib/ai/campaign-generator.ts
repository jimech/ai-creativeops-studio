/**
 * Server-side OpenAI campaign generation.
 * Do not import this module from client components.
 */

import "server-only";

import OpenAI, { APIError } from "openai";
import { z } from "zod";

import {
  assertAiGenerationModeAllowed,
  EnvValidationError,
  getOpenAiApiKey,
  isMockAiGenerationMode,
} from "@/lib/env";

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

export type CampaignGenerationMode = "mock" | "openai";

export type CampaignGenerationOutcome = {
  result: CampaignGenerationResult;
  generationMode: CampaignGenerationMode;
  tokensUsed: number | null;
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

function generateMockCampaignIdeas(
  input: GenerateCampaignIdeasInput,
): CampaignGenerationResult {
  const { brand, brief } = input;
  const tone = brief.desiredTone ?? brand.toneOfVoice ?? "editorial and refined";
  const audience =
    brief.audience ?? brand.targetAudience ?? "style-conscious customers";
  const product = brief.productOrOffer ?? "signature offer";
  const campaignType = brief.campaignType ?? "brand campaign";
  const keyMessage =
    brief.keyMessage ?? `Highlight why ${brand.name} matters now.`;
  const colorNote = brand.colors?.length
    ? brand.colors.join(", ")
    : "neutral palette";

  return {
    campaignConcepts: [
      `${brand.name} ${campaignType}: A ${tone.toLowerCase()} ${brief.platform} rollout focused on ${brief.campaignGoal}.`,
      `The ${brand.industry} Edit: Position ${product} as the centerpiece of a calm, premium launch story.`,
      `${keyMessage} Translate the brief into a cohesive creative direction for ${audience}.`,
    ],
    captions: [
      `Introducing the next chapter for ${brand.name}: ${brief.campaignGoal}.`,
      `Built for ${audience}, ${product} brings ${tone.toLowerCase()} energy to ${brief.platform}.`,
      `${brand.name} in ${colorNote} tones — crafted for a slower, more intentional launch moment.`,
    ],
    adHooks: [
      `The ${brief.platform} campaign ${brand.name} needs for ${brief.campaignGoal}.`,
      `Turn ${product} into a polished creative angle in minutes.`,
      `For ${audience} who expect ${tone.toLowerCase()} brand storytelling.`,
    ],
    imagePrompts: [
      `${colorNote} backdrop, soft editorial light, ${brand.industry} product detail, restrained luxury styling.`,
      `Minimal studio set for ${brand.name}, tactile textures, premium still life, quiet composition.`,
      `${brief.platform} hero visual for ${product}, founder-led mood, clean sans-serif typography.`,
    ],
    videoIdeas: [
      `Three-shot ritual sequence introducing ${product} with ${tone.toLowerCase()} voiceover.`,
      `Founder note explaining ${brief.campaignGoal} over slow product close-ups.`,
      `${brief.platform} styling reel: detail, use moment, final editorial frame for ${brand.name}.`,
    ],
    contentCalendarIdeas: [
      `Day 1: Reveal ${campaignType} concept with a short founder note.`,
      `Day 3: Product education post featuring ${product} proof points for ${audience}.`,
      `Day 5: Visual direction carousel inspired by ${colorNote} brand cues.`,
    ],
  };
}

function getOpenAIClient(): OpenAI {
  try {
    return new OpenAI({ apiKey: getOpenAiApiKey() });
  } catch (error) {
    if (error instanceof EnvValidationError) {
      throw new CampaignGenerationError(error.message);
    }

    throw error;
  }
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

function mapOpenAIErrorMessage(error: APIError): string {
  if (error.code === "insufficient_quota") {
    return "OpenAI quota exceeded. Add billing or credits to your OpenAI account, then try again.";
  }

  if (error.status === 401) {
    return "OpenAI authentication failed. Check OPENAI_API_KEY configuration.";
  }

  if (error.status === 429) {
    return "OpenAI rate limit reached. Please wait and try again.";
  }

  return "OpenAI could not generate campaign ideas. Please try again.";
}

export function logCampaignGenerationError(error: unknown): void {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  if (error instanceof CampaignGenerationError) {
    console.error("[campaign-generation]", {
      name: error.name,
      message: error.message,
      cause:
        error.cause instanceof APIError
          ? {
              name: error.cause.name,
              message: error.cause.message,
              status: error.cause.status,
              code: error.cause.code,
              type: error.cause.type,
            }
          : error.cause instanceof Error
            ? { name: error.cause.name, message: error.cause.message }
            : undefined,
    });
    return;
  }

  if (error instanceof APIError) {
    console.error("[campaign-generation]", {
      name: error.name,
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type,
    });
    return;
  }

  if (error instanceof Error) {
    console.error("[campaign-generation]", {
      name: error.name,
      message: error.message,
    });
  }
}

function toCampaignGenerationError(error: unknown): CampaignGenerationError {
  if (error instanceof CampaignGenerationError) {
    return error;
  }

  if (error instanceof APIError) {
    return new CampaignGenerationError(mapOpenAIErrorMessage(error), {
      cause: error,
    });
  }

  return new CampaignGenerationError(
    "Campaign generation failed. Please try again.",
    { cause: error },
  );
}

export async function generateCampaignIdeas(
  input: GenerateCampaignIdeasInput,
): Promise<CampaignGenerationOutcome> {
  try {
    assertAiGenerationModeAllowed();
  } catch (error) {
    if (error instanceof EnvValidationError) {
      throw new CampaignGenerationError(error.message);
    }

    throw error;
  }

  if (isMockAiGenerationMode()) {
    console.info("[campaign-generation] Using explicit mock generation mode.");
    return {
      result: generateMockCampaignIdeas(input),
      generationMode: "mock",
      tokensUsed: 0,
    };
  }

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

    return {
      result: validateGenerationResult(parseModelJson(content)),
      generationMode: "openai",
      tokensUsed: response.usage?.total_tokens ?? null,
    };
  } catch (error) {
    throw toCampaignGenerationError(error);
  }
}
