"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Job } from "@prisma/client";
import { ArrowLeft, ChevronDown, ChevronRight, ExternalLink, Search } from "lucide-react";
import { useJobs, useJob } from "@/features/jobs/hooks";
import { useJobAnalyses, useAnalyzeJob, useMatchScore } from "@/features/ai/hooks";
import { useResumes } from "@/features/resumes/hooks";
import { statusStyle, statusHex } from "@/features/jobs/status";
import { Button } from "@/features/ui/Button";
import { SectionLabel } from "@/features/ui/SectionLabel";
import { AnalysisResult } from "@/features/ai/AnalysisResult";
import { MatchScore } from "@/features/ai/MatchScore";
import { fmtDate } from "@/features/shared/dates";

// The AI Workspace is a job-centric surface, not a wizard: the selected Job lives
// in the URL (?jobId=), so refresh / back-forward / a shared link all resolve to
// the same application. No job → a purposeful picker. Job → its context + analysis.

// ── Job picker (no job selected) ───────────────────────────────────────────
function JobPicker() {
  const { data: jobs, isLoading, error } = useJobs();
  const [query, setQuery] = useState("");

  const filtered = (jobs ?? []).filter((j) => {
    if (!query) return true;
    const hay = `${j.position} ${j.company} ${j.location ?? ""}`.toLowerCase();
    return hay.includes(query.toLowerCase());
  });

  return (
    <div className="max-w-2xl">
      <SectionLabel>AI Workspace</SectionLabel>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-fg">
        Choose an application to work on
      </h1>
      <p className="mt-2 text-sm text-muted">
        Select a saved job to analyze, match against your resume, and prepare your application.
      </p>

      {isLoading && <p className="mt-6 text-muted">Loading jobs…</p>}
      {error && <p className="mt-6 text-red-400">Failed to load your jobs.</p>}

      {jobs && jobs.length === 0 && (
        <div className="mt-6 rounded-md border border-dashed border-line p-8 text-center">
          <p className="text-muted">No saved applications yet.</p>
          <Link
            href="/dashboard/jobs"
            className="mt-3 inline-block rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Add your first application
          </Link>
        </div>
      )}

      {jobs && jobs.length > 0 && (
        <>
          <div className="relative mt-6">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jobs…"
              aria-label="Search jobs"
              className="w-full rounded-md border border-line bg-surface py-2 pl-9 pr-3 text-sm text-fg placeholder:text-muted focus:border-accent focus:outline-none"
            />
          </div>

          {filtered.length === 0 ? (
            <p className="mt-6 text-muted">No jobs match “{query}”.</p>
          ) : (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {filtered.map((job) => (
                <li key={job.id}>
                  <Link
                    href={`/dashboard/workspace?jobId=${job.id}`}
                    className="flex h-full flex-col gap-2 rounded-md border border-line bg-surface p-4 transition hover:bg-raised hover:shadow-hard"
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                        style={{ background: statusHex(job.status) }}
                        aria-hidden
                      />
                      <div className="min-w-0">
                        <div className="truncate font-medium text-fg">{job.position}</div>
                        <div className="truncate text-sm text-muted">{job.company}</div>
                      </div>
                    </div>
                    <span
                      style={statusStyle(job.status)}
                      className="w-fit rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium tracking-wide"
                    >
                      {job.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

// ── Persistent job context header (§15) ────────────────────────────────────
function JobHeader({ job }: { job: Job }) {
  return (
    <div className="border-b border-line pb-5">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/dashboard/workspace"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-fg"
        >
          <ArrowLeft size={14} /> All applications
        </Link>
        {job.jobLink && (
          <a
            href={job.jobLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-accent transition hover:underline"
          >
            View posting <ExternalLink size={13} />
          </a>
        )}
      </div>

      <SectionLabel>Working on</SectionLabel>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-fg">{job.position}</h1>
      <p className="text-muted">{job.company}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          style={statusStyle(job.status)}
          className="rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium tracking-wide"
        >
          {job.status}
        </span>
        {job.workMode && (
          <span className="rounded-full border border-line bg-raised px-2.5 py-0.5 font-mono text-[11px] text-fg">
            {job.workMode}
          </span>
        )}
        {job.location && <span className="text-sm text-muted">{job.location}</span>}
        {job.source && <span className="text-sm text-muted">· Source: {job.source}</span>}
      </div>
    </div>
  );
}

// ── Original job description — preserved, read-only, collapsible (§16) ───────
function JobDescription({ job }: { job: Job }) {
  const [open, setOpen] = useState(false);
  if (!job.description) return null;

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 text-muted transition hover:text-fg"
      >
        {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        <SectionLabel>Original job description</SectionLabel>
      </button>
      {open && (
        <div className="mt-2 max-h-96 overflow-y-auto whitespace-pre-wrap rounded-md border border-line bg-surface p-4 text-sm leading-relaxed text-fg">
          {job.description}
        </div>
      )}
    </div>
  );
}

// ── Match score section ────────────────────────────────────────────────────
function MatchSection({ job }: { job: Job }) {
  const { data: resumes, isLoading: resumesLoading } = useResumes();
  const { data: analyses, isLoading: analysesLoading } = useJobAnalyses(job.id);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");

  const masterResumes = (resumes ?? []).filter((r) => !r.parentId);
  const hasAnalysis = (analyses ?? []).length > 0;

  useEffect(() => {
    if (!selectedResumeId && masterResumes[0]) {
      setSelectedResumeId(masterResumes[0].id);
    }
  }, [masterResumes, selectedResumeId]);

  const { data: matchResult, isLoading: matchLoading, error: matchError } = useMatchScore(
    job.id,
    selectedResumeId,
    hasAnalysis
  );

  const selectedResume = resumes?.find((r) => r.id === selectedResumeId);

  return (
    <div className="mt-8">
      <SectionLabel>Match Score</SectionLabel>

      {resumesLoading || analysesLoading ? (
        <p className="mt-4 text-muted">Loading resume and analysis data…</p>
      ) : masterResumes.length === 0 ? (
        <div className="mt-4 rounded-md border border-dashed border-line p-6 text-center">
          <p className="text-sm text-muted">No resumes yet.</p>
          <Link
            href="/dashboard/resumes"
            className="mt-3 inline-block rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Create a resume
          </Link>
        </div>
      ) : !hasAnalysis ? (
        <div className="mt-6 rounded-md border border-line bg-surface p-6">
          <p className="text-sm text-muted">
            This job doesn't have enough skill data yet. Run the job analysis first to extract the
            required skills and keywords.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-4">
            <label htmlFor="resume-select" className="block text-sm font-medium text-fg">
              Select resume to compare
            </label>
            <select
              id="resume-select"
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="mt-2 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-fg transition hover:border-accent focus:border-accent focus:outline-none"
            >
              {masterResumes.map((resume) => (
                <option key={resume.id} value={resume.id}>
                  {resume.name}
                </option>
              ))}
            </select>
          </div>

          {matchLoading ? (
            <div className="mt-6 rounded-md border border-line bg-surface p-6">
              <p className="text-sm text-muted">Calculating match…</p>
            </div>
          ) : matchError ? (
            <div className="mt-6 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-400">{matchError.message}</p>
            </div>
          ) : matchResult?.score !== null && matchResult ? (
            <div className="mt-6">
              <MatchScore result={matchResult} />
            </div>
          ) : (
            <div className="mt-6 rounded-md border border-line bg-surface p-6">
              <p className="text-sm text-muted">
                This job doesn't have enough skill data to calculate a match score yet. 
                {matchResult && (
                  <> Run the job analysis first to extract required skills and keywords.</>
                )}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Honest analyzing state — no fake progress (§12) ─────────────────────────
function AnalyzingState() {
  return (
    <div className="mt-4 rounded-md border border-line bg-surface p-6">
      <SectionLabel>Analyzing job</SectionLabel>
      <p className="mt-2 text-sm text-muted">
        Extracting requirements, skills, and ATS keywords from the job description…
      </p>
      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-raised">
        <div className="h-full w-1/3 animate-pulse rounded-full bg-accent" />
      </div>
    </div>
  );
}

function AnalysisError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3">
      <p className="text-sm text-red-400">{message}</p>
      <Button variant="secondary" size="sm" className="mt-3" onClick={onRetry}>
        Try Again
      </Button>
    </div>
  );
}

// ── Job analysis section (§12, §13, §19) ────────────────────────────────────
function AnalysisSection({ job }: { job: Job }) {
  const { data: analyses, isLoading, isFetching } = useJobAnalyses(job.id);
  const { mutate, isPending, error, reset } = useAnalyzeJob();

  const latest = analyses?.[0];
  const canAnalyze = !!job.description && job.description.trim().length >= 50;
  // Keep the analyzing state up through the post-success refetch so the result
  // doesn't flash the empty state before the new analysis lands.
  const analyzing = isPending || (isFetching && !latest && !isLoading);

  function run() {
    reset();
    mutate({ jobId: job.id });
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
        <SectionLabel>Job analysis</SectionLabel>
        {latest && !analyzing && (
          <span className="font-mono text-[11px] text-muted">
            Last analyzed {fmtDate(latest.createdAt)} · {latest.model}
          </span>
        )}
      </div>

      {isLoading ? (
        <p className="mt-4 text-muted">Loading analysis…</p>
      ) : analyzing ? (
        <AnalyzingState />
      ) : latest ? (
        <div className="mt-4 space-y-4">
          <AnalysisResult data={latest.result} />
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" size="sm" onClick={run} disabled={!canAnalyze}>
              Re-analyze
            </Button>
            <span className="text-xs text-muted">
              {analyses!.length} {analyses!.length === 1 ? "analysis" : "analyses"} saved · re-analyzing keeps history
            </span>
          </div>
          {error && <AnalysisError message={error.message} onRetry={run} />}
        </div>
      ) : (
        <div className="mt-4">
          {canAnalyze ? (
            <>
              <p className="text-sm text-muted">
                Run AI analysis on this job’s saved description to extract required skills, tech
                stack, seniority, and ATS keywords — no need to paste anything.
              </p>
              <Button variant="primary" className="mt-3" onClick={run}>
                Analyze Job
              </Button>
            </>
          ) : (
            <p className="rounded-md border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
              This application has no description to analyze yet.{" "}
              <Link href="/dashboard/jobs" className="text-accent hover:underline">
                Add one on the Applications tab
              </Link>{" "}
              first.
            </p>
          )}
          {error && <AnalysisError message={error.message} onRetry={run} />}
        </div>
      )}
    </div>
  );
}

// ── Selected-job workspace ──────────────────────────────────────────────────
function JobWorkspace({ jobId }: { jobId: string }) {
  const { data: job, isLoading, isError } = useJob(jobId);

  if (isLoading) {
    return (
      <div className="max-w-2xl animate-pulse space-y-4">
        <div className="h-4 w-28 rounded bg-surface" />
        <div className="h-8 w-72 rounded bg-surface" />
        <div className="h-4 w-40 rounded bg-surface" />
        <div className="h-32 rounded bg-surface" />
      </div>
    );
  }

  // Foreign or missing id 404s on the owner-checked endpoint → same safe message
  // either way, so we never leak whether the id exists (§6).
  if (isError || !job) {
    return (
      <div className="max-w-md">
        <SectionLabel>AI Workspace</SectionLabel>
        <h1 className="mt-2 text-xl font-semibold text-fg">Application not found</h1>
        <p className="mt-2 text-sm text-muted">
          This application doesn’t exist or isn’t part of your account.
        </p>
        <Link
          href="/dashboard/workspace"
          className="mt-4 inline-block rounded-md border border-line px-4 py-2 text-sm font-medium text-fg transition hover:bg-surface"
        >
          Choose an application
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <JobHeader job={job} />
      <JobDescription job={job} />
      <AnalysisSection job={job} />
      <MatchSection job={job} />
    </div>
  );
}

function WorkspaceView() {
  const jobId = useSearchParams().get("jobId");
  return jobId ? <JobWorkspace jobId={jobId} /> : <JobPicker />;
}

// useSearchParams() requires a Suspense boundary for the production build.
export default function WorkspacePage() {
  return (
    <Suspense fallback={<p className="text-muted">Loading…</p>}>
      <WorkspaceView />
    </Suspense>
  );
}
