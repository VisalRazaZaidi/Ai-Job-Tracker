"use client";

import Link from "next/link";
import { useJobs } from "@/features/jobs/hooks";
import { useApplications } from "@/features/analytics/hooks";
import { SectionLabel } from "@/features/ui/SectionLabel";
import { Button } from "@/features/ui/Button";
import { stageByKey, stageHex } from "@/features/jobs/status";
import {
  applicationStats,
  matchStats,
  matchDistribution,
  matchByOutcome,
  weeklyActivity,
  periodComparison,
  funnelStats,
  type MatchBucket,
  type MatchStats,
  type FunnelStats,
  type WeekBucket,
  type PeriodComparison,
} from "@/features/analytics/insights";

// Insights — deterministic job-search analytics derived client-side from the
// owner-scoped applications + jobs caches (no analytics API, §25). Every metric
// answers a decision question; insufficient data reads as "Not enough data",
// never a misleading 0/NaN/∞ (§7). No AI (§40).
export default function InsightsPage() {
  const jobsQ = useJobs();
  const appsQ = useApplications();

  if (jobsQ.isLoading || appsQ.isLoading) return <InsightsSkeleton />;
  if (jobsQ.error || appsQ.error || !jobsQ.data || !appsQ.data) {
    return (
      <ErrorState
        onRetry={() => {
          jobsQ.refetch();
          appsQ.refetch();
        }}
      />
    );
  }

  const jobs = jobsQ.data;
  const apps = appsQ.data;

  // Brand-new user: nothing tracked at all → guide, don't show empty charts (§21).
  if (jobs.length === 0) return <EmptyState />;

  const now = new Date();
  const stats = applicationStats(apps);
  const match = matchStats(apps);
  const funnel = funnelStats(jobs);
  const weekly = weeklyActivity(apps, now, 8);
  const period = periodComparison(apps, now, 30);
  const outcome = matchByOutcome(apps);
  const noApplications = apps.length === 0;

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-lg font-semibold text-fg">Insights</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          What your application history shows — how much you&apos;re applying, how far
          applications progress, and where your Match Scores land.
        </p>
      </header>

      <KpiRow stats={stats} match={match} tracked={jobs.length} />

      {noApplications ? (
        <NotAppliedYet tracked={jobs.length} />
      ) : (
        <ActivitySection weekly={weekly} period={period} />
      )}

      <FunnelSection funnel={funnel} />

      {!noApplications && <MatchSection match={match} dist={matchDistribution(apps)} outcome={outcome} />}

      <DataNotes />
    </div>
  );
}

// ── KPI summary ─────────────────────────────────────────────────────────────

function KpiRow({ stats, match, tracked }: { stats: ReturnType<typeof applicationStats>; match: MatchStats; tracked: number }) {
  return (
    <section>
      <SectionLabel>Summary</SectionLabel>
      <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Applications"
          value={String(stats.total)}
          hint={`of ${tracked} tracked job${tracked === 1 ? "" : "s"}`}
        />
        <Kpi
          label="Interview rate"
          value={stats.interviewRate === null ? null : `${stats.interviewRate}%`}
          fallback="Not enough data"
          hint={stats.interviewRate === null ? undefined : `${stats.interviewed} of ${stats.total} reached interview`}
        />
        <Kpi
          label="Offer rate"
          value={stats.offerRate === null ? null : `${stats.offerRate}%`}
          fallback="Not enough data"
          hint={stats.offerRate === null ? undefined : `${stats.offers} of ${stats.total} reached offer`}
        />
        <Kpi
          label="Average match"
          value={match.average === null ? null : String(match.average)}
          fallback="No recorded scores yet"
          suffix={match.average === null ? undefined : " / 100"}
          color={match.average === null ? undefined : matchColor(match.average)}
          hint={match.average === null ? undefined : `across ${match.count} scored application${match.count === 1 ? "" : "s"}`}
        />
      </div>
    </section>
  );
}

function Kpi({
  label,
  value,
  fallback,
  suffix,
  hint,
  color,
}: {
  label: string;
  value: string | null;
  fallback?: string;
  suffix?: string;
  hint?: string;
  color?: string;
}) {
  return (
    <div className="rounded-md border border-line bg-surface p-4 shadow-hard">
      <div className="section-label">{label}</div>
      {value === null ? (
        <div className="mt-2 text-sm text-muted">{fallback}</div>
      ) : (
        <>
          <div className="mt-1 font-mono text-3xl font-semibold tabular-nums" style={color ? { color } : undefined}>
            <span className={color ? undefined : "text-fg"}>{value}</span>
            {suffix && <span className="text-base font-normal text-muted">{suffix}</span>}
          </div>
          {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
        </>
      )}
    </div>
  );
}

// ── Application activity ────────────────────────────────────────────────────

function ActivitySection({ weekly, period }: { weekly: WeekBucket[]; period: PeriodComparison }) {
  const max = Math.max(...weekly.map((w) => w.count), 1);
  const windowTotal = weekly.reduce((n, w) => n + w.count, 0);
  const peak = weekly.reduce((a, w) => (w.count > a.count ? w : a), weekly[0]);
  const summary =
    windowTotal === 0
      ? "No applications recorded in the last 8 weeks."
      : `${windowTotal} application${windowTotal === 1 ? "" : "s"} over the last 8 weeks` +
        (peak.count > 0 ? `, most in the week of ${peak.label}.` : ".");

  return (
    <section>
      <SectionLabel>Application activity</SectionLabel>
      <div className="mt-2 rounded-md border border-line bg-surface p-5 shadow-hard">
        <p className="text-sm text-fg">{summary}</p>

        <div className="mt-5 flex h-40 items-end gap-1.5" role="img" aria-label={summary}>
          {weekly.map((w) => (
            <div key={w.weekStart} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span className="font-mono text-[10px] tabular-nums text-muted">{w.count || ""}</span>
              <div
                className="w-full rounded-sm bg-accent"
                style={{ height: `${(w.count / max) * 100}%`, minHeight: w.count ? 4 : 0 }}
                aria-hidden
              />
            </div>
          ))}
        </div>
        <div className="mt-1 flex gap-1.5" aria-hidden>
          {weekly.map((w) => (
            <span key={w.weekStart} className="flex-1 text-center font-mono text-[10px] text-muted">
              {w.label}
            </span>
          ))}
        </div>

        <p className="mt-5 border-t border-line pt-4 text-sm text-muted">
          <span className="text-fg">Last 30 days:</span>{" "}
          <span className="font-mono tabular-nums text-fg">{period.current}</span>{" "}
          application{period.current === 1 ? "" : "s"} ·{" "}
          <span className="text-fg">previous 30:</span>{" "}
          <span className="font-mono tabular-nums text-fg">{period.previous}</span>
          {period.deltaPct === null ? (
            <span> · no previous-period baseline</span>
          ) : (
            <span className={period.deltaPct >= 0 ? " text-green-500" : " text-red-500"}>
              {" "}
              · {period.deltaPct >= 0 ? "+" : ""}
              {period.deltaPct}%
            </span>
          )}
        </p>
      </div>
    </section>
  );
}

// ── Funnel ──────────────────────────────────────────────────────────────────

function FunnelSection({ funnel }: { funnel: FunnelStats }) {
  const max = Math.max(...funnel.stages.map((s) => s.count), 1);
  return (
    <section>
      <SectionLabel>Application funnel</SectionLabel>
      <div className="mt-2 rounded-md border border-line bg-surface p-5 shadow-hard">
        <ul className="space-y-2.5">
          {funnel.stages.map((s) => {
            const stage = stageByKey(s.key);
            const hex = stage ? stageHex(stage) : "#64748b";
            return (
              <li key={s.key} className="flex items-center gap-3">
                <span className="w-20 shrink-0 font-mono text-xs uppercase tracking-wide text-muted">{s.label}</span>
                <div className="h-6 flex-1 overflow-hidden rounded-sm bg-raised">
                  <div
                    className="flex h-full items-center rounded-sm"
                    style={{ width: `${Math.max((s.count / max) * 100, s.count ? 6 : 0)}%`, background: hex }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right font-mono text-sm tabular-nums text-fg">{s.count}</span>
              </li>
            );
          })}
        </ul>

        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4">
          <Conversion label="Applied → Interview" pct={funnel.appliedToInterview} />
          <Conversion label="Interview → Offer" pct={funnel.interviewToOffer} />
        </div>
      </div>
    </section>
  );
}

function Conversion({ label, pct }: { label: string; pct: number | null }) {
  return (
    <div>
      <div className="section-label">{label}</div>
      {pct === null ? (
        <div className="mt-1 text-sm text-muted">Not enough data</div>
      ) : (
        <div className="mt-1 font-mono text-2xl font-semibold tabular-nums text-fg">{pct}%</div>
      )}
    </div>
  );
}

// ── Match intelligence ──────────────────────────────────────────────────────

function MatchSection({ match, dist, outcome }: { match: MatchStats; dist: MatchBucket[]; outcome: ReturnType<typeof matchByOutcome> }) {
  return (
    <section>
      <SectionLabel>Match intelligence</SectionLabel>
      <div className="mt-2 space-y-5 rounded-md border border-line bg-surface p-5 shadow-hard">
        {match.count === 0 ? (
          <p className="text-sm text-muted">
            No Match Scores were recorded with your applications yet. Run the job analysis before
            marking a job as applied to capture one.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2">
              <Stat label="Average" value={match.average!} suffix="/100" color={matchColor(match.average!)} />
              <Stat label="Highest" value={match.highest!} />
              <Stat label="Lowest" value={match.lowest!} />
            </div>

            <div className="border-t border-line pt-4">
              <div className="section-label mb-3">Score distribution</div>
              <DistributionBars dist={dist} />
            </div>

            {outcome && (
              <div className="border-t border-line pt-4">
                <div className="section-label mb-2">Match score by outcome</div>
                <p className="text-sm text-fg">
                  Interviewed applications averaged{" "}
                  <span className="font-mono font-semibold" style={{ color: matchColor(outcome.interviewed.average) }}>
                    {outcome.interviewed.average}
                  </span>{" "}
                  ({outcome.interviewed.count}); those that didn&apos;t averaged{" "}
                  <span className="font-mono font-semibold" style={{ color: matchColor(outcome.notInterviewed.average) }}>
                    {outcome.notInterviewed.average}
                  </span>{" "}
                  ({outcome.notInterviewed.count}).
                </p>
                <p className="mt-1 text-xs text-muted">
                  An observed difference in your history — not proof that a higher score causes interviews.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function DistributionBars({ dist }: { dist: MatchBucket[] }) {
  const max = Math.max(...dist.map((b) => b.count), 1);
  return (
    <ul className="space-y-2">
      {dist.map((b) => (
        <li key={b.label} className="flex items-center gap-3">
          <span className="w-16 shrink-0 font-mono text-xs tabular-nums text-muted">{b.label}</span>
          <div className="h-5 flex-1 overflow-hidden rounded-sm bg-raised">
            <div
              className="h-full rounded-sm"
              style={{ width: `${Math.max((b.count / max) * 100, b.count ? 6 : 0)}%`, background: bucketColor(b.min) }}
            />
          </div>
          <span className="w-8 shrink-0 text-right font-mono text-sm tabular-nums text-fg">{b.count}</span>
        </li>
      ))}
    </ul>
  );
}

function Stat({ label, value, suffix, color }: { label: string; value: number; suffix?: string; color?: string }) {
  return (
    <div>
      <div className="section-label">{label}</div>
      <div className="mt-1 font-mono text-2xl font-semibold tabular-nums" style={color ? { color } : undefined}>
        <span className={color ? undefined : "text-fg"}>{value}</span>
        {suffix && <span className="text-sm font-normal text-muted">{suffix}</span>}
      </div>
    </div>
  );
}

// ── Data notes, empty / insufficient / loading / error states ───────────────

function DataNotes() {
  return (
    <section>
      <SectionLabel>Data notes</SectionLabel>
      <ul className="mt-2 space-y-1.5 rounded-md border border-line bg-surface p-5 text-xs leading-relaxed text-muted">
        <li>
          <span className="text-fg">Applications</span> are jobs you&apos;ve marked as applied; interview and
          offer rates are the share of those that currently sit in an interview or offer stage.
        </li>
        <li>
          <span className="text-fg">Average match</span> uses the Match Score recorded at the moment each
          application was submitted — not a live recalculation.
        </li>
        <li>
          <span className="text-fg">Funnel steps</span> compare current pipeline position, not tracked cohorts:
          status is a single field with no stage history, so an application that interviewed then was rejected
          now counts under Rejected.
        </li>
        <li>
          <span className="text-fg">Deferred:</span> source and role performance (source is free text, not
          normalized) and employer response time (no response timestamp is recorded) — omitted rather than
          estimated unreliably.
        </li>
      </ul>
    </section>
  );
}

function NotAppliedYet({ tracked }: { tracked: number }) {
  return (
    <section className="rounded-md border border-dashed border-line p-8 text-center">
      <p className="text-sm text-fg">
        You&apos;re tracking {tracked} job{tracked === 1 ? "" : "s"}, but haven&apos;t recorded any applications yet.
      </p>
      <p className="mt-1 text-sm text-muted">
        Mark a job as applied in the AI Workspace to unlock activity and Match Score analytics.
      </p>
      <div className="mt-4 flex justify-center">
        <Link href="/dashboard/workspace">
          <Button variant="primary">Open AI Workspace</Button>
        </Link>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div>
      <h1 className="text-lg font-semibold text-fg">Insights</h1>
      <div className="mt-4 rounded-md border border-dashed border-line p-8 text-center">
        <p className="text-sm text-fg">Your analytics will appear as you track applications.</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted">
          Start by adding jobs, preparing them in the AI Workspace, and marking them as applied. Your
          activity, funnel, and Match Score trends build up from there.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Link href="/dashboard/jobs">
            <Button variant="primary">Add a job</Button>
          </Link>
          <Link href="/dashboard/workspace">
            <Button variant="secondary">AI Workspace</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function InsightsSkeleton() {
  return (
    <div className="animate-pulse space-y-10">
      <div>
        <div className="h-6 w-40 rounded bg-surface" />
        <div className="mt-2 h-4 w-96 max-w-full rounded bg-surface" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-md border border-line bg-surface" />
        ))}
      </div>
      <div className="h-56 rounded-md border border-line bg-surface" />
      <div className="h-56 rounded-md border border-line bg-surface" />
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-md border border-line bg-surface p-8 text-center">
      <p className="text-sm text-fg">Insights couldn&apos;t be loaded.</p>
      <div className="mt-4 flex justify-center">
        <Button variant="secondary" onClick={onRetry}>
          Try Again
        </Button>
      </div>
    </div>
  );
}

// ── Color helpers (reuse the Match Score semantic language, §34) ─────────────

function matchColor(score: number) {
  if (score >= 75) return "#22c55e"; // green
  if (score >= 50) return "#f59e0b"; // amber
  return "#ef4444"; // red
}

// Distribution bucket hue keyed off its lower bound, echoing the score language.
function bucketColor(min: number) {
  if (min >= 80) return "#22c55e";
  if (min >= 60) return "#f59e0b";
  if (min >= 40) return "#ef4444";
  return "#991b1b"; // dim red for the weakest band
}
