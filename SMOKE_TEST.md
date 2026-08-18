# AI Job Tracker — Usage & Smoke Test

## Setup

1. Fill `.env` (copy from `.env.example`):
   - `DATABASE_URL` — a PostgreSQL connection string.
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` — from https://dashboard.clerk.com.
2. Apply the schema: `npx prisma db push` (or `npx prisma migrate dev`).
3. Start: `npm run dev` → http://localhost:3000.

Unauthenticated visits redirect to `/sign-in` (Clerk-hosted UI).

---

## Usage

- **Dashboard** — five stat tiles (Total, Wishlist, Interviews, Offers, Rejected) count your jobs by status.
- **New job** — top-right button opens a dialog. Company + Position are required; everything else (status, work mode, source, location, salary, date applied, job link, description, notes) is optional.
- **Edit** — pencil icon on a row opens the same dialog pre-filled.
- **Change status fast** — the per-row status dropdown updates immediately without opening the dialog.
- **Delete** — trash icon; the row disappears instantly (optimistic) and reappears if the server rejects it.
- **Search** — filters the list by company, position, location, or notes.
- **Filter** — the status dropdown narrows the list to one status.

Your jobs are private — every API call is scoped to your Clerk user; you can never see or touch another user's rows.

---

## Smoke Test (≈3 min, manual)

Run `npm run dev` first, then walk through these in order. Each line is pass/fail.

**Auth**
- [ ] Visit `/` while signed out → redirected to `/sign-in`.
- [ ] Sign in → dashboard loads, avatar shows top-right.

**Create**
- [ ] Click **New job**, enter only Company + Position, Add → row appears, "Total" tile +1.
- [ ] Open **New job**, click Add with both fields blank → inline "required" errors, dialog stays open.
- [ ] Create a job with a bad Job link (`abc`) → "Must be a valid URL" error.
- [ ] Create a job filling every field incl. a Date applied → saves, no error.

**Edit**
- [ ] Pencil on a row → dialog opens pre-filled with that job's values.
- [ ] Change Position, Save → row text updates, dialog closes.

**Inline status**
- [ ] Change a row's status dropdown to `OFFER` → "Offers" tile +1, "Wishlist" −1 (if it was Wishlist).

**Search & filter**
- [ ] Type a company name in search → list narrows to matches; clear → full list returns.
- [ ] Set status filter to `OFFER` → only offer jobs show; back to `All statuses` → all show.
- [ ] Search a string that matches nothing → "No jobs match your search."

**Delete**
- [ ] Trash a row → it vanishes immediately, "Total" −1.

**Empty state**
- [ ] Delete all jobs → "No jobs yet. Add your first application."

**Ownership (optional, needs 2 accounts)**
- [ ] Sign in as user B → user A's jobs are not visible.

---

## Phase 5 Smoke Test — Match Score + Skill Gaps (≈5 min, manual)

Prerequisites: Complete Phase 4 smoke test first. Requires at least one saved job with description, and one resume.

### Setup for Phase 5 test

1. **Create a test job** with this description (or similar):
   ```
   We're hiring a Senior Full Stack Developer!
   
   Required Skills:
   - React and TypeScript
   - Node.js backend
   - PostgreSQL database
   - REST APIs
   - Docker containerization
   
   Nice to have:
   - GraphQL
   - Kubernetes
   
   Tech Stack: React, TypeScript, Node.js, PostgreSQL, Docker, REST, AWS
   
   Keywords for ATS: JavaScript, Full Stack, Backend, API, Database
   ```

2. **Create a test resume** with this content (or paste your real resume):
   ```
   # John Doe

   ## Skills
   React, TypeScript, Node.js, GraphQL, Docker

   ## Experience
   Senior Developer at TechCorp
   - Built React applications using TypeScript
   - Designed and built REST APIs with Node.js
   - Used Docker for containerization
   - Worked with PostgreSQL databases
   ```

### Test Flow

**Job Selection & Analysis**
- [ ] Navigate to `/dashboard/workspace` → job picker appears with "Choose an application to work on".
- [ ] Search for the test job → it appears in the list.
- [ ] Click the test job → workspace loads with job header (title, company, status pills).
- [ ] Scroll to "Job analysis" section → "Analyze Job" button visible.
- [ ] Click **Analyze Job** → loading state shows "Extracting requirements...".
- [ ] Wait ~3 seconds → analysis loads with extracted skills (techStack, requiredSkills, etc.).

**Match Score Section**
- [ ] Scroll to "Match Score" section (below Job analysis).
- [ ] Resume dropdown appears with your test resume pre-selected.
- [ ] Match calculation runs automatically → score displays (0–100%).
- [ ] Score color: If resume has React+TypeScript+Node.js+PostgreSQL+Docker (5/8 skills), score ≈ 62% (yellow).

**Strong Matches** (should see: React, TypeScript, Node.js, PostgreSQL, Docker)
- [ ] Click "Show Details" → expands to reveal match breakdown.
- [ ] **Strong Matches** section shows 5 skills with green dots (✓):
  - React
  - TypeScript
  - Node.js
  - PostgreSQL
  - Docker

**Partial Matches** (should see: GraphQL)
- [ ] **Partial Matches** section shows skills with partial matches (empty if none, or GraphQL if in aliases).
- [ ] If present, shows yellow/warning indicator (◐).

**Skill Gaps** (should see: REST, AWS, Kubernetes)
- [ ] **Skill Gaps** section shows 3 skills not in resume:
  - REST
  - AWS
  - Kubernetes
- [ ] Each marked with red X (✗).
- [ ] Text clarifies: "Not detected in your resume. This doesn't mean you can't learn them..."

**Resume Switching**
- [ ] Create a second resume with minimal content: "I know React."
- [ ] Change resume dropdown to the second one.
- [ ] Match recalculates → score drops significantly (e.g., 12% with only 1 of 8 skills).
- [ ] Strong Matches now shows only "React".
- [ ] Missing/Gaps expanded (TypeScript, Node.js, PostgreSQL, etc.).

**Edge Cases**

Empty/No Analysis
- [ ] Create a new job without description.
- [ ] Navigate to workspace with that job.
- [ ] Match Score section shows: "This job doesn't have enough skill data yet. Run the job analysis first..."

No Resumes
- [ ] Delete all resumes.
- [ ] Match Score section shows: "No resumes yet. Create a resume" (with link).

Re-analyze (History Preservation)
- [ ] In existing workspace, click "Re-analyze" in the Job analysis section.
- [ ] After it completes, notice the analysis counter incremented (e.g., "2 analyses saved").
- [ ] Re-calculate match → result remains the same (deterministic).
- [ ] Score matches previous calculation exactly.

---

## Automated checks for Phase 5

```bash
npm run test        # vitest — 71 tests (23 integration + 19 matcher + 29 existing)
npx tsc --noEmit    # type check — no errors
npm run build       # full Next.js build — should succeed
```

All three should exit 0.

### Unit Tests (matcher core logic)

```bash
npm run test -- src/features/ai/matcher.test.ts
```

Expected output:
```
✓ src/features/ai/matcher.test.ts (19 tests)
  ✓ calculateMatch — deterministic matching algorithm
    ✓ exact matches (4)
    ✓ partial matches via aliases (5)
    ✓ missing skills detection (2)
    ✓ score calculation with rounding (4)
    ✓ skill deduplication (2)
    ✓ real-world scenarios (2)

Test Files  1 passed (1)
Tests  19 passed (19)
```

### Integration Tests (comprehensive Phase 5 coverage)

```bash
npm run test -- src/features/ai/integration.test.ts
```

Expected output:
```
✓ src/features/ai/integration.test.ts (23 tests)
  ✓ Phase 5 Integration Tests
    ✓ Matcher function — Core matching logic (8)
    ✓ Score calculation (5)
    ✓ Alias matching (7)
    ✓ Integrated scenarios (3)

Test Files  1 passed (1)
Tests  23 passed (23)
```

#### Coverage

- **Core matching logic**: exact matches, case-insensitivity, missing skills, partial matches via aliases, deduplication, empty keywords, resume with no matches
- **Score calculation**: strong-only scores, partial weighting (50%), mixed matches, rounding (e.g., 66.67% → 67%), very long skill lists (100 skills)
- **Alias matching**: React (react, react.js, reactjs), Node.js (node, node.js, nodejs), Postgres (postgresql), Kubernetes (k8s), REST (restful), TypeScript (ts), GraphQL (gql)
- **Real-world scenarios**: junior dev vs senior role, backend specialist vs full stack, perfect match (100% score)
