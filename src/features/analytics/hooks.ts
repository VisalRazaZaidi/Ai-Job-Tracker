"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApplicationRecord } from "./insights";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error((await res.json())?.error ?? res.statusText);
  return res.json();
}

// The caller's recorded applications (snapshot history + current job status).
// Owner-scoped server-side; drives the Insights page alongside useJobs().
export function useApplications() {
  return useQuery({
    queryKey: ["applications"],
    queryFn: () => fetch("/api/applications").then((r) => json<ApplicationRecord[]>(r)),
  });
}
