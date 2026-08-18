"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Recruiter } from "@prisma/client";
import type { CreateRecruiterInput, UpdateRecruiterInput } from "./schema";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error((await res.json())?.error ?? res.statusText);
  return res.json();
}

const KEY = ["recruiters"];

export function useRecruiters() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => fetch("/api/recruiters").then((r) => json<Recruiter[]>(r)),
  });
}

export function useCreateRecruiter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRecruiterInput) =>
      fetch("/api/recruiters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }).then((r) => json<Recruiter>(r)),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateRecruiter(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateRecruiterInput) =>
      fetch(`/api/recruiters/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }).then((r) => json<Recruiter>(r)),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteRecruiter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/recruiters/${id}`, { method: "DELETE" }).then((r) => json(r)),
    // Optimistic remove; snapshot lets us roll back if the request fails.
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: KEY });
      const previous = qc.getQueryData<Recruiter[]>(KEY);
      qc.setQueryData<Recruiter[]>(KEY, (old) => old?.filter((r) => r.id !== id));
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(KEY, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
