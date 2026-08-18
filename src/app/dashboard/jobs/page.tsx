"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Job } from "@prisma/client";
import { Plus, X } from "lucide-react";
import { useJobs } from "@/features/jobs/hooks";
import { JobFormDialog } from "@/features/jobs/JobFormDialog";
import { JobDetailDialog } from "@/features/jobs/JobDetailDialog";
import { JobRow } from "@/features/jobs/JobRow";
import { JobFilters, type StatusFilter } from "@/features/jobs/JobFilters";
import { Button } from "@/features/ui/Button";
import { stageByKey } from "@/features/jobs/status";

// Case-insensitive match across the text fields worth searching.
function matchesQuery(job: Job, q: string) {
  if (!q) return true;
  const hay = [job.company, job.position, job.location, job.notes]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(q.toLowerCase());
}

function JobsView() {
  const { data: jobs, isLoading, error } = useJobs();
  const router = useRouter();
  const params = useSearchParams();
  // Home's pipeline deep-links here as ?stage=<key>; it groups statuses that the
  // single-status dropdown can't (e.g. Interview = INTERVIEW/ASSESSMENT/…).
  const stage = stageByKey(params.get("stage"));

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  // dialog: undefined = closed, null = create, Job = edit that job.
  const [dialog, setDialog] = useState<Job | null | undefined>(undefined);
  // viewing: the job shown in the read-only detail dialog (undefined = closed).
  const [viewing, setViewing] = useState<Job | undefined>(undefined);

  const clearStage = () => router.replace("/dashboard/jobs");
  // The URL stage wins over the dropdown; touching the dropdown clears it so the
  // two filters never disagree.
  const onStatus = (v: StatusFilter) => {
    if (stage) clearStage();
    setStatus(v);
  };

  const filtered = useMemo(() => {
    const stageStatuses = stage?.statuses as readonly string[] | undefined;
    return (jobs ?? []).filter((j) => {
      const statusOk = stageStatuses
        ? stageStatuses.includes(j.status)
        : status === "ALL" || j.status === status;
      return statusOk && matchesQuery(j, query);
    });
  }, [jobs, stage, status, query]);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-fg">Applications</h1>
        <Button variant="primary" size="sm" onClick={() => setDialog(null)}>
          <Plus size={16} /> New job
        </Button>
      </div>

      {isLoading && <p className="text-muted">Loading jobs…</p>}
      {error && <p className="text-red-400">Failed to load jobs.</p>}

      {jobs && (
        <>
          {stage && (
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-sm text-muted">
                Stage: <span className="font-medium text-fg">{stage.label}</span>
                <button
                  type="button"
                  onClick={clearStage}
                  aria-label="Clear stage filter"
                  className="ml-1 rounded-full text-muted transition hover:text-fg"
                >
                  <X size={14} />
                </button>
              </span>
            </div>
          )}

          <JobFilters query={query} status={status} onQuery={setQuery} onStatus={onStatus} />

          {filtered.length === 0 ? (
            <p className="rounded-md border border-dashed border-line p-8 text-center text-muted">
              {jobs.length === 0
                ? "No jobs yet. Add your first application."
                : "No jobs match the current filters."}
            </p>
          ) : (
            <ul className="divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
              {filtered.map((job) => (
                <JobRow
                  key={job.id}
                  job={job}
                  onEdit={(j) => setDialog(j)}
                  onOpen={(j) => setViewing(j)}
                />
              ))}
            </ul>
          )}
        </>
      )}

      {viewing && (
        <JobDetailDialog
          job={viewing}
          onClose={() => setViewing(undefined)}
          onEdit={(j) => {
            setViewing(undefined);
            setDialog(j);
          }}
        />
      )}

      {dialog !== undefined && (
        <JobFormDialog job={dialog ?? undefined} onClose={() => setDialog(undefined)} />
      )}
    </>
  );
}

// useSearchParams() requires a Suspense boundary for the production build.
export default function JobsPage() {
  return (
    <Suspense fallback={<p className="text-muted">Loading…</p>}>
      <JobsView />
    </Suspense>
  );
}
