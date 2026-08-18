"use client";

import type { Job } from "@prisma/client";
import { ExternalLink, Pencil } from "lucide-react";
import { statusStyle } from "./status";
import { Dialog } from "@/features/ui/Dialog";
import { Button } from "@/features/ui/Button";

// Dates arrive from the API as ISO strings (JSON), though the Prisma type says
// Date — so accept both and format defensively.
function fmtDate(v: Date | string | null) {
  if (!v) return null;
  return new Date(v).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function JobDetailDialog({
  job,
  onClose,
  onEdit,
}: {
  job: Job;
  onClose: () => void;
  onEdit: (job: Job) => void;
}) {
  // Only the meta rows that actually have a value get shown.
  const meta: [string, string | null][] = [
    ["Source", job.source],
    ["Work mode", job.workMode],
    ["Salary", job.salary],
    ["Applied", fmtDate(job.dateApplied)],
    ["Follow-up", fmtDate(job.nextFollowUp)],
  ];
  const filledMeta = meta.filter(([, v]) => v);

  return (
    <Dialog open onClose={onClose} title={`${job.position} at ${job.company}`}>
      <span
        style={statusStyle(job.status)}
        className="inline-block rounded-full border px-2.5 py-1 font-mono text-[11px] font-medium tracking-wide"
      >
        {job.status}
      </span>

      {filledMeta.length > 0 && (
        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3">
          {filledMeta.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-medium text-muted">{label}</dt>
              <dd className="mt-0.5 text-sm text-fg">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {job.jobLink && (
        <a
          href={job.jobLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
        >
          Open posting <ExternalLink size={14} />
        </a>
      )}

      {job.description && (
        <Section title="Job description">{job.description}</Section>
      )}
      {job.notes && <Section title="Notes">{job.notes}</Section>}

      <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
        <span className="text-xs text-muted">Added {fmtDate(job.createdAt)}</span>
        <Button variant="primary" onClick={() => onEdit(job)}>
          <Pencil size={14} /> Edit
        </Button>
      </div>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h3 className="mb-1.5 text-xs font-medium text-muted">{title}</h3>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-fg">{children}</p>
    </section>
  );
}
