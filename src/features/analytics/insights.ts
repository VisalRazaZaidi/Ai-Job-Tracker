import type { JobStatus } from "@prisma/client";
import { PIPELINE_STAGES } from "@/features/jobs/status";

// Deterministic analytics for the Insights page. Every function is pure — data
// in, metrics out — and `now` is injected rather than read from the clock, so
// the whole module is unit-testable and reproducible (no AI, §40).
//
// Honest-data contract: rates and averages return `null` (not 0/NaN/∞) whenever
// the denominator is empty, so the UI can say "Not enough data" instead of
// showing a misleading zero (§7).

// One recorded application: the immutable snapshot's historical bits (appliedAt,
// matchScore) joined with the job's CURRENT status, so outcome rates reflect
// where each application stands now. This is exactly what GET /api/applications
// returns. `appliedAt` is a string over the wire, a Date in tests — both parse.
export type ApplicationRecord = {
  id: string;
  appliedAt: string | Date;
  matchScore: number | null;
  status: JobStatus;
};

// Reuse the pipeline taxonomy (status.ts) as the single source of truth — no
// second lifecycle definition (§39). "Reached interview" means the application
// is currently in an interview stage or has advanced past it (an offer).
const stageStatuses = (key: string): readonly JobStatus[] =>
  PIPELINE_STAGES.find((s) => s.key === key)!.statuses;

const INTERVIEW_OR_BEYOND = new Set<JobStatus>([
  ...stageStatuses("interview"),
  ...stageStatuses("offer"),
]);
const OFFER_STATUSES = new Set<JobStatus>(stageStatuses("offer"));

const round = (n: number) => Math.round(n);
const avg = (xs: number[]) => round(xs.reduce((a, b) => a + b, 0) / xs.length);
const DAY = 86_400_000;

// ── KPIs ──────────────────────────────────────────────────────────────────

export type ApplicationStats = {
  total: number;
  interviewed: number;
  offers: number;
  interviewRate: number | null; // percentage 0..100, null when total === 0
  offerRate: number | null;
};

export function applicationStats(apps: ApplicationRecord[]): ApplicationStats {
  const total = apps.length;
  const interviewed = apps.filter((a) => INTERVIEW_OR_BEYOND.has(a.status)).length;
  const offers = apps.filter((a) => OFFER_STATUSES.has(a.status)).length;
  return {
    total,
    interviewed,
    offers,
    interviewRate: total ? round((interviewed / total) * 100) : null,
    offerRate: total ? round((offers / total) * 100) : null,
  };
}

// ── Match Score intelligence ────────────────────────────────────────────────

export type MatchStats = {
  count: number; // applications with a recorded (non-null) score
  average: number | null;
  highest: number | null;
  lowest: number | null;
};

// Uses only the historical scores recorded at apply time (§13), and ignores
// applications with no recorded score so nulls never drag the average down.
export function matchStats(apps: ApplicationRecord[]): MatchStats {
  const scores = apps
    .map((a) => a.matchScore)
    .filter((s): s is number => s !== null);
  if (scores.length === 0) return { count: 0, average: null, highest: null, lowest: null };
  return {
    count: scores.length,
    average: avg(scores),
    highest: Math.max(...scores),
    lowest: Math.min(...scores),
  };
}

export type MatchBucket = { label: string; min: number; max: number; count: number };

export function matchDistribution(apps: ApplicationRecord[]): MatchBucket[] {
  const buckets: MatchBucket[] = [
    { label: "80–100", min: 80, max: 100, count: 0 },
    { label: "60–79", min: 60, max: 79, count: 0 },
    { label: "40–59", min: 40, max: 59, count: 0 },
    { label: "0–39", min: 0, max: 39, count: 0 },
  ];
  for (const a of apps) {
    if (a.matchScore === null) continue;
    const b = buckets.find((b) => a.matchScore! >= b.min && a.matchScore! <= b.max);
    if (b) b.count++;
  }
  return buckets;
}

export type OutcomeComparison = {
  interviewed: { count: number; average: number };
  notInterviewed: { count: number; average: number };
};

// Compares the average recorded Match Score of applications that reached an
// interview against those that didn't. Returns null unless BOTH groups have
// enough scored samples — a 1-vs-1 comparison would be noise, not a signal
// (§16). This is observed correlation only; the UI must not imply causation.
export function matchByOutcome(
  apps: ApplicationRecord[],
  minPerGroup = 3,
): OutcomeComparison | null {
  const scored = apps.filter(
    (a): a is ApplicationRecord & { matchScore: number } => a.matchScore !== null,
  );
  const yes = scored.filter((a) => INTERVIEW_OR_BEYOND.has(a.status));
  const no = scored.filter((a) => !INTERVIEW_OR_BEYOND.has(a.status));
  if (yes.length < minPerGroup || no.length < minPerGroup) return null;
  return {
    interviewed: { count: yes.length, average: avg(yes.map((a) => a.matchScore)) },
    notInterviewed: { count: no.length, average: avg(no.map((a) => a.matchScore)) },
  };
}

// ── Activity over time ──────────────────────────────────────────────────────

export type WeekBucket = { weekStart: string; label: string; count: number };

// Local calendar-week start (Monday), at local midnight — avoids the off-by-one
// that UTC boundaries cause near midnight (§31).
function startOfWeek(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = (x.getDay() + 6) % 7; // Mon=0 … Sun=6
  x.setDate(x.getDate() - dow);
  return x;
}

// Applications per week over the trailing `weeks` windows, oldest → newest.
// Grouped on appliedAt (the real application event, §9), never updatedAt.
export function weeklyActivity(
  apps: ApplicationRecord[],
  now: Date,
  weeks = 8,
): WeekBucket[] {
  const firstStart = startOfWeek(now);
  firstStart.setDate(firstStart.getDate() - (weeks - 1) * 7);

  const bins: WeekBucket[] = Array.from({ length: weeks }, (_, i) => {
    const ws = new Date(firstStart);
    ws.setDate(ws.getDate() + i * 7);
    return {
      weekStart: ws.toISOString(),
      label: ws.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      count: 0,
    };
  });

  for (const a of apps) {
    const ws = startOfWeek(new Date(a.appliedAt));
    // Round, not floor: DST-shifted weeks aren't exactly 7×24h.
    const idx = Math.round((ws.getTime() - firstStart.getTime()) / (7 * DAY));
    if (idx >= 0 && idx < weeks) bins[idx].count++;
  }
  return bins;
}

export type PeriodComparison = {
  current: number;
  previous: number;
  deltaPct: number | null; // null when previous === 0 (no baseline, §20)
};

// Applications in the last `days` vs the `days` before that.
export function periodComparison(
  apps: ApplicationRecord[],
  now: Date,
  days = 30,
): PeriodComparison {
  const end = now.getTime();
  const win = days * DAY;
  const curStart = end - win;
  const prevStart = end - 2 * win;

  let current = 0;
  let previous = 0;
  for (const a of apps) {
    const t = new Date(a.appliedAt).getTime();
    if (t > curStart && t <= end) current++;
    else if (t > prevStart && t <= curStart) previous++;
  }
  return {
    current,
    previous,
    deltaPct: previous === 0 ? null : round(((current - previous) / previous) * 100),
  };
}

// ── Funnel (over all tracked jobs, incl. Wishlist) ──────────────────────────

export type FunnelStats = {
  stages: { key: string; label: string; count: number }[];
  appliedToInterview: number | null; // percentage, null when denominator is 0
  interviewToOffer: number | null;
};

// Current pipeline position per stage (reusing PIPELINE_STAGES), plus the two
// adjacent step-down rates. NOTE: these compare *current* bucket counts, not
// tracked cohorts — status is a single mutable field with no stage history, so
// an application that interviewed then got rejected now sits in Rejected. The
// UI surfaces this caveat in the data notes rather than overstating "conversion".
export function funnelStats(jobs: { status: JobStatus }[]): FunnelStats {
  const count = (key: string) => {
    const st = stageStatuses(key) as readonly string[];
    return jobs.filter((j) => st.includes(j.status)).length;
  };
  const stages = PIPELINE_STAGES.map((s) => ({ key: s.key, label: s.label, count: count(s.key) }));
  const applied = count("applied");
  const interview = count("interview");
  const offer = count("offer");
  return {
    stages,
    appliedToInterview: applied ? round((interview / applied) * 100) : null,
    interviewToOffer: interview ? round((offer / interview) * 100) : null,
  };
}
