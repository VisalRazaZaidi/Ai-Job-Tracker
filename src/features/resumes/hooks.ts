"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Resume } from "@prisma/client";
import type { CreateResumeInput, UpdateResumeInput } from "./schema";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(typeof body?.error === "string" ? body.error : res.statusText);
  }
  return res.json();
}

const KEY = ["resumes"];

export function useResumes() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => fetch("/api/resumes").then((r) => json<Resume[]>(r)),
  });
}

export function useCreateResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateResumeInput) =>
      fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }).then((r) => json<Resume>(r)),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

// Multipart upload → server extracts text → new resume. No Content-Type header:
// the browser sets the multipart boundary itself.
export function useImportResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const body = new FormData();
      body.append("file", file);
      return fetch("/api/resumes/import", { method: "POST", body }).then((r) => json<Resume>(r));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateResume(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateResumeInput) =>
      fetch(`/api/resumes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }).then((r) => json<Resume>(r)),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/resumes/${id}`, { method: "DELETE" }).then((r) => json(r)),
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: KEY });
      const previous = qc.getQueryData<Resume[]>(KEY);
      qc.setQueryData<Resume[]>(KEY, (old) => old?.filter((r) => r.id !== id));
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(KEY, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
