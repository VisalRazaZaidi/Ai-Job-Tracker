"use client";

import { JOB_STATUSES } from "./schema";

export type StatusFilter = "ALL" | (typeof JOB_STATUSES)[number];

export function JobFilters({
  query,
  status,
  onQuery,
  onStatus,
}: {
  query: string;
  status: StatusFilter;
  onQuery: (v: string) => void;
  onStatus: (v: StatusFilter) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <input
        type="search"
        aria-label="Search jobs"
        placeholder="Search company, position, location, notes…"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        className="flex-1 rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-accent"
      />
      <select
        aria-label="Filter by status"
        value={status}
        onChange={(e) => onStatus(e.target.value as StatusFilter)}
        className="rounded-md border border-line bg-surface px-3 py-2 text-sm"
      >
        <option value="ALL">All statuses</option>
        {JOB_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}
