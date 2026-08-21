"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Dialog } from "@/features/ui/Dialog";
import { Button } from "@/features/ui/Button";
import { useJobs } from "@/features/jobs/hooks";
import { useRecruiters } from "@/features/recruiters/hooks";
import { useResumes } from "@/features/resumes/hooks";
import { useAnalyses } from "@/features/ai/hooks";
import { statusStyle } from "@/features/jobs/status";
import { searchAll, recentItems, type SearchData, type SearchResult } from "./search";

// Global search entry point for the dashboard shell. A compact header trigger +
// Ctrl/Cmd+K opens a command-style overlay that searches every owner-scoped
// cache client-side (see search.ts). The data-fetching SearchPanel only mounts
// while open, so datasets aren't loaded on every dashboard page view.
export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setIsMac(/mac|iphone|ipad/i.test(navigator.userAgent)), []);

  // Ctrl/Cmd+K anywhere; "/" only when not already typing somewhere (§7).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === "k") {
        e.preventDefault();
        setOpen(true);
      } else if (k === "/" && !isTypingTarget(e.target)) {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search the workspace"
        aria-keyshortcuts="Control+K Meta+K"
        className="flex items-center gap-2 rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm text-muted shadow-hard transition-colors hover:text-fg"
      >
        <Search size={15} aria-hidden />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden rounded border border-line bg-raised px-1 font-mono text-[10px] text-muted sm:inline-block" aria-hidden>
          {isMac ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>

      <Dialog open={open} title="Search" onClose={() => setOpen(false)} initialFocusRef={inputRef}>
        <SearchPanel inputRef={inputRef} onNavigate={() => setOpen(false)} />
      </Dialog>
    </>
  );
}

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

function SearchPanel({
  inputRef,
  onNavigate,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  onNavigate: () => void;
}) {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const jobsQ = useJobs();
  const recruitersQ = useRecruiters();
  const resumesQ = useResumes();
  const analysesQ = useAnalyses();

  const isError = jobsQ.isError || recruitersQ.isError || resumesQ.isError || analysesQ.isError;
  const noData = !jobsQ.data && !recruitersQ.data && !resumesQ.data && !analysesQ.data;
  // Only "loading" while we have nothing to show yet — cached data renders instantly.
  const isLoading = (jobsQ.isLoading || recruitersQ.isLoading || resumesQ.isLoading || analysesQ.isLoading) && noData;

  function retry() {
    if (jobsQ.isError) jobsQ.refetch();
    if (recruitersQ.isError) recruitersQ.refetch();
    if (resumesQ.isError) resumesQ.refetch();
    if (analysesQ.isError) analysesQ.refetch();
  }

  const data: SearchData = useMemo(
    () => ({
      jobs: jobsQ.data ?? [],
      recruiters: recruitersQ.data ?? [],
      resumes: resumesQ.data ?? [],
      analyses: analysesQ.data ?? [],
    }),
    [jobsQ.data, recruitersQ.data, resumesQ.data, analysesQ.data]
  );

  const trimmed = query.trim();
  const groups = useMemo(() => searchAll(query, data), [query, data]);
  const recent = useMemo(() => recentItems(data), [data]);

  // Flat, index-ordered list that keyboard navigation walks (§20). Empty query
  // navigates the Recent list; an active query navigates the grouped results.
  const visible = trimmed ? groups.flatMap((g) => g.results) : recent;
  const active = Math.min(activeIndex, Math.max(visible.length - 1, 0));

  useEffect(() => setActiveIndex(0), [query]);
  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function go(result: SearchResult | undefined) {
    if (!result) return;
    router.push(result.href);
    onNavigate();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(() => Math.min(active + 1, visible.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(() => Math.max(active - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(visible[active]);
    }
  }

  // Assign each rendered result its flat index so highlight + aria line up.
  let counter = 0;
  const optId = (i: number) => `${listId}-opt-${i}`;

  return (
    <div>
      <div className="flex items-center gap-2 rounded-md border border-line bg-raised px-3">
        <Search size={16} className="shrink-0 text-muted" aria-hidden />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search jobs, contacts, resumes, analyses…"
          aria-label="Search the workspace"
          role="combobox"
          aria-expanded={visible.length > 0}
          aria-controls={listId}
          aria-activedescendant={visible.length ? optId(active) : undefined}
          aria-autocomplete="list"
          autoComplete="off"
          className="w-full bg-transparent py-2.5 text-sm text-fg outline-none placeholder:text-muted"
        />
      </div>

      <div ref={listRef} className="mt-3 max-h-[60vh] overflow-y-auto">
        {isLoading ? (
          <StatusRow>Searching…</StatusRow>
        ) : isError ? (
          <div className="py-8 text-center">
            <p className="text-sm text-fg">Search couldn&apos;t load your data.</p>
            <div className="mt-3 flex justify-center">
              <Button variant="secondary" onClick={retry}>
                Try Again
              </Button>
            </div>
          </div>
        ) : !trimmed ? (
          <EmptyQuery
            recent={recent}
            listId={listId}
            active={active}
            optId={optId}
            onPick={go}
            onHover={setActiveIndex}
          />
        ) : groups.length === 0 ? (
          <NoResults query={trimmed} />
        ) : (
          <div role="listbox" id={listId} aria-label="Search results" className="space-y-4">
            {groups.map((group) => (
              <div key={group.type} role="group" aria-label={group.label}>
                <div className="mb-1.5 flex items-baseline justify-between px-1">
                  <span className="section-label">{group.label}</span>
                  <span className="font-mono text-[10px] text-muted">
                    {group.results.length} result{group.results.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="space-y-1">
                  {group.results.map((r) => {
                    const i = counter++;
                    return (
                      <ResultRow
                        key={r.type + r.id}
                        result={r}
                        id={optId(i)}
                        active={i === active}
                        onPick={() => go(r)}
                        onHover={() => setActiveIndex(i)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyQuery({
  recent,
  listId,
  active,
  optId,
  onPick,
  onHover,
}: {
  recent: SearchResult[];
  listId: string;
  active: number;
  optId: (i: number) => string;
  onPick: (r: SearchResult) => void;
  onHover: (i: number) => void;
}) {
  return (
    <div>
      <p className="px-1 text-sm text-muted">Find jobs, contacts, resumes and analyses across your workspace.</p>
      {recent.length > 0 && (
        <div role="listbox" id={listId} aria-label="Recent" className="mt-4">
          <div className="mb-1.5 px-1">
            <span className="section-label">Recent</span>
          </div>
          <div className="space-y-1">
            {recent.map((r, i) => (
              <ResultRow
                key={r.type + r.id}
                result={r}
                id={optId(i)}
                active={i === active}
                onPick={() => onPick(r)}
                onHover={() => onHover(i)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NoResults({ query }: { query: string }) {
  return (
    <div className="py-8 text-center">
      <p className="text-sm text-muted">
        No results for <span className="font-medium text-fg">&ldquo;{query}&rdquo;</span>
      </p>
      <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
        Try searching for a job, company, recruiter, resume, or analysis.
      </p>
    </div>
  );
}

function StatusRow({ children }: { children: React.ReactNode }) {
  return <p className="py-8 text-center text-sm text-muted">{children}</p>;
}

// One result. role=option so the input's combobox/listbox semantics are complete
// (§22). Type-specific context: status pill for applications, date for analyses.
function ResultRow({
  result,
  id,
  active,
  onPick,
  onHover,
}: {
  result: SearchResult;
  id: string;
  active: boolean;
  onPick: () => void;
  onHover: () => void;
}) {
  return (
    <div
      id={id}
      role="option"
      aria-selected={active}
      data-active={active || undefined}
      onClick={onPick}
      onMouseEnter={onHover}
      className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 ${
        active ? "border-line bg-surface" : "border-transparent hover:bg-surface"
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm text-fg">{result.title}</div>
        {result.subtitle && <div className="truncate text-xs text-muted">{result.subtitle}</div>}
      </div>
      {result.status && (
        <span
          className="shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase"
          style={statusStyle(result.status)}
        >
          {result.status.toLowerCase()}
        </span>
      )}
      {result.date && (
        <span className="shrink-0 font-mono text-[10px] text-muted">{formatDate(result.date)}</span>
      )}
    </div>
  );
}

function formatDate(d: string | Date): string {
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
