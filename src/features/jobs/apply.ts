import type { JobStatus } from "@prisma/client";

// Phase 7 — Application Lifecycle. The pure, DB-free core of "Mark as Applied":
// the status-transition rule and the snapshot payload builder. Kept free of
// Prisma so it unit-tests like the rest of the repo (matcher/rate-limit/zod).

export type ApplyDecision =
  | { ok: true; changeStatus: boolean }
  | { ok: false; reason: string };

// Reuse the existing JobStatus enum — no new statuses (§14). You record an
// application from WISHLIST (the normal path) or top up a missing snapshot on an
// already-APPLIED job (idempotent, status unchanged). Any later or closed state
// is left alone: we never drag a job backwards from Interview/Offer/Rejected/etc.
export function canMarkApplied(status: JobStatus): ApplyDecision {
  if (status === "WISHLIST") return { ok: true, changeStatus: true };
  if (status === "APPLIED") return { ok: true, changeStatus: false };
  return {
    ok: false,
    reason: "This job has already progressed beyond Applied, so it can't be marked as applied again.",
  };
}

export interface SnapshotInput {
  userId: string;
  job: { id: string; description: string | null; dateApplied: Date | null };
  resume: { id: string; name: string; content: string };
  matchScore: number | null;
  note?: string | null;
  now: Date;
}

export interface SnapshotData {
  userId: string;
  jobId: string;
  resumeId: string;
  resumeName: string;
  resumeContent: string;
  jobDescription: string;
  matchScore: number | null;
  note: string | null;
  appliedAt: Date;
}

// Copy the resume (name + content) and the job description BY VALUE at apply
// time — this is what makes the record immutable (§5, §25). Editing the source
// resume or the job description afterwards can't reach back into a snapshot
// built here. appliedAt prefers the job's existing dateApplied so backfilling a
// legacy APPLIED job keeps its real date rather than stamping "now".
export function buildSnapshotData(input: SnapshotInput): SnapshotData {
  const { userId, job, resume, matchScore, note, now } = input;
  const trimmed = note?.trim();
  return {
    userId,
    jobId: job.id,
    resumeId: resume.id,
    resumeName: resume.name,
    resumeContent: resume.content,
    jobDescription: job.description ?? "",
    matchScore,
    note: trimmed ? trimmed : null,
    appliedAt: job.dateApplied ?? now,
  };
}
