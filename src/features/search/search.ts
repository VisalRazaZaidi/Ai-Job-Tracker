import type { Job, Recruiter, Resume, JobStatus } from "@prisma/client";
import type { SavedAnalysis } from "@/features/ai/hooks";

// Global search — deterministic, client-side, user-scoped (all inputs come from
// owner-scoped caches, so there is no cross-user data to leak). No AI, no
// embeddings, no external service (§31/§32). Pure functions only; the React
// layer lives in GlobalSearch.tsx.

export type SearchType = "application" | "contact" | "resume" | "analysis";

export interface SearchResult {
  id: string;
  type: SearchType;
  title: string;
  subtitle: string; // secondary context line (may be empty)
  href: string; // deep link into the existing product area
  score: number; // ranking weight; exposed for tests + ordering
  status?: JobStatus; // applications only → status pill
  date?: string | Date; // analyses only → date line (component formats)
}

export interface SearchGroup {
  type: SearchType;
  label: string;
  results: SearchResult[];
}

export interface SearchData {
  jobs: Job[];
  recruiters: Recruiter[];
  resumes: Resume[];
  analyses: SavedAnalysis[];
}

// case-insensitive, whitespace- and punctuation-tolerant: fold everything that
// isn't a letter/number to a single space. "Full-Stack", "full stack" and
// "FULL  STACK" all normalize to "full stack" (§11).
export function normalizeSearchText(s: string): string {
  return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

// Field tiers (§12): a match in a primary field outranks the same match in
// metadata, which outranks a match buried in long content.
const TIER = { primary: 60, meta: 30, content: 10 } as const;
// How the query sits in the field, best → worst.
const EXACT = 40;
const STARTS = 20;
const CONTAINS = 10;
const ALLTERMS = 0; // multi-term query whose terms are all present but scattered

function fieldScore(qNorm: string, qTerms: string[], value: string | null | undefined, tier: number): number {
  if (!value) return 0;
  const v = normalizeSearchText(value);
  if (!v) return 0;
  if (v === qNorm) return tier + EXACT;
  if (v.startsWith(qNorm)) return tier + STARTS;
  if (v.includes(qNorm)) return tier + CONTAINS;
  if (qTerms.length > 1 && qTerms.every((t) => v.includes(t))) return tier + ALLTERMS;
  return 0;
}

function scoreFields(qNorm: string, qTerms: string[], fields: Array<[string | null | undefined, number]>): number {
  let best = 0;
  for (const [value, tier] of fields) {
    const s = fieldScore(qNorm, qTerms, value, tier);
    if (s > best) best = s;
  }
  return best;
}

function ts(value: string | Date): number {
  return new Date(value).getTime();
}

// ── Result builders (shared by search + recent) ─────────────────────────────

function jobResult(job: Job, score: number): SearchResult {
  const loc = job.location?.trim();
  return {
    id: job.id,
    type: "application",
    title: job.position,
    subtitle: [job.company, loc].filter(Boolean).join(" · "),
    status: job.status,
    href: `/dashboard/workspace?jobId=${job.id}`,
    score,
  };
}

function recruiterResult(r: Recruiter, score: number): SearchResult {
  return {
    id: r.id,
    type: "contact",
    title: r.name,
    subtitle: r.company ?? r.email ?? "",
    href: `/dashboard/recruiters?q=${encodeURIComponent(r.name)}`,
    score,
  };
}

function resumeResult(r: Resume, score: number): SearchResult {
  return {
    id: r.id,
    type: "resume",
    title: r.name,
    subtitle: r.parentId ? "Tailored" : "Master",
    href: `/dashboard/resumes?resume=${r.id}`,
    score,
  };
}

// Analyses carry jobId but not the joined job, so we cross-reference the jobs
// cache for context (§17). Legacy analyses with no jobId fall back to the
// Analyze history page — we never fabricate a job relationship.
function analysisResult(a: SavedAnalysis, job: Job | undefined, score: number): SearchResult {
  return {
    id: a.id,
    type: "analysis",
    title: job ? job.position : a.title,
    subtitle: job ? job.company : "Standalone analysis",
    href: job ? `/dashboard/workspace?jobId=${job.id}` : "/dashboard/analyze",
    date: a.createdAt,
    score,
  };
}

// ── Ranking ──────────────────────────────────────────────────────────────────

interface Candidate {
  score: number;
  ts: number;
  title: string;
  make: () => SearchResult;
}

function rank(cands: Candidate[], limit: number): SearchResult[] {
  return cands
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score || b.ts - a.ts || a.title.localeCompare(b.title))
    .slice(0, limit)
    .map((c) => c.make());
}

// ── Public API ────────────────────────────────────────────────────────────────

const GROUP_LABEL: Record<SearchType, string> = {
  application: "Applications",
  contact: "Contacts",
  resume: "Resumes",
  analysis: "Analyses",
};

// Search everything the user already has cached. Returns non-empty groups in a
// fixed order (§13): Applications → Contacts → Resumes → Analyses. Empty query
// returns [] — the caller shows the empty/recent state instead.
export function searchAll(query: string, data: SearchData, limitPerGroup = 5): SearchGroup[] {
  const qNorm = normalizeSearchText(query);
  if (!qNorm) return [];
  const qTerms = qNorm.split(" ").filter(Boolean);
  const jobById = new Map(data.jobs.map((j) => [j.id, j]));

  const applications = rank(
    data.jobs.map((job) => {
      const score = scoreFields(qNorm, qTerms, [
        [job.position, TIER.primary],
        [job.company, TIER.primary],
        [job.location, TIER.meta],
        [job.source, TIER.meta],
        [job.status, TIER.meta],
        [job.notes, TIER.content],
        [job.description, TIER.content],
      ]);
      return { score, ts: ts(job.updatedAt), title: job.position, make: () => jobResult(job, score) };
    }),
    limitPerGroup
  );

  const contacts = rank(
    data.recruiters.map((r) => {
      const score = scoreFields(qNorm, qTerms, [
        [r.name, TIER.primary],
        [r.company, TIER.primary],
        [r.email, TIER.meta],
        [r.phone, TIER.meta],
        [r.notes, TIER.content],
      ]);
      return { score, ts: ts(r.updatedAt), title: r.name, make: () => recruiterResult(r, score) };
    }),
    limitPerGroup
  );

  const resumes = rank(
    data.resumes.map((r) => {
      const score = scoreFields(qNorm, qTerms, [
        [r.name, TIER.primary],
        [r.parentId ? "tailored" : "master", TIER.meta],
        [r.content, TIER.content],
      ]);
      return { score, ts: ts(r.updatedAt), title: r.name, make: () => resumeResult(r, score) };
    }),
    limitPerGroup
  );

  const analyses = rank(
    data.analyses.map((a) => {
      const job = a.jobId ? jobById.get(a.jobId) : undefined;
      const score = scoreFields(qNorm, qTerms, [
        [a.title, TIER.primary],
        [job?.position, TIER.primary],
        [job?.company, TIER.primary],
        [a.result?.companySummary, TIER.meta],
        [a.description, TIER.content],
      ]);
      return { score, ts: ts(a.createdAt), title: a.title, make: () => analysisResult(a, job, score) };
    }),
    limitPerGroup
  );

  const groups: SearchGroup[] = [];
  for (const [type, results] of [
    ["application", applications],
    ["contact", contacts],
    ["resume", resumes],
    ["analysis", analyses],
  ] as const) {
    if (results.length) groups.push({ type, label: GROUP_LABEL[type], results });
  }
  return groups;
}

// Empty-query state: the most recently touched records across every entity,
// derived from existing data (§19). Not persisted, not "recent searches".
export function recentItems(data: SearchData, limit = 7): SearchResult[] {
  const jobById = new Map(data.jobs.map((j) => [j.id, j]));
  const cands: Candidate[] = [
    ...data.jobs.map((job) => ({ score: 1, ts: ts(job.updatedAt), title: job.position, make: () => jobResult(job, 0) })),
    ...data.recruiters.map((r) => ({ score: 1, ts: ts(r.updatedAt), title: r.name, make: () => recruiterResult(r, 0) })),
    ...data.resumes.map((r) => ({ score: 1, ts: ts(r.updatedAt), title: r.name, make: () => resumeResult(r, 0) })),
    ...data.analyses.map((a) => {
      const job = a.jobId ? jobById.get(a.jobId) : undefined;
      return { score: 1, ts: ts(a.createdAt), title: a.title, make: () => analysisResult(a, job, 0) };
    }),
  ];
  return cands.sort((a, b) => b.ts - a.ts || a.title.localeCompare(b.title)).slice(0, limit).map((c) => c.make());
}
