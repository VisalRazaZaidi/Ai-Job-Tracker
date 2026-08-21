"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Analysis } from "@prisma/client";
import type { JobAnalysis } from "./schema";
import type { MatchResult } from "./matcher";

export interface AiUsageStatus {
  maxCalls: number;
  windowMs: number;
  remaining: number;
  allowed: boolean;
  retryAfterSeconds: number;
  resetAt: number;
  used: number;
}

// A saved analysis with its JSON result narrowed to the shape we wrote.
export type SavedAnalysis = Omit<Analysis, "result"> & { result: JobAnalysis };

const KEY = ["analyses"];

async function json<T>(res: Response, fallback: string): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(typeof body?.error === "string" ? body.error : fallback);
  }
  return res.json();
}

export function useAnalyses() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => fetch("/api/ai/analyses").then((r) => json<SavedAnalysis[]>(r, "Failed to load history")),
  });
}

// Analyses for one Job (AI Workspace), newest first. Keyed under the base
// ["analyses"] key so useAnalyzeJob's invalidation refreshes it too.
export function useJobAnalyses(jobId: string | undefined) {
  return useQuery({
    queryKey: [...KEY, jobId],
    queryFn: () =>
      fetch(`/api/ai/analyses?jobId=${jobId}`).then((r) =>
        json<SavedAnalysis[]>(r, "Failed to load analyses")
      ),
    enabled: !!jobId,
  });
}

// Two mutually-exclusive entry modes (mirrors analyzeJobInputSchema):
//   { description } — paste-a-JD (Analyze page)
//   { jobId }       — Workspace; server reads the Job's saved description.
type AnalyzeInput = ({ description: string } | { jobId: string }) & { model?: string };

export function useAnalyzeJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AnalyzeInput) =>
      fetch("/api/ai/analyze-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }).then((r) => json<SavedAnalysis>(r, "Analysis failed")),
    // Invalidating the base key refreshes both the full history and any
    // per-job list (["analyses", jobId]) via React Query's prefix match.
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteAnalysis() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/ai/analyses/${id}`, { method: "DELETE" }).then((r) => json(r, "Delete failed")),
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: KEY });
      const previous = qc.getQueryData<SavedAnalysis[]>(KEY);
      qc.setQueryData<SavedAnalysis[]>(KEY, (old) => old?.filter((a) => a.id !== id));
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(KEY, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useAiUsageStatus() {
  return useQuery({
    queryKey: ["ai-usage"],
    queryFn: () =>
      fetch("/api/ai/usage").then((r) =>
        json<AiUsageStatus>(r, "Failed to load AI usage")
      ),
    refetchInterval: (query) => {
      const status = query.state.data as AiUsageStatus | undefined;
      return status && !status.allowed ? 1000 : false;
    },
  });
}

export function useTailorResume() {
  return useMutation({
    mutationFn: async (input: { resumeId: string; jobId: string; model?: string }) => {
      const res = await fetch("/api/ai/tailor-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = typeof body?.error === "string" ? body.error : "Tailoring failed";
        throw new Error(msg);
      }
      return res.json() as Promise<{ tailored: string }>;
    },
  });
}

// Calculate match score between job analysis and resume.
// Deterministic, no AI calls.
export function useMatchScore(
  jobId: string | undefined,
  resumeId: string | undefined,
  hasAnalysis = true
) {
  return useQuery({
    queryKey: ["match", jobId, resumeId, hasAnalysis],
    queryFn: () =>
      fetch("/api/ai/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, resumeId }),
      }).then((r) => json<MatchResult>(r, "Failed to calculate match")),
    enabled: !!jobId && !!resumeId && hasAnalysis,
  });
}
