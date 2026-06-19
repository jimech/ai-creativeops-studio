/**
 * In-memory rate limiting for MVP / single-instance deployments.
 * Not shared across serverless instances or horizontal scaling.
 */

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetAt: number;
};

export const GENERATION_RATE_LIMIT = {
  limit: 5,
  windowMs: 60_000,
} as const;

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });

    return {
      success: true,
      remaining: limit - 1,
      resetAt,
    };
  }

  if (entry.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  entry.count += 1;

  return {
    success: true,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
  };
}

export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? null;
  }

  return request.headers.get("x-real-ip");
}

export function checkGenerationRateLimit(
  request: Request,
  userId: string | null,
): RateLimitResult {
  const ip = getClientIp(request) ?? "unknown";
  const key = userId ? `generate:user:${userId}` : `generate:ip:${ip}`;

  return checkRateLimit(
    key,
    GENERATION_RATE_LIMIT.limit,
    GENERATION_RATE_LIMIT.windowMs,
  );
}

/** @internal Test helper to reset in-memory state between checks. */
export function resetRateLimitStoreForTests(): void {
  store.clear();
}
