"use client";

import { useMemo, useState } from "react";
import type { Recruiter } from "@prisma/client";
import { Plus } from "lucide-react";
import { useRecruiters } from "@/features/recruiters/hooks";
import { RecruiterFormDialog } from "@/features/recruiters/RecruiterFormDialog";
import { RecruiterRow } from "@/features/recruiters/RecruiterRow";
import { Button } from "@/features/ui/Button";

// Case-insensitive match across the text fields worth searching.
function matchesQuery(r: Recruiter, q: string) {
  if (!q) return true;
  const hay = [r.name, r.company, r.email, r.notes]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(q.toLowerCase());
}

export default function RecruitersPage() {
  const { data: recruiters, isLoading, error } = useRecruiters();

  const [query, setQuery] = useState("");
  // dialog: undefined = closed, null = create, Recruiter = edit that recruiter.
  const [dialog, setDialog] = useState<Recruiter | null | undefined>(undefined);

  const filtered = useMemo(
    () => (recruiters ?? []).filter((r) => matchesQuery(r, query)),
    [recruiters, query]
  );

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-fg">Contacts</h1>
        <Button variant="primary" size="sm" onClick={() => setDialog(null)}>
          <Plus size={16} /> New recruiter
        </Button>
      </div>

      {isLoading && <p className="text-muted">Loading recruiters…</p>}
      {error && <p className="text-red-400">Failed to load recruiters.</p>}

      {recruiters && (
        <>
          <input
            type="search"
            aria-label="Search recruiters"
            placeholder="Search name, company, email, notes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mb-4 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-accent"
          />

          {filtered.length === 0 ? (
            <p className="rounded-md border border-dashed border-line p-8 text-center text-muted">
              {recruiters.length === 0
                ? "No recruiters yet. Add your first contact."
                : "No recruiters match your search."}
            </p>
          ) : (
            <ul className="divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
              {filtered.map((recruiter) => (
                <RecruiterRow
                  key={recruiter.id}
                  recruiter={recruiter}
                  onEdit={(r) => setDialog(r)}
                />
              ))}
            </ul>
          )}
        </>
      )}

      {dialog !== undefined && (
        <RecruiterFormDialog
          recruiter={dialog ?? undefined}
          onClose={() => setDialog(undefined)}
        />
      )}
    </>
  );
}
