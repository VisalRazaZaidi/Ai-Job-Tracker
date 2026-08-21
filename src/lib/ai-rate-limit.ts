export interface AiCallWindow {
  at: number;
  count: number;
}

export interface AiRateLimitStatus {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  resetAt: number;
}

export const AI_RATE_LIMIT_MAX_CALLS = 2;
export const AI_RATE_LIMIT_WINDOW_MS = 120_000;

export function getAiRateLimitStatus(
  userId: string,
  callHistory: AiCallWindow[] = [],
  now = Date.now()
): AiRateLimitStatus {
  const recent = callHistory
    .filter((entry) => entry.at > now - AI_RATE_LIMIT_WINDOW_MS)
    .sort((a, b) => a.at - b.at);

  const countInWindow = recent.reduce((sum, entry) => sum + entry.count, 0);
  const remaining = Math.max(AI_RATE_LIMIT_MAX_CALLS - countInWindow, 0);

  const lastTimestamp = recent[recent.length - 1]?.at ?? now;
  const resetAt = lastTimestamp + AI_RATE_LIMIT_WINDOW_MS;

  const allowed = countInWindow < AI_RATE_LIMIT_MAX_CALLS;
  const retryAfterSeconds = allowed
    ? 0
    : Math.max(1, Math.ceil((resetAt - now) / 1000));

  return {
    allowed,
    remaining,
    retryAfterSeconds,
    resetAt,
  };
}

export function getAiRateLimitErrorMessage(retryAfterSeconds: number) {
  return `AI usage limit reached. Please wait ${retryAfterSeconds}s before running another AI request.`;
}
