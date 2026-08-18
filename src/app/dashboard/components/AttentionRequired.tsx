"use client";

import Link from "next/link";
import type { Job, Recruiter } from "@prisma/client";
import { CheckCircle2 } from "lucide-react";
import { SectionLabel } from "@/features/ui/SectionLabel";
import { fmtDate, isDue, isUpcoming } from "@/features/shared/dates";

type Item = { id: string; label: string; href: string; at: Date | string };

function jobItem(j: Job): Item {
  return { id: `j-${j.id}`, label: `${j.position} · ${j.company}`, href: "/dashboard/jobs", at: j.nextFollowUp! };
}
function recruiterItem(r: Recruiter): Item {
  return { id: `r-${r.id}`, label: r.name, href: "/dashboard/recruiters", at: r.nextFollowUp! };
}

// Only follow-ups: they're the one thing today's schema can flag honestly.
// "Needs a tailored resume" (no Job↔Resume link) and "interview this week"
// (no interview date) are intentionally omitted — see Phase 3 spec §13.
export function AttentionRequired({ jobs, recruiters }: { jobs: Job[]; recruiters: Recruiter[] }) {
  const withFollowUp = [
    ...jobs.filter((j) => j.nextFollowUp).map(jobItem),
    ...recruiters.filter((r) => r.nextFollowUp).map(recruiterItem),
  ];
  const overdue = withFollowUp
    .filter((i) => isDue(i.at))
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  const upcoming = withFollowUp
    .filter((i) => isUpcoming(i.at))
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
    .slice(0, 5);

  return (
    <section className="rounded-md border border-line bg-surface p-4">
      <SectionLabel>Attention required</SectionLabel>

      {overdue.length === 0 && upcoming.length === 0 ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted">
          <CheckCircle2 size={16} className="text-emerald-400" /> You&apos;re all caught up.
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-line">
          {overdue.map((i) => (
            <Row key={i.id} item={i} tone="overdue" note="Overdue" />
          ))}
          {upcoming.map((i) => (
            <Row key={i.id} item={i} tone="upcoming" note={`Due ${fmtDate(i.at)}`} />
          ))}
        </ul>
      )}
    </section>
  );
}

function Row({ item, tone, note }: { item: Item; tone: "overdue" | "upcoming"; note: string }) {
  const pill =
    tone === "overdue"
      ? "border-red-500/40 bg-red-500/10 text-red-400"
      : "border-amber-500/40 bg-amber-500/10 text-amber-400";
  return (
    <li className="flex items-center justify-between gap-3 py-2.5">
      <Link href={item.href} className="min-w-0 truncate text-sm text-fg hover:text-accent">
        {item.label}
      </Link>
      <span className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[11px] ${pill}`}>
        {note}
      </span>
    </li>
  );
}
