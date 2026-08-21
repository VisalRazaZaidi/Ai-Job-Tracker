"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Job, ApplicationSnapshot } from "@prisma/client";
import type { CreateJobInput, UpdateJobInput } from "./schema";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error((await res.json())?.error ?? res.statusText);
  return res.json();
}

const KEY = ["jobs"];

export function useJobs() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => fetch("/api/jobs").then((r) => json<Job[]>(r)),
  });
}

// One owned job by id (AI Workspace). GET /api/jobs/[id] is ownership-checked, so
// a foreign or missing id 404s → this query errors → the caller shows not-found.
export function useJob(id: string | undefined) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => fetch(`/api/jobs/${id}`).then((r) => json<Job>(r)),
    enabled: !!id,
    retry: false,
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateJobInput) =>
      fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }).then((r) => json<Job>(r)),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateJob(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateJobInput) =>
      fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }).then((r) => json<Job>(r)),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/jobs/${id}`, { method: "DELETE" }).then((r) => json(r)),
    // Optimistic remove; snapshot lets us roll back if the request fails.
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: KEY });
      const previous = qc.getQueryData<Job[]>(KEY);
      qc.setQueryData<Job[]>(KEY, (old) => old?.filter((j) => j.id !== id));
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(KEY, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

// Phase 7 — the recorded application snapshot for a job, or null if not applied
// yet. Keyed under KEY so marking applied (which invalidates KEY) refetches it.
export function useApplication(jobId: string | undefined) {
  return useQuery({
    queryKey: [...KEY, jobId, "application"],
    queryFn: () =>
      fetch(`/api/jobs/${jobId}/apply`).then((r) => json<ApplicationSnapshot | null>(r)),
    enabled: !!jobId,
  });
}

// Mark a job as applied. Idempotent server-side; invalidating KEY refreshes the
// job (new status/date), the jobs list, and this job's application query.
export function useMarkApplied(jobId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { resumeId: string; note?: string }) =>
      fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }).then((r) => json<{ job: Job; snapshot: ApplicationSnapshot }>(r)),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
