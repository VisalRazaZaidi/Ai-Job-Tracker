"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Job } from "@prisma/client";
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
