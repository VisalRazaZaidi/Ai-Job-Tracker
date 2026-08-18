"use client";

import type { Job } from "@prisma/client";
import { PIPELINE_STAGES, stageHex } from "@/features/jobs/status";
import { SectionLabel } from "@/features/ui/SectionLabel";

// Deliberately subordinate to the pipeline and Attention: a tight label→number
// list, not another grid of equal-weight tiles. The pipeline already carries the
// lifecycle counts; this is the at-a-glance recap beside it.
export function QuickStatus({ jobs }: { jobs: Job[] }) {
  const rows = [
    { key: "total", label: "Total", value: jobs.length, hex: "var(--accent)" },
    ...PIPELINE_STAGES.filter((s) => s.key !== "wishlist").map((s) => ({
      key: s.key,
      label: s.label,
      value: jobs.filter((j) => (s.statuses as readonly string[]).includes(j.status)).length,
      hex: stageHex(s),
    })),
  ];

  return (
    <section className="rounded-md border border-line bg-surface p-4">
      <SectionLabel>Quick status</SectionLabel>
      <dl className="mt-2 divide-y divide-line">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center justify-between py-2">
            <dt className="flex items-center gap-2 text-sm text-muted">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: r.hex }} aria-hidden />
              {r.label}
            </dt>
            <dd className="font-mono text-sm font-semibold tabular-nums text-fg">{r.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
