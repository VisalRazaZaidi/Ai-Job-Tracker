# Product & UX Specification v2 — AI Job Tracker
> Based on: MASTER_PROMPT_V2.md, Productization Audit 2026-08-02, current codebase
> Status: **Final draft. No code changes until this spec is locked.**

---

## 0. Core transformation

```
CURRENT                                        TARGET
"tracker of jobs with AI bolted on"    →       "AI-powered job-application workspace"
entity-shaped nav (Overview/Jobs/Recruiters) → goal-shaped nav (Home/Applications/Workspace/Resumes/Contacts/Insights)
CRUD-first dashboard                          → command center (what needs attention, what's next)
scattered AI (analyze tab, tailor page)       → unified AI Workspace per job
``` 

## 1. Information architecture

| Nav item | Route | What it is | Data source (no changes) |
|----------|-------|------------|--------------------------|
| **Home** | `/dashboard` | Command center: greeting, pipeline strip, attention block, recent activity, AI insights | Existing `useJobs`/`useRecruiters` — same queries, new layout |
| **Applications** | `/dashboard/jobs` | Pipeline board + job database (today's Jobs page, restructured) | Existing Jobs CRUD |
| **AI Workspace** | `/dashboard/workspace` | Per-job unified flow: select job → analysis → match → gaps → tailor → review → export | Existing AI + Job + Resume APIs, linked |
| **Resumes** | `/dashboard/resumes` | Master resumes + tailored versions (lineage) | Existing Resumes CRUD + tailor |
| **Contacts** | `/dashboard/recruiters` | Recruiters, linkable to applications | Existing Recruiters CRUD |
| **Insights** | `/dashboard/insights` | Analytics (last phase) | New — deferred |

**Routes are preserved** — only labels and grouping change. No redirects or broken links. The `/dashboard/layout.tsx` TABS constant is the only nav source; update it in one place.

**Add:** `/dashboard/workspace/page.tsx` (new) — the AI Workspace entry point.

## 2. Home (command center) — redesign

TODAY: 7 equal-weight stat tiles → Follow-ups list → Recent activity. No hierarchy, no "what next."

TARGET (vertical top-to-bottom, intentional weight):

```
[Greeting: "Good morning, Vzaid. 3 applications need attention."]
                     — dynamic, time-of-day, context-aware

[Primary actions: + Add Job  |  Open AI Workspace]
                     — two visible buttons, not buried in a tab

[Application pipeline strip]
  Wishlist  →  Applied  →  Interview  →  Offer  →  Rejected
    3            5            2           1          4
  (clickable, goes to Applications filtered)

[Attention required]
  • 2 follow-ups overdue
  • 1 application without a tailored resume
  • 1 interview this week

[Recent activity]
  (existing derived feed — move down in hierarchy)
```

Implementation: reuse the existing `OverviewPage` data queries entirely. Only the component changes. No new API endpoints needed.

## 3. AI Workspace — the core loop

**Problem today:** Analyze is one tab (paste-only), Tailor is another (`/dashboard/resumes/tailor`). No connection between them. `Analysis` has no `jobId`.

**Target flow** — everything lives on `/dashboard/workspace`:

```
Step 1: SELECT JOB
  [dropdown or typeahead: pick a saved job]
  [or: paste a new job description → "Save & start" saves it, then enters workspace]

Step 2: ANALYZE
  [structured AI analysis of the selected job — reuse existing analyze-job API]
  [saved to Analysis model with jobId ← NEW FIELD]

Step 3: MATCH
  [pick a resume → deterministic keyword/skill comparison vs JD]
  [show: score %, strong matches ✓, partial ◐, gaps ✗]
  [ATS keywords + explanation of why]

Step 4: SKILL GAPS
  [consolidated view: required, partial, missing — from Step 3]

Step 5: TAILOR RESUME
  [pick resume + job → AI rewrites — reuse existing tailor-resume API]
  [show draft in editable textarea with diff highlights: added/removed/reworded]

Step 6: REVIEW & EXPORT
  [review tailored resume → edit → save as version → download PDF]

Step 7: APPLY
  [Mark as Applied → updates job status]
```

**Data model addition (minimal, additive only):**
- `Analysis.jobId` — optional FK to Job (nullable, existing rows stay null)
- `MatchResult` — key/value stored on `Analysis.result` JSON (no new model). The match score is computed deterministically — no AI required.

**API changes (additive):**
- `POST /api/ai/match` — takes `jobId` + `resumeId` → returns `{ score, strong, partial, missing, keywords }`
- ATS match scoring is a **pure function**: extract keywords/skills from the JD (already in `Analysis.result`), check which appear in the resume markdown, compute coverage %. No AI call, instant, free, deterministic, unit-testable. The "why" is self-documenting: each matched/missing keyword is listed.

## 4. Design system — Modern Digital Brutalism

**Keep:**
- current CSS variables (`--bg`, `--surface`, `--raised`, `--line`, `--fg`, `--muted`, `--accent`)
- Geist + Geist Mono via next/font
- status color language from `status.ts`
- accent focus rings

**Evolve:**

| Today | → | Target |
|-------|---|--------|
| `rounded-lg` everywhere (8px) | → | `rounded-md` default (6px), ± `rounded-sm` (2px) |
| Soft shadow-free cards | → | Hard offset shadows (`shadow-[4px_4px_0_0_var(--line)]`) on key panels |
| Floating 7-tile equal grid | → | Structured pipeline strip, attention list, activity feed |
| Generic "AI sparkle" feel | → | Functional AI indicators (no sparkle icons/emoji) |
| Borders `border-line` (already good) | → | Keep, use 1-2px consistently |

**Component primitives to solidify:**
- **Panel** — `rounded-md border border-line bg-surface` (already used ad-hoc; make it the one pattern)
- **Pill** — `rounded-full border border-line px-2.5 py-0.5 font-mono text-[11px]` (already used; standardize color variants)
- **Button** — primary: `bg-accent text-white rounded-md`; secondary: `border border-line rounded-md`. No more than 2 variants.
- **Dialog** — add focus-trap + scroll-lock (the known a11y gap).

**Typography hierarchy:**
- Page headings: `text-lg font-semibold text-fg` (editorial)
- Section labels: `text-xs font-medium text-muted uppercase tracking-wide`
- Data: Geist Mono, always
- Nothing decorative beyond these 3 levels

## 5. ATS match scoring (deterministic)

```
Input:  Analysis.result (jobAnalysisSchema JSON) + Resume.content (markdown string)
Output: { score: number (0-100), strong: string[], partial: string[], missing: string[], keywords: string[] }

Algorithm:
  1. Collect all keywords/skills from Analysis.result (techStack + requiredSkills + optionalSkills + keywords arrays — de-duplicate, case-normalize)
  2. For each keyword, check if it appears in the resume markdown (case-insensitive, word-boundary-aware)
  3. strong   = present in resume
  4. missing  = absent from resume
  5. partial  = close match (fuzzy — e.g. "React" matches "React.js", "ReactJS")
  6. score    = (strong.length + partial.length * 0.5) / total.length * 100, rounded to integer
```

No AI call. No network. A single pure function in `src/lib/match.ts`. Trivially unit-testable.

## 6. Skill gap display

Reuses match results (no separate API). Grouped into:

```
STRONG (present in your resume)
  ✓ TypeScript    ✓ React    ✓ Node.js

PARTIAL (related, not exact)
  ◐ PostgreSQL    ◐ Docker

GAPS (not detected — consider addressing)
  ✗ AWS    ✗ Kubernetes
```

Language is deliberate: "Not detected in your resume" — never "You don't know X." (MASTER_PROMPT_V2 §12)

## 7. Resume review experience

TODAY: tailoring returns a raw textarea. You see old and new only if you open two tabs.

TARGET (step 5 of workspace):
```
[Resume preview — readonly, rendered markdown, with diff styling]
  added content   → green highlight
  removed content → red strikethrough
  reworded        → amber underline

[Edit inline if needed] → save as version → [Mark as Applied] → go track it
```

Pragmatic first pass: add a `diff` field to the tailor-resume API response (the AI prompt asks for structured changes: `{ added: string[], removed: string[], reworded: string[] }`), and render marks in a single view. If the AI can't produce structured diffs reliably, fall back to the current raw-textarea experience — marked "draft" in the UI.

## 8. PDF export

```
Route: /dashboard/resumes/[id]/print
Renders the resume content as clean HTML with print CSS.
"Download PDF" button → window.print() → user saves as PDF in browser.

Zero new deps. Real selectable-text PDF. ATS-friendly (no columns, no images).
```

## 9. Application lifecycle wiring

The workspace's last step is:
```
[Mark as Applied]
  → updates job.status to APPLIED
  → saves the tailored resume as a new version with parentId
  → navigates to Applications (or stays in workspace)
```

Reuses existing `useUpdateJob` mutation. No new endpoint.

## 10. Insights (deferred — Phase 8)

Data to surface later:
- Applications sent, interviews, offers, rejection rate, interview rate, response rate
- Avg ATS match score across applications
- Time from application to response

No charts until there's enough data to make them meaningful. Every metric must help the user make a better decision. (MASTER_PROMPT_V2 §28)

## 11. Implementation order

| Phase | Scope | Risk | Deps |
|-------|-------|------|------|
| **1. Nav shell** | Rename tabs, add `/dashboard/workspace` stub | Low | None |
| **2. Brutalist visual pass** | CSS tokens → evolve, standardize Panel/Pill/Button, add focus-trap to dialogs | Low | Phase 1 |
| **3. Home command center** | Restructure dashboard → pipeline strip + attention block + actions | Low | Phase 2 |
| **4. AI Workspace (steps 1-2)** | Job selector + analysis on workspace, `Analysis.jobId` migration | Medium | Phase 1 |
| **5. ATS match + skill gaps** | `POST /api/ai/match`, deterministic matcher, grouped display (steps 3-4) | Low | Phase 4 |
| **6. Resume review + export** | Diff view in tailoring, PDF print route (steps 5-6) | Medium | Phase 5 |
| **7. Application lifecycle** | Mark as Applied, status transitions (step 7) | Low | Phase 6 |
| **8. Insights** | Recharts analytics over accumulated data | Low | Phase 7 |
| **9. Global search** | Client-side unified search across jobs/contacts/resumes | Low | When wanted |

## 12. What stays untouched

- Clerk auth, ownership, middleware
- Prisma schema (except `jobId` on `Analysis` — additive, nullable, no data loss)
- All existing API routes (new routes added, none rewritten)
- `src/lib/ai.ts` (Gemini path works; don't touch it)
- The 25 vitest tests
- Markdown master resume + `parentId` lineage
- `status.ts` color language
- Landing page (`/`)

## 13. Anti-goals (deliberately NOT in scope)

- Job scraping / Linkedin automation / auto-apply
- Email sending / scheduled reminders / push notifications
- Multi-user teams / billing / enterprise features
- Real-time event system (derived activity is enough)
- Replacing any working library or framework
- Light mode (dark is the product)

---

**Locked. Ready for implementation when you say go.** Recommend Phase 1 first.
