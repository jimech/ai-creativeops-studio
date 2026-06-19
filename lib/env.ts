/**
 * Server-side environment validation.
 * Do not import this module from client components.
 */

import "server-only";

export class EnvValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnvValidationError";
  }
}

function requireNonEmptyEnv(name: string): string {
  const value = process.env[name];

  if (!value?.trim()) {
    throw new EnvValidationError(
      `Missing required environment variable: ${name}. Set ${name} before running this feature.`,
    );
  }

  return value.trim();
}

function readOptionalEnv(name: string): string | undefined {
  const value = process.env[name];
  return value?.trim() ? value.trim() : undefined;
}

export function assertAiGenerationModeAllowed(): void {
  if (
    process.env.AI_GENERATION_MODE === "mock" &&
    process.env.NODE_ENV === "production"
  ) {
    throw new EnvValidationError(
      'AI_GENERATION_MODE is set to "mock" in production. Unset AI_GENERATION_MODE or configure real OpenAI generation.',
    );
  }
}

export function isMockAiGenerationMode(): boolean {
  assertAiGenerationModeAllowed();
  return process.env.AI_GENERATION_MODE === "mock";
}

export function getDatabaseUrl(): string {
  return requireNonEmptyEnv("DATABASE_URL");
}

export function getAuthEnv() {
  return {
    secret: requireNonEmptyEnv("AUTH_SECRET"),
    googleId: requireNonEmptyEnv("AUTH_GOOGLE_ID"),
    googleSecret: requireNonEmptyEnv("AUTH_GOOGLE_SECRET"),
    url: requireNonEmptyEnv("AUTH_URL"),
  };
}

export function getOpenAiApiKey(): string {
  assertAiGenerationModeAllowed();

  if (isMockAiGenerationMode()) {
    throw new EnvValidationError(
      "OPENAI_API_KEY is not required while AI_GENERATION_MODE is mock.",
    );
  }

  return requireNonEmptyEnv("OPENAI_API_KEY");
}

export function getStripeServerEnv() {
  return {
    secretKey: requireNonEmptyEnv("STRIPE_SECRET_KEY"),
    proPriceId: requireNonEmptyEnv("STRIPE_PRO_PRICE_ID"),
    agencyPriceId: requireNonEmptyEnv("STRIPE_AGENCY_PRICE_ID"),
    appUrl: requireNonEmptyEnv("NEXT_PUBLIC_APP_URL"),
  };
}

export function getStripeWebhookSecret(): string {
  return requireNonEmptyEnv("STRIPE_WEBHOOK_SECRET");
}

export function isStripeConfigured(): boolean {
  const keys = [
    "STRIPE_SECRET_KEY",
    "STRIPE_PRO_PRICE_ID",
    "STRIPE_AGENCY_PRICE_ID",
    "NEXT_PUBLIC_APP_URL",
  ] as const;

  return keys.every((key) => Boolean(readOptionalEnv(key)));
}
