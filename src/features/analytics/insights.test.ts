import { describe, it, expect } from "vitest";
import type { JobStatus } from "@prisma/client";
import {
  applicationStats,
  matchStats,
  matchDistribution,
  matchByOutcome,
  weeklyActivity,
  periodComparison,
  funnelStats,
  type ApplicationRecord,
} from "./insights";

// Fixed clock — analytics are deterministic, so tests inject `now` (local time)
// and never touch the real clock. Aug 21 2026 is a Friday; its week is Mon Aug 17.
const NOW = new Date(2026, 7, 21, 12, 0, 0);

let seq = 0;
function app(status: JobStatus, matchScore: number | null, appliedAt: Date = NOW): ApplicationRecord {
  return { id: `a${seq++}`, status, matchScore, appliedAt };
}

describe("applicationStats", () => {
  it("empty dataset → zero counts and null rates (no NaN)", () => {
    const s = applicationStats([]);
    expect(s).toEqual({ total: 0, interviewed: 0, offers: 0, interviewRate: null, offerRate: null });
  });

  it("counts interviewed (incl. offers) and offers, and derives rates", () => {
    const s = applicationStats([
      app("APPLIED", null),
      app("INTERVIEW", null),
      app("OFFER", null),
      app("REJECTED", null),
    ]);
    expect(s.total).toBe(4);
    expect(s.interviewed).toBe(2); // INTERVIEW + OFFER (offer counts as "reached interview")
    expect(s.offers).toBe(1);
    expect(s.interviewRate).toBe(50);
    expect(s.offerRate).toBe(25);
  });

  it("ACCEPTED counts as an offer and rounds the rate", () => {
    const s = applicationStats([app("ACCEPTED", null), app("APPLIED", null), app("APPLIED", null)]);
    expect(s.offers).toBe(1);
    expect(s.offerRate).toBe(33); // 1/3 → 33
    expect(s.interviewRate).toBe(33);
  });
});

describe("matchStats", () => {
  it("ignores null scores when averaging", () => {
    const s = matchStats([app("APPLIED", 80), app("APPLIED", null), app("INTERVIEW", 60)]);
    expect(s).toEqual({ count: 2, average: 70, highest: 80, lowest: 60 });
  });

  it("all-null (or empty) → count 0 and null stats", () => {
    expect(matchStats([app("APPLIED", null)])).toEqual({
      count: 0,
      average: null,
      highest: null,
      lowest: null,
    });
    expect(matchStats([]).average).toBeNull();
  });
});

describe("matchDistribution", () => {
  it("buckets scores by band and skips nulls", () => {
    const d = matchDistribution([
      app("APPLIED", 100),
      app("APPLIED", 80),
      app("APPLIED", 79),
      app("APPLIED", 60),
      app("APPLIED", 59),
      app("APPLIED", 40),
      app("APPLIED", 39),
      app("APPLIED", 0),
      app("APPLIED", null),
    ]);
    expect(d.map((b) => b.count)).toEqual([2, 2, 2, 2]); // 80–100, 60–79, 40–59, 0–39
  });

  it("empty → all buckets zero", () => {
    expect(matchDistribution([]).map((b) => b.count)).toEqual([0, 0, 0, 0]);
  });
});

describe("matchByOutcome", () => {
  it("returns null when either group is below the sample floor", () => {
    expect(matchByOutcome([app("INTERVIEW", 90), app("APPLIED", 70)])).toBeNull();
    expect(matchByOutcome([])).toBeNull();
  });

  it("compares average score of interviewed vs not, when both groups are large enough", () => {
    const c = matchByOutcome([
      app("INTERVIEW", 90),
      app("INTERVIEW", 85),
      app("OFFER", 95),
      app("APPLIED", 70),
      app("APPLIED", 75),
      app("REJECTED", 60),
    ]);
    expect(c).not.toBeNull();
    expect(c!.interviewed).toEqual({ count: 3, average: 90 });
    expect(c!.notInterviewed).toEqual({ count: 3, average: 68 }); // (70+75+60)/3 = 68.3 → 68
  });
});

describe("weeklyActivity", () => {
  it("empty → the right number of zero-count weeks (no broken chart)", () => {
    const w = weeklyActivity([], NOW, 8);
    expect(w).toHaveLength(8);
    expect(w.every((b) => b.count === 0)).toBe(true);
  });

  it("groups by local week and drops anything older than the window", () => {
    const w = weeklyActivity(
      [
        app("APPLIED", null, new Date(2026, 7, 20)), // this week (Mon Aug 17)
        app("APPLIED", null, new Date(2026, 7, 19)), // this week
        app("APPLIED", null, new Date(2026, 7, 11)), // previous week (Mon Aug 10)
        app("APPLIED", null, new Date(2026, 5, 1)), // June — outside 8-week window
      ],
      NOW,
      8,
    );
    expect(w).toHaveLength(8);
    expect(w[7].count).toBe(2); // newest bin
    expect(w[6].count).toBe(1);
    expect(w.reduce((n, b) => n + b.count, 0)).toBe(3); // June one excluded
  });
});

describe("periodComparison", () => {
  it("positive growth", () => {
    const c = periodComparison(
      [
        app("APPLIED", null, new Date(2026, 7, 10)), // current 30d
        app("APPLIED", null, new Date(2026, 7, 1)),
        app("APPLIED", null, new Date(2026, 6, 25)),
        app("APPLIED", null, new Date(2026, 6, 1)), // previous 30d
        app("APPLIED", null, new Date(2026, 5, 30)),
      ],
      NOW,
      30,
    );
    expect(c).toEqual({ current: 3, previous: 2, deltaPct: 50 });
  });

  it("negative growth", () => {
    const c = periodComparison(
      [
        app("APPLIED", null, new Date(2026, 7, 10)),
        app("APPLIED", null, new Date(2026, 6, 1)),
        app("APPLIED", null, new Date(2026, 6, 2)),
        app("APPLIED", null, new Date(2026, 6, 3)),
        app("APPLIED", null, new Date(2026, 6, 4)),
      ],
      NOW,
      30,
    );
    expect(c).toEqual({ current: 1, previous: 4, deltaPct: -75 });
  });

  it("zero baseline → null delta (no misleading ∞)", () => {
    const c = periodComparison([app("APPLIED", null, new Date(2026, 7, 10))], NOW, 30);
    expect(c).toEqual({ current: 1, previous: 0, deltaPct: null });
  });
});

describe("funnelStats", () => {
  it("empty → all stages zero, conversions null", () => {
    const f = funnelStats([]);
    expect(f.stages.map((s) => s.count)).toEqual([0, 0, 0, 0, 0]);
    expect(f.appliedToInterview).toBeNull();
    expect(f.interviewToOffer).toBeNull();
  });

  it("counts current pipeline position and adjacent step-downs", () => {
    const f = funnelStats([
      { status: "WISHLIST" },
      { status: "APPLIED" },
      { status: "APPLIED" },
      { status: "APPLIED" },
      { status: "INTERVIEW" },
      { status: "TECHNICAL" }, // interview stage
      { status: "OFFER" },
      { status: "REJECTED" },
    ]);
    const counts = Object.fromEntries(f.stages.map((s) => [s.key, s.count]));
    expect(counts).toEqual({ wishlist: 1, applied: 3, interview: 2, offer: 1, rejected: 1 });
    expect(f.appliedToInterview).toBe(67); // 2/3 → 66.7 → 67
    expect(f.interviewToOffer).toBe(50); // 1/2
  });
});
