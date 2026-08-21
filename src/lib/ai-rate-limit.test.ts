import { describe, expect, it } from "vitest";
import { getAiRateLimitStatus } from "./ai-rate-limit";

describe("getAiRateLimitStatus", () => {
  it("allows the first two calls inside the 120s window", () => {
    const state = getAiRateLimitStatus("user-1", [{ at: 10_000, count: 1 }], 100_000);

    expect(state.allowed).toBe(true);
    expect(state.remaining).toBe(1);
    expect(state.retryAfterSeconds).toBe(0);
  });

  it("blocks additional calls after the two-request limit is reached", () => {
    const state = getAiRateLimitStatus(
      "user-2",
      [
        { at: 90_000, count: 1 },
        { at: 150_000, count: 1 },
      ],
      200_000
    );

    expect(state.allowed).toBe(false);
    expect(state.remaining).toBe(0);
    expect(state.retryAfterSeconds).toBeGreaterThan(0);
  });
});
