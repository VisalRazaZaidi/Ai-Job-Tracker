# Project State — AI Job Tracker

_Living doc. Update as the project progresses._
Last updated: 2026-08-18 (Productization v2 — Phase 5: Match Score + Skill Gaps)

---

## 0) Productization v2 progress

Reframing the tracker into an AI-first job-application workspace, per `MASTER_PROMPT_V2.md`
and `PRODUCT_UX_SPEC_V2.md`. Working in vertical slices.

**Completed**
- **Phase 1 — IA + navigation shell.** Nav is now goal-oriented: Home / Applications /
  AI Workspace / Contacts / Resumes / Insights (`src/app/dashboard/layout.tsx`). Labels +
  grouping only — **all routes preserved** (`/dashboard/jobs`, `/dashboard/recruiters`,
  `/dashboard/resumes`, `/dashboard/analyze` all still valid). Active-state now matches
  nested routes (`isActive`: Home exact, others `startsWith`). Added two **route stubs**:
  `/dashboard/workspace` (AI Workspace) and `/dashboard/insights` (Insights) — copy only,
  no functionality. Existing Analyze route unchanged; the AI Workspace tab points at the
  new stub. No schema/API/AI changes. `tsc`, 25 tests, and `next build` all green.
- **Phase 2 — Modern Digital Brutalism visual pass.** Design system foundations only —
  no new product functionality. New UI primitives: `Button` (primary/secondary/danger/
  ghost; md/sm/icon), `Dialog` (focus trap, Esc close, scroll lock, focus restore,
  backdrop, `aria-labelledby`), `SectionLabel` (uppercase mono section label), `Panel`
  (local to dashboard home). `globals.css`: `shadow-hard` (4px offset hard shadow),
  `dialog-in` animation, `:focus-visible` moved into base layer. Compact radii everywhere
  (panels 6px, controls 2–4px, pills full) and hard dividers. Color tokens and the
  `status.ts` color language untouched (single source of truth). All existing pages
  visually standardized WITHOUT layout/IA changes: dashboard home (Panel/SectionLabel,
  tile radii), Applications, Contacts, Resumes (incl. editor), Analyze (Results panel,
  buttons, local Section → SectionLabel), workspace/insights stubs (radius). Navigation
  visual pass on `layout.tsx`: active tab = bordered + `shadow-hard` + accent underline,
  `aria-current="page"`, `aria-label` on nav — routes/IA unchanged. Three dialogs
  (Job/Recruiter form, Job detail) consolidated onto the `Dialog` primitive, removing
  duplicated Esc/backdrop code. No Prisma, API routes, AI provider logic, data-fetching,
  auth, or authorization touched. `tsc`, 25 tests, and `next build` all green.
- **Phase 3 — Home command center.** Reframed `/dashboard` from seven equal stat
  tiles into a goal-oriented command center with a clear hierarchy: **contextual
  greeting → primary actions → application pipeline → attention required + quick
  status → recent activity**. **No schema/API/AI changes** — every number is derived
  client-side from the existing owner-scoped `useJobs`/`useRecruiters` caches (no
  `/api/dashboard`, no analytics endpoint, no new models). New components under
  `src/app/dashboard/components/`: `HomeHeader` (time-of-day greeting via Clerk
  `useUser`, one deterministic context sentence, `Add job` reusing `JobFormDialog`
  + `Open AI Workspace` link to `/dashboard/workspace`), `ApplicationPipeline` (five
  clickable lifecycle stages — Wishlist/Applied/Interview/Offer/Rejected — Geist Mono
  counts + status-hue dots, each deep-links to `/dashboard/jobs?stage=<key>`),
  `AttentionRequired` (overdue + upcoming follow-ups only, with an "all caught up"
  empty state), `QuickStatus` (compact subordinate recap, NOT a tile grid), and
  `RecentActivity` (moved lower; same honest `updatedAt` derivation, now with per-item
  links). Added `PIPELINE_STAGES` to `status.ts` as the single source of truth mapping
  the 11 statuses → 5 stages (Interview groups INTERVIEW/ASSESSMENT/TECHNICAL/HR; Offer
  groups OFFER/ACCEPTED; WITHDRAWN/ARCHIVED excluded), reused for both pipeline counts
  and the new stage filter so counts and the filtered list always agree. Applications
  page now reads `?stage=` (Suspense-wrapped `useSearchParams`) and filters by the
  stage's status group with a dismissible chip; changing the status dropdown clears the
  stage param so the two never conflict — existing search/status filtering preserved.
  Shared `src/features/shared/dates.ts` (fmtDate/isDue/isUpcoming). Home has intentional
  loading (skeleton, never a flash of "0 applications"), a user-facing error state with
  Retry, and a new-user empty state that points at the first action. **Honest-data
  guardrails:** "needs a tailored resume" (no Job↔Resume relationship) and "interview
  this week" (no interview-date field) were deliberately OMITTED rather than fabricated.
  `tsc`, 25 tests, and `next build` all green.
- **Phase 4 — AI Workspace: job selection + job-keyed analysis.** Turned the
  `/dashboard/workspace` stub into a real job-centric surface and connected
  **Job → Analysis**. **Data model:** added a nullable `Analysis.jobId` +
  `job Job? @relation(onDelete: SetNull)` and the reverse `Job.analyses` — an
  analysis is now optionally tied to the job it came from; deleting a job keeps
  its analyses (history-preserving, `jobId → NULL`), and legacy paste-a-JD
  analyses stay valid (`jobId` NULL). Synced via `prisma db push` (project has no
  migrations folder — `build` runs `prisma generate`, so `db push` is the
  established convention). **Analyze API is now dual-mode** (`analyzeJobInputSchema`
  is a refined union): either `{ description }` (paste, unchanged) **or**
  `{ jobId }` — for `jobId` the **server** loads the owned `Job` and uses its saved
  description (client never sends the JD it doesn't own). Foreign/missing job → 404;
  job with <50-char description → friendly 422; the saved `Analysis` now records its
  `jobId`. `GET /api/ai/analyses?jobId=` filters to one job (owner-scoped). **UI:**
  no `jobId` in the URL → a **job picker** (search + status-hued cards, each links to
  `?jobId=<id>`); `?jobId=` present → owner-checked `useJob` → compact **context
  header** (title, company, status/work-mode pills, location/source, View posting),
  a collapsible **read-only original JD** (§16, preserved), and a **job analysis**
  section: newest analysis via `useJobAnalyses`, **Analyze / Re-analyze** (Gemini
  default, no model picker), honest indeterminate loading (no fake %), friendly error
  + Try Again, and "Last analyzed <date> · <model>". Re-analyze **creates a new row**
  (history kept). Selection is **URL-driven** (Suspense-wrapped `useSearchParams`,
  matching the Applications pattern) so refresh / back-forward / shared links resolve.
  Extracted the analysis presentation into a shared `AnalysisResult` component reused
  by both the Analyze page and the Workspace (one layout, no duplication). New hooks:
  `useJob`, `useJobAnalyses`. **Reused, never rewrote** `src/lib/ai.ts` / the Gemini
  path. **Explicitly out of scope (not implemented):** Match Score, skill gaps, resume
  review, export/snapshot, application lifecycle, the dead AgentRouter gateway. `tsc`,
  **29 tests**, `prisma validate`, and `next build` all green.
- **Phase 5 — Match Score + Skill Gaps.** Implemented deterministic, instant
  skill-matching (no AI calls) between job analysis results and selected resume.
  **Matcher engine** (`src/features/ai/matcher.ts`): compares extracted job skills
  (techStack, requiredSkills, optionalSkills, keywords) against resume markdown via
  normalized string/regex matching (case-insensitive word boundaries), with controlled
  alias support (React ↔ React.js, Node ↔ Node.js, Postgres ↔ PostgreSQL, etc.).
  Deduplicates skills by normalization. Classifies each as **strong** (exact match),
  **partial** (alias match), or **missing** (not detected). Calculates score:
  `(strong + partial*0.5) / keywords * 100`, rounded to integer; returns null if no
  keywords. **19 vitest unit tests** covering exact matches, case-insensitivity, word
  boundaries, aliases, deduplication, score calculation, edge cases, real-world resumes.
  **23 comprehensive integration tests** covering core matching logic, score calculations
  with various scenarios, alias matching (React, Node.js, Postgres, Kubernetes, REST,
  TypeScript, GraphQL), and realistic job-vs-resume scenarios (junior vs senior,
  specialist vs generalist, perfect match). **API endpoint** `POST /api/ai/match`:
  accepts `{ jobId, resumeId }`, server-side ownership checks both entities, fetches
  latest Analysis for Job, runs matcher, returns structured result (score, strong[],
  partial[], missing[], keywords[]). Safe error handling (no raw errors to client).
  **React hook** `useMatchScore`: queries the endpoint, enabled only when both ids
  present. **UI component** `MatchScore` (src/features/ai/MatchScore.tsx): displays
  score with color coding (green ≥75%, yellow ≥50%, red <50%, grey for null),
  collapsible details showing strong/partial/gaps with visual indicators. **Workspace
  integration**: new `MatchSection` in `/dashboard/workspace` with resume selector
  (master resumes only, auto-selects first), integrates naturally below job analysis
  section following Digital Brutalism design. Proper loading/error/empty states. **No
  schema changes** (no new Analysis fields — match is ephemeral, not persisted per Phase
  5 spec). Preserved all existing functionality. `tsc`, **71 tests** (23 integration +
  19 matcher + 29 existing), `prisma validate`, and `next build` all green.

**Not yet implemented**
- Phase 6 — Resume Review + Export
- Phase 7 — Application Lifecycle
- Phase 8 — Insights analytics
- Phase 9 — Global Search

**→ Next productization phase: Phase 6 — Resume Review + Export.**

**Recorded future product decisions (NOT implemented):** AI Workspace as a persistent
job-centric workspace (not a forced wizard); "Analyze New Job" as a first-class entry
point; "Match Score" terminology (not "ATS Score"); future weighted matching (required >
preferred > keywords); Application Snapshot / historical integrity (preserve original JD +
submitted resume version); user-friendly AI errors (no raw provider errors to client);
the 8 AI interaction principles. See `PRODUCT_UX_SPEC_V2.md`.

---

## 1) What we have built so far

The **auth + jobs CRUD + dashboard** slice is complete, verified, and running
(Clerk Google sign-in working, Postgres connected, smoke test passed).

- **Auth** — Clerk. All routes except `/`, `/sign-in`, `/sign-up` require a session.
  Clerk identity maps to a local `User` row on first request. Sign-in/up redirect
  to `/dashboard`; sign-out returns to `/`.
- **Public landing** (`/`) — hero + pipeline signature visual + Get started / Sign in
  CTAs (swaps to "Open dashboard" when signed in via Clerk `<SignedIn>`).
- **Jobs CRUD API** — `GET/POST /api/jobs`, `GET/PATCH/DELETE /api/jobs/[id]`.
  Every query is scoped to the caller's user; other users' rows return 404.
- **Dashboard** — dedicated **Overview** tab (`/dashboard`): 7 stat tiles (Total,
  Wishlist, Interviews, Offers, Rejected, **This week**, **Follow-ups due**) plus a
  **Follow-ups due** list and a **Recent activity** feed. Jobs list moved to
  `/dashboard/jobs`. Nav tabs: Overview / Jobs / Recruiters.
- **Follow-ups** — `nextFollowUp` date on both Job and Recruiter; the Overview
  surfaces everything due/overdue (soonest first, linking to its tab).
- **Create/Edit** — one reusable dialog (RHF + Zod) covering all job fields.
- **Inline status change** — per-row dropdown, updates without opening the dialog.
- **Job detail view** — clicking a row opens a read-only dialog (Esc/backdrop to
  close) showing full description, notes, link, salary, dates, work mode, source;
  Edit button hands off to the form dialog. Reuses the cached `Job` (no new API).
- **Delete** — optimistic with rollback on failure.
- **Recruiters** — full CRUD mirroring Jobs (schema → API → hooks → form → row).
  Fields: name, company, email, phone, LinkedIn, conversation notes, last contact,
  next follow-up. Row shows quick mail/call/LinkedIn links + a follow-up pill that
  turns amber when due/overdue. Dashboard now has **Jobs / Recruiters** nav tabs
  (shared `dashboard/layout.tsx`).
- **States** — loading, error, empty, and no-search-match all handled.
- **AI Job Analyzer** — paste a job description → structured analysis (company summary,
  seniority, interview difficulty, tech stack, required/optional skills, responsibilities,
  ATS keywords). Multi-provider model picker (Anthropic Claude, OpenAI GPT, Google Gemini).
  **Gemini uses the native Google SDK** (`@ai-sdk/google`, key `GOOGLE_GENERATIVE_AI_API_KEY`)
  and is the working path — default `gemini-3.5-flash-lite` (15 RPM / 500 RPD). Claude/GPT
  still route through the AgentRouter gateway, which is currently dead (see blocker). Nav
  tab: Analyze. API: `POST /api/ai/analyze-job`. Provider layer: `src/lib/ai.ts` (`getModel`
  branches Gemini→Google, else→gateway; `AI_MODELS`, `isAllowedModel`). Keys in `.env` +
  gitignored.
- **Analysis history** — every analyzer run is **persisted** (`Analysis` model: title,
  description, `result` JSON, model, createdAt; owner-scoped). The Analyze page is now a
  history workspace: a sidebar lists past analyses (newest first), clicking one re-opens its
  saved result with no new AI call, **New** starts a fresh compose form, and each has an
  optimistic delete. API: `GET /api/ai/analyses`, `DELETE /api/ai/analyses/[id]` (owner-scoped
  `deleteMany` → non-owner id 404s, no leak); `analyze-job` returns the saved row (201).
  Hooks: `useAnalyses` / `useDeleteAnalysis` (+ `useAnalyzeJob` invalidates the list).
- **Resumes** — a resume is stored as **editable markdown** (the master-resume source
  of truth). Upload a **PDF or DOCX** → server extracts text (`pdf-parse` / `mammoth`)
  → stored as markdown you can clean up; or start a blank one. List + markdown editor
  (save/delete) at `/dashboard/resumes`. API: `GET/POST /api/resumes`,
  `GET/PATCH/DELETE /api/resumes/[id]`, `POST /api/resumes/import` (multipart, 2MB cap,
  Node runtime). Extraction is best-effort — scanned/image PDFs won't yield text; the
  markdown is editable to fix anything mangled.
- **AI resume tailoring** — `/dashboard/resumes/tailor`: pick a master resume + a saved job →
  AI reorders/rewords the markdown to match the JD (never invents, per MasterPrompt) → review
  in an editable textarea → save as a **new tailored version** (`parentId` → the master; master
  untouched). Tailored resumes show a "tailored" badge in the list. Reuses the Gemini AI path
  and the existing `POST /api/resumes` for save. API: `POST /api/ai/tailor-resume` (looks up
  both by id, ownership-checked; 422 if the job has no description). *ATS match score + PDF
  export = next slice.*
- **Tests** — vitest schema validation (29 tests). `tsc` and `vitest` green.

- **Design system** — cool-tinted dark theme (Linear/Vercel lineage) via CSS
  variables + Tailwind semantic colors (`base/surface/raised/line/fg/muted/accent`),
  indigo accent `#6E62E5`. **Geist** (UI) + **Geist Mono** (all data: stat numbers,
  status pills, wordmark) via `next/font`. Signature: a **status-as-pipeline color
  language** — each status has one hue shown as a row dot + tinted pill and matching
  stat-tile accent. Accent focus rings for keyboard users.

Docs: `SMOKE_TEST.md` (manual checklist + usage guide).

---

## 2) File structure

```
Ai Job Tracker/
├── prisma/
│   └── schema.prisma            # User, Job, Recruiter, Resume (parentId self-relation), Analysis (Job↔Analysis, jobId nullable/SetNull), enums
├── src/
│   ├── middleware.ts            # Clerk route protection
│   ├── lib/
│   │   ├── prisma.ts            # PrismaClient singleton (dev hot-reload safe)
│   │   └── auth.ts              # getOrCreateUser() — sole User-table writer
│   ├── app/
│   │   ├── layout.tsx           # root layout
│   │   ├── providers.tsx        # ClerkProvider + React Query
│   │   ├── page.tsx             # public landing (hero + pipeline signature + CTAs)
│   │   ├── globals.css
│   │   ├── dashboard/
│   │   │   ├── layout.tsx       # shared chrome: wordmark + Home/Applications/AI Workspace/Resumes/Contacts/Insights nav + UserButton
│   │   │   ├── page.tsx         # Overview (Home): stat tiles + follow-ups due + recent activity
│   │   │   ├── jobs/page.tsx    # Jobs (Applications): list + filters + dialogs
│   │   │   ├── recruiters/page.tsx  # Recruiters (Contacts): list + search + form
│   │   │   ├── workspace/page.tsx   # AI Workspace — job picker + job-keyed analysis (Phase 4)
│   │   │   └── insights/page.tsx    # Insights — Phase 1 route stub
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   ├── sign-up/[[...sign-up]]/page.tsx
│   │   └── api/
│   │       ├── jobs/route.ts + [id]/route.ts        # ownership-checked CRUD
│   │       ├── recruiters/route.ts + [id]/route.ts  # ownership-checked CRUD
│   │       ├── resumes/route.ts + [id]/route.ts + import/route.ts
│   │       └── ai/analyze-job/route.ts + tailor-resume/route.ts + analyses/route.ts + analyses/[id]/route.ts
│   ├── lib/ai.ts                # AI provider layer: getModel (Gemini→native Google, else→gateway) / AI_MODELS / isAllowedModel
│   ├── lib/extract.ts           # PDF/DOCX → text (pdf-parse / mammoth)
│   └── features/
│       ├── ai/
│       │   ├── schema.ts / schema.test.ts   # jobAnalysis + dual-mode input Zod (11 vitest cases)
│       │   ├── AnalysisResult.tsx # shared analysis presentation (Analyze page + Workspace)
│       │   └── hooks.ts         # useAnalyzeJob / useAnalyses / useJobAnalyses / useDeleteAnalysis / useTailorResume
│       ├── resumes/
│       │   ├── schema.ts / schema.test.ts   # Zod + 4 vitest cases
│       │   └── hooks.ts         # useResumes / import / create / update / delete
│       ├── shared/zod.ts        # optionalString / optionalDate / optionalEnum helpers
│       ├── ui/                  # Phase 2 primitives: Button / Dialog / SectionLabel
│       ├── jobs/
│       │   ├── schema.ts / schema.test.ts   # Zod + 8 vitest cases
│       │   ├── status.ts        # status → pipeline hue (signature color language)
│       │   ├── hooks.ts         # useJobs / useJob / useCreateJob / useUpdateJob / useDeleteJob
│       │   ├── JobFormDialog.tsx / JobDetailDialog.tsx
│       │   ├── JobRow.tsx / JobFilters.tsx
│       └── recruiters/
│           ├── schema.ts / schema.test.ts   # Zod + 6 vitest cases
│           ├── hooks.ts         # useRecruiters / create / update / delete
│           ├── RecruiterFormDialog.tsx
│           └── RecruiterRow.tsx
├── .env / .env.example          # DATABASE_URL, Clerk keys
├── SMOKE_TEST.md
├── STATE.md                     # this file
└── config: next.config.js, tailwind.config.ts, tsconfig.json,
            postcss.config.js, vitest.config.ts, package.json
```

---

## 3) Key architectural decisions

- **Feature-based folders** — everything jobs-related lives in `src/features/jobs/`
  (schema, hooks, components together). New entities follow the same shape.
- **Zod schema is the single source of truth** — same `createJobSchema` validates
  the API body and drives the form (via `@hookform/resolvers/zod`). No duplicated rules.
- **Ownership enforced server-side** — `findOwnedJob(id, userId)` gates every
  by-id handler; API never trusts the client for scoping.
- **`getOrCreateUser()` is the only User-table writer** — one place maps Clerk → DB.
- **Client-side search/filter** — dataset is one user's jobs; no API/query change needed.
- **Optimistic delete only** — create/update just invalidate; cheap and correct at
  this scale. Upgrade to optimistic writes when the list is large enough to feel refetch.
- **Empty form values normalize to `undefined`** in the schema (`optionalString`,
  `optionalEnum`, date preprocess) — so blank inputs never fail validation.
- **Hand-rolled Tailwind components**, dark-mode first. Theme lives in CSS
  variables + Tailwind semantic color tokens, so a light mode or rebrand is a
  variable swap, not a class sweep. No shadcn/ui yet (add when a form/component
  gets heavy enough to justify it).
- **Status color is one shared module** (`status.ts`) — tiles, rows, and pills
  all read from it; changing a hue changes it everywhere.
- **No `any`, strict TS.**

---

## 4) Requirements coverage (vs Project_Requirment.md)

Built accurately **for the chosen scope** (auth + Jobs CRUD + dashboard + landing) —
~1 of 6 major feature areas. Solid MVP foundation, not the full product.

**Functional requirements**

| Requirement | Status | Notes |
|---|---|---|
| Authentication | ✅ | Clerk, server-side ownership |
| CRUD Jobs | ✅ | all 11 fields + 11 statuses |
| Filters | ✅ | status filter |
| Dashboard | ✅ | 7 tiles + follow-ups-due list + recent-activity feed |
| Search | ⚠️ | per-tab, client-side; spec wants one global search |
| CRUD Notes | ⚠️ | field on Job/Recruiter, not a standalone entity |
| CRUD Recruiters | ✅ | full CRUD + follow-up dates + nav tab |
| CRUD Resume Versions | ✅ | markdown CRUD + PDF/DOCX import + AI-tailored versions (parentId lineage); PDF export pending (slice 3) |
| AI Job Analysis | ✅ | multi-provider; saved history (list/open/delete); ATS match score deferred to #5 slice 3 |
| AI Resume Generation | ✅ | tailor a resume to a saved job (rewrite/reorder, no invention) |
| Analytics | ❌ | |

**Notable gaps**
- **Recent activity is derived** from `updatedAt` (top 6 across jobs+recruiters),
  not a real event log — good enough now; add a `Activity`/event model when you need
  per-change history or "X moved to INTERVIEW" granularity.
- Follow-up **reminders** are surfaced on the Overview but not *scheduled* (no
  email/push); the spec's "follow up after 5 days" presets aren't built.
- Whole pillars unbuilt: **Resume/AI, Analytics**.
- Accessibility: form dialogs still lack **focus trap, scroll lock** (Esc works).
- No offline draft support. Client-side search won't scale to thousands of rows.

**Deliberate tech deviations** (both valid): Next.js API routes instead of
NestJS/Express; hand-rolled Tailwind instead of shadcn/ui.

---

## 5) Roadmap (recommended order)

1. ~~**Job detail view**~~ ✅ done — click a row → read-only dialog with all fields
   + Edit hand-off. Notes/descriptions are now readable.
2. ~~**Recruiters CRUD**~~ ✅ done — entity + API + hooks + form/row + nav tab;
   follow-up dates captured (feeds #3).
3. ~~**Follow-ups + dashboard completion**~~ ✅ done — `nextFollowUp` on Job +
   Recruiter, Overview tab with all tiles, Follow-ups-due list, Recent-activity feed.
4. ~~**AI Job Analyzer**~~ ✅ done — paste a job description → structured skills/
   tech-stack/keywords analysis; multi-provider model picker via AgentRouter gateway,
   pluggable for native SDKs. (ATS *match* score deferred to #5 — needs a resume to
   compare against; fabricating it would violate MasterPrompt's no-invention rule.)
5. **Resume management + AI optimizer/generator** ← *in progress*
   - ~~Slice 1: Resume model~~ ✅ done — markdown master resume, PDF/DOCX upload→extract,
     CRUD + editor.
   - ~~Slice 2~~ ✅ done — AI tailoring: pick a resume + a saved job → AI rewords/reorders
     the markdown for that JD (never invents), review, save as a tailored version. `parentId`
     self-relation on Resume for version lineage; reuses the Gemini AI path.
   - Slice 3 ← *next step* — ATS match scoring (resume vs JD) + PDF/DOCX export (markdown → PDF).
6. **Analytics** — Recharts over the accumulated data.

Cross-cutting polish to fold in as we go: form-dialog a11y (focus-trap/scroll-lock),
global search, scheduled follow-up reminders, dark-theme the Clerk widget.

**→ Immediate next step: #5 slice 3 — ATS match scoring + PDF export.**

**✅ AI path live (2026-08-02):** analyzer verified end-to-end against Gemini via the
native Google SDK (`gemini-3.5-flash-lite`, 15 RPM / 500 RPD free tier). Slice 2 can build
on this working path.

**⚠️ Gateway still dead:** the AgentRouter key in `.env` returns `unauthorized client
detected`, so the Claude/GPT ids in the picker will fail. Only Gemini works until that key
is regenerated or native Anthropic/OpenAI providers are added (branch in `getModel`, same
shape as the Gemini branch).
