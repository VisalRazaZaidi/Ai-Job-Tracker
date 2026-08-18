"use client";

import Link from "next/link";
import type { Job } from "@prisma/client";
import { PIPELINE_STAGES, stageHex } from "@/features/jobs/status";
import { SectionLabel } from "@/features/ui/SectionLabel";

// The lifecycle as a spectrum: each stage is a clickable cell that deep-links to
// Applications filtered to that stage (?stage=<key>). Counts and filter share
// PIPELINE_STAGES, so what you see here matches what you land on.
export function ApplicationPipeline({ jobs }: { jobs: Job[] }) {
  const stages = PIPELINE_STAGES.map((s) => ({
    ...s,
    hex: stageHex(s),
    count: jobs.filter((j) => (s.statuses as readonly string[]).includes(j.status)).length,
  }));

  return (
    <section className="mb-8">
      <SectionLabel>Application pipeline</SectionLabel>
      {/* gap-px over a line-colored bg draws wrap-safe separators, so the 3+2
          mobile grid keeps clean gridlines without horizontal overflow. */}
      <ol className="mt-2 grid grid-cols-3 gap-px overflow-hidden rounded-md border border-line bg-line shadow-hard sm:grid-cols-5">
        {stages.map((s) => (
          <li key={s.key} className="bg-surface">
            <Link
              href={`/dashboard/jobs?stage=${s.key}`}
              aria-label={`${s.count} ${s.label} application${s.count === 1 ? "" : "s"}`}
              className="flex h-full flex-col justify-between gap-3 p-4 transition-colors hover:bg-raised"
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.hex }} aria-hidden />
                <span className="section-label">{s.label}</span>
              </span>
              <span
                className="font-mono text-3xl font-semibold tabular-nums"
                style={{ color: s.hex }}
              >
                {s.count}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
