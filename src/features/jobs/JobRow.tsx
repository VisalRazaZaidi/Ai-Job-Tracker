"use client";

import type { Job } from "@prisma/client";
import { Pencil, Trash2 } from "lucide-react";
import { JOB_STATUSES } from "./schema";
import { statusStyle, statusHex } from "./status";
import { useUpdateJob, useDeleteJob } from "./hooks";
import { Button } from "@/features/ui/Button";

export function JobRow({
  job,
  onEdit,
  onOpen,
}: {
  job: Job;
  onEdit: (job: Job) => void;
  onOpen: (job: Job) => void;
}) {
  const update = useUpdateJob(job.id);
  const del = useDeleteJob();

  return (
    <li className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-raised">
      <button
        onClick={() => onOpen(job)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: statusHex(job.status) }}
          aria-hidden
        />
        <div className="min-w-0">
          <div className="truncate font-medium text-fg">{job.position}</div>
          <div className="truncate text-sm text-muted">
            {job.company}
            {job.location ? ` · ${job.location}` : ""}
          </div>
        </div>
      </button>

      <div className="flex shrink-0 items-center gap-1">
        <select
          aria-label={`Status for ${job.position}`}
          value={job.status}
          disabled={update.isPending}
          onChange={(e) => update.mutate({ status: e.target.value as Job["status"] })}
          style={statusStyle(job.status)}
          className="rounded-full border px-2.5 py-1 font-mono text-[11px] font-medium tracking-wide outline-none disabled:opacity-50"
        >
          {JOB_STATUSES.map((s) => (
            <option key={s} value={s} className="bg-surface text-fg">
              {s}
            </option>
          ))}
        </select>

        <Button
          variant="ghost"
          size="icon"
          aria-label={`Edit ${job.position} at ${job.company}`}
          onClick={() => onEdit(job)}
        >
          <Pencil size={16} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          aria-label={`Delete ${job.position} at ${job.company}`}
          onClick={() => del.mutate(job.id)}
          className="hover:text-red-400"
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </li>
  );
}
