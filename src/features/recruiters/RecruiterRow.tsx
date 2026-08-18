"use client";

import type { Recruiter } from "@prisma/client";
import { Linkedin, Mail, Phone, Trash2 } from "lucide-react";
import { useDeleteRecruiter } from "./hooks";
import { Button } from "@/features/ui/Button";

function fmtDate(v: Date | string) {
  return new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// A follow-up is "due" once its day has arrived or passed.
function isDue(v: Date | string) {
  const d = new Date(v);
  d.setHours(23, 59, 59, 999);
  return d.getTime() <= Date.now();
}

export function RecruiterRow({
  recruiter,
  onEdit,
}: {
  recruiter: Recruiter;
  onEdit: (recruiter: Recruiter) => void;
}) {
  const del = useDeleteRecruiter();
  const follow = recruiter.nextFollowUp;

  return (
    <li className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-raised">
      <button
        onClick={() => onEdit(recruiter)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-raised font-mono text-xs text-muted">
          {recruiter.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <div className="truncate font-medium text-fg">{recruiter.name}</div>
          <div className="truncate text-sm text-muted">
            {recruiter.company ?? recruiter.email ?? "—"}
          </div>
        </div>
      </button>

      <div className="flex shrink-0 items-center gap-1">
        {follow && (
          <span
            className={`rounded-full border px-2.5 py-1 font-mono text-[11px] font-medium tracking-wide ${
              isDue(follow)
                ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                : "border-line text-muted"
            }`}
          >
            Follow up {fmtDate(follow)}
          </span>
        )}

        {recruiter.email && (
          <a
            aria-label={`Email ${recruiter.name}`}
            href={`mailto:${recruiter.email}`}
            className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface hover:text-fg"
          >
            <Mail size={16} />
          </a>
        )}
        {recruiter.phone && (
          <a
            aria-label={`Call ${recruiter.name}`}
            href={`tel:${recruiter.phone}`}
            className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface hover:text-fg"
          >
            <Phone size={16} />
          </a>
        )}
        {recruiter.linkedinUrl && (
          <a
            aria-label={`${recruiter.name} on LinkedIn`}
            href={recruiter.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface hover:text-fg"
          >
            <Linkedin size={16} />
          </a>
        )}

        <Button
          variant="ghost"
          size="icon"
          aria-label={`Delete ${recruiter.name}`}
          onClick={() => del.mutate(recruiter.id)}
          className="hover:text-red-400"
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </li>
  );
}
