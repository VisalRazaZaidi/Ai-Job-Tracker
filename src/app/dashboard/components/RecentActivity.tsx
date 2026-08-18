"use client";

import Link from "next/link";
import type { Job, Recruiter } from "@prisma/client";
import { SectionLabel } from "@/features/ui/SectionLabel";
import { fmtDate } from "@/features/shared/dates";

// createdAt ≈ updatedAt (within 2s) means the row was just created, not edited.
function wasCreated(row: { createdAt: Date | string; updatedAt: Date | string }) {
  return Math.abs(new Date(row.updatedAt).getTime() - new Date(row.createdAt).getTime()) < 2000;
}

// Honest derivation from updatedAt across both entities — NOT a real event log.
// Preserved as-is from the old Overview; do not present it as more than it is.
export function RecentActivity({ jobs, recruiters }: { jobs: Job[]; recruiters: Recruiter[] }) {
  const activity = [
    ...jobs.map((j) => ({
      id: `j-${j.id}`,
      title: `${j.position} · ${j.company}`,
      verb: wasCreated(j) ? "Added job" : "Updated job",
      href: "/dashboard/jobs",
      at: j.updatedAt,
    })),
    ...recruiters.map((r) => ({
      id: `r-${r.id}`,
      title: r.name,
      verb: wasCreated(r) ? "Added contact" : "Updated contact",
      href: "/dashboard/recruiters",
      at: r.updatedAt,
    })),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 6);

  return (
    <section className="rounded-md border border-line bg-surface p-4">
      <SectionLabel>Recent activity</SectionLabel>
      {activity.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No activity yet.</p>
      ) : (
        <ul className="mt-2 divide-y divide-line">
          {activity.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
              <Link href={a.href} className="min-w-0">
                <div className="truncate text-sm text-fg hover:text-accent">{a.title}</div>
                <div className="text-xs text-muted">{a.verb}</div>
              </Link>
              <span className="shrink-0 font-mono text-[11px] text-muted">{fmtDate(a.at)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
