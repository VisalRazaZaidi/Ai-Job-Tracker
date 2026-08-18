# MASTER IMPLEMENTATION PROMPT — PHASE 5
## AI Job Tracker — Match Score + Skill Gaps

You are working on the existing **AI Job Tracker** codebase.

This is **Phase 5 only** of the Productization v2 roadmap.

Do NOT implement Phase 6, 7, 8, or 9.

---

# 0. YOUR ROLE

Act as a senior full-stack engineer working inside an existing production-oriented Next.js application.

Your job is to implement **Phase 5: Match Score + Skill Gaps** cleanly on top of the already completed Phase 1–4 work.

Priorities:

1. Preserve existing functionality.
2. Reuse existing architecture and components.
3. Make the smallest safe changes necessary.
4. Do not introduce unnecessary dependencies.
5. Do not redesign unrelated pages.
6. Keep the implementation deterministic and testable.
7. Do not use an LLM/API call for match scoring.
8. Do not fabricate skills or claim the user possesses skills that are not detected.

---

# 1. PRODUCT CONTEXT

The product is not intended to be a generic CRUD job tracker.

It is an AI-augmented workspace designed to help developers compare their master resume against a specific job description's extracted requirements. 

# 2. MATCHING ARCHITECTURE

The match calculation must be local, deterministic, and instant. It relies entirely on structured data already extracted during the Phase 4 Job Analysis phase, compared against the plain text of the user's selected master resume.

# 3. INPUTS

The matching engine requires two primary inputs:
*   `analysis.result` (The structured JSON output from Phase 4 containing extracted job skills/keywords)
*   `resume.content` (The raw text/markdown of the user's selected resume)

# 4. AVOID AI INFERENCE

Do not use Gemini, Claude, or any LLM to perform the comparison. The comparison must be a pure string/Regex or normalized text matching function executed on the server or client.

# 5. DATA STRUCTURE

Integrate cleanly with the existing Prisma schema and Next.js API route structures.

# 6. SOURCE OF SKILLS / KEYWORDS

Use the existing structured job analysis.

Inspect the actual current `jobAnalysisSchema` before implementing.

The intended sources are:
*   `techStack`
*   `requiredSkills`
*   `optionalSkills`
*   `keywords`

De-duplicate them.
Normalize comparison for:
*   case
*   whitespace
*   common punctuation differences

Do not blindly concatenate duplicate values.

# 7. MATCHING RULES

For every extracted skill/keyword:

**Strong match**
The skill is clearly present in the resume.

Examples:
*   Job: `React` | Resume: `React developer` → Strong
*   Job: `TypeScript` | Resume: `TypeScript` → Strong

Comparison must be case-insensitive.

**Partial match**
A related/common naming variant is present.

Examples:
*   `React` ↔ `React.js`
*   `ReactJS` ↔ `React`
*   `Node` ↔ `Node.js`
*   `Postgres` ↔ `PostgreSQL`

Use a controlled normalization/alias strategy.
Do NOT implement an overly aggressive fuzzy matcher that produces false positives.

For example, Do NOT assume `Java` → `JavaScript` (Those are different technologies).
Likewise, `AWS` → `Azure` must NOT match.

Prefer a small explicit alias map plus normalized matching over uncontrolled fuzzy matching.

**Missing**
The skill is not detected in the resume.

Use wording in the UI such as:
`Not detected in your resume`
not: `Missing from your skills` (because the resume may simply not mention it).

# 8. SCORE

Calculate:
`score = ( strong.length + partial.length * 0.5 ) / keywords.length * 100`

Round to an integer.

If there are zero keywords, handle this explicitly. Do NOT return `NaN`.
Do NOT display `0%` if there is genuinely no analyzable skill/keyword data.

Instead use an appropriate state such as: `Match unavailable`
With an explanation: `This job does not contain enough structured skill data to calculate a match.`

Inspect the current UI conventions before deciding the exact presentation.

# 9. REQUIRED OUTPUT

The matcher should provide:

```typescript
{
  score: number,
  strong: string[],
  partial: string[],
  missing: string[],
  keywords: string[]
}
```

If the existing project has a more appropriate type structure, integrate with it rather than duplicating types.
Avoid `any`. Maintain strict TypeScript.

# 10. API

Add:
`POST /api/ai/match` (or the equivalent route if the existing Phase 4 architecture already has a better location).

Input:
```json
{
  "jobId": "...",
  "resumeId": "..."
}
```

The server must:
1. Authenticate the user.
2. Resolve the local user.
3. Fetch the Job using ownership checks.
4. Fetch the Resume using ownership checks.
5. Find the relevant saved Analysis for the Job.
6. Validate that the analysis belongs to the same user/job.
7. Calculate the match deterministically.
8. Return the structured result.

Do NOT trust client-provided user IDs.
Do NOT allow one user to access another user's job, resume, analysis, or match result.
Follow the existing ownership patterns.

# 11. ANALYSIS → JOB LINK

Inspect the current Prisma schema.
The Product UX specification intended `Analysis.jobId` as an optional relation to Job.

If Phase 4 already implemented this: → use it.
If it has NOT been implemented: → implement the smallest additive nullable migration necessary.

Do not rewrite existing Analysis records.
Existing analyses must remain valid.
Do not perform destructive migrations.

# 12. WHICH ANALYSIS TO USE

The match must use the analysis associated with the selected Job.
Do NOT simply use the most recent analysis belonging to the user because that could produce an incorrect match.

The relationship should be:
`Job` ↓ `Analysis` ↓ `Resume`

The selected Job determines the analysis.

If the job has no analysis yet, the UI should provide a clear state such as:
`Analyze this job first to calculate a Match Score.`

Provide an action that takes the user into the existing Analyze flow if that already exists.
Do not silently call Gemini from the match endpoint.

# 13. AI USAGE

VERY IMPORTANT:
Match scoring must NOT call Gemini.
No Gemini request. No Claude request. No OpenAI request. No AgentRouter request. No external API request.

The match calculation is: **local + deterministic + instant + free**.
This is an intentional product decision.

# 14. AI WORKSPACE UX

Integrate the feature into the existing Phase 4 AI Workspace.
Do NOT create a separate unrelated Match page unless the existing architecture absolutely requires it.

The user should experience something conceptually like:

```text
AI WORKSPACE

[Selected Job]

Job Analysis
────────────
...

Match
────────────
         78%
     Match Score

Strong Matches
✓ React
✓ TypeScript
✓ Node.js
✓ PostgreSQL

Partial Matches
◐ React.js
◐ Docker

Skill Gaps
✗ AWS
✗ Kubernetes
✗ Redis
```

The exact layout should follow the current Phase 4 design.
Do not blindly recreate this ASCII layout.
Inspect the existing workspace and integrate naturally.

# 15. MATCH SCORE UI

The Match Score should have strong visual hierarchy.

Possible states:
*   High match: Use the existing product status/accent language appropriately.
*   Medium match: Use an appropriate neutral/warning treatment.
*   Low match: Use an appropriate warning treatment.

Do NOT introduce a completely new color system.
Reuse: existing CSS variables, existing status language, existing typography, existing borders, existing brutalist visual system.
The score should be visually important but should NOT look like a fake scientific measurement.

# 16. SKILL GAP UI

Use three explicit groups:

**STRONG**
Skills detected clearly in the resume.
`✓ React` | `✓ TypeScript`

**PARTIAL**
Related/variant matches.
`◐ React.js` | `◐ Postgres`

**GAPS**
Not detected.
`✗ AWS` | `✗ Kubernetes`

Use the wording: `Not detected in your resume` where appropriate.

# 17. IMPORTANT UX PRINCIPLE

The feature should answer: *"How closely does my current resume align with this job?"*
It should NOT answer: *"Am I qualified for this job?"*

Those are different things. The system only evaluates the resume against the job's extracted requirements.

# 18. RESUME SELECTOR

The workspace should allow the user to select a resume.
Prefer: master resumes, appropriate resume versions.

Inspect the existing Resume model and Phase 4 implementation.
Do not break: `master resume` ↓ `tailored version` ↓ `parentId lineage`

The master resume remains immutable when tailoring.
For Phase 5, the matcher should simply read the selected resume's current content.

# 19. RECOMPUTATION

Match results should be recalculated when:
*   selected job changes
*   selected resume changes
*   resume content changes
*   relevant analysis changes

Do not make unnecessary AI calls. Because this is deterministic, recalculation should be cheap.
Follow the existing React Query/data-fetching patterns.
Do not introduce a new state-management system.

# 20. PERSISTENCE

The Product UX specification allows: `MatchResult` stored on `Analysis.result` JSON.
However, do NOT duplicate data unnecessarily. Inspect the current implementation first.

Prefer:
**Option A:** Compute match result on demand. Use this if there is no product requirement for historical persistence yet.
**Option B:** Persist the deterministic result if the current architecture already expects persisted MatchResult data.

If persisting: preserve the original Analysis result, do not destroy existing fields, use additive JSON structure, make the schema/type explicit.

The important requirement is:
Match results must remain reproducible from the job analysis + resume content.
Do not create a complex new database model unless absolutely necessary.

# 21. HISTORICAL INTEGRITY

Do not modify the user's master resume.
Do not modify the Job description.
Do not modify the original Analysis just to produce a match.

The following should remain independently identifiable:
*   Original Job Description
*   Original Job Analysis
*   Selected Resume
*   Match Result

This matters because future phases will introduce tailored resumes, resume review, exports, and application snapshots.
Do not make architectural decisions in Phase 5 that make those future features difficult.

# 22. ERROR HANDLING

Do NOT expose raw provider/database/internal errors directly to the user.
For example, do not show `PrismaClientKnownRequestError...` or provider stack traces.
Return useful API errors and map them to friendly UI messages.

Examples:
*   `We couldn't calculate the match right now.`
*   `Analyze this job first before calculating a Match Score.`
*   `Select a resume to calculate the Match Score.`

Use the project's existing error-handling conventions.
Do not redesign the entire application's error system in this phase.

# 23. LOADING STATES

The match UI must have: loading state, error state, no-analysis state, no-resume state, no-keywords state, successful result state.
Do not leave the user staring at an empty panel.

# 24. EMPTY STATE

If no analysis exists:
```text
No job analysis yet.
Analyze this job to identify the skills and keywords we can compare against your resume.
[Analyze Job]
```
Use the existing navigation/action pattern.

# 25. ACCESSIBILITY

Follow existing accessibility patterns.
At minimum:
*   buttons have meaningful labels
*   interactive elements are keyboard accessible
*   score is not communicated by color alone
*   icons have accessible labels where needed
*   focus states remain visible
*   dialogs continue using existing accessibility behavior

Do not regress the existing UI. If Phase 4 introduced focus-trap/scroll-lock improvements, preserve them.

# 26. DIGITAL BRUTALISM DESIGN

The project uses: Modern Digital Brutalism. Preserve the established design language.

Use: strong borders, hard offset shadows where appropriate, restrained radius, editorial hierarchy, Geist / Geist Mono, semantic CSS variables, functional color, structured layouts.

Avoid: gradients, excessive rounded cards, glassmorphism, floating AI sparkle decorations, generic SaaS dashboard styling, unnecessary animations, emoji-based AI decoration.

The UI should feel like a serious developer/productivity tool.

# 27. TESTING

Add unit tests for the pure matcher.
At minimum test:
*   Exact match (Job: React, Resume: React -> strong)
*   Case-insensitive (Job: TypeScript, Resume: typescript -> strong)
*   Alias (Job: React, Resume: React.js -> partial or strong)
*   False positive protection (Job: Java, Resume: JavaScript -> NOT a match)
*   Missing skill (Job: Kubernetes, Resume: React -> missing)
*   Score calculation
*   Empty keyword set (`keywords = []` does not produce NaN)
*   Duplicate keywords (deduplicated)

# 28. REGRESSION TESTING

After implementation run:
`npx tsc --noEmit`
Run the existing test suite.
Run the new matcher tests.
Run `npm run build`.

Do not consider Phase 5 complete if existing tests regress.
The existing tests must remain green unless the current project has intentionally added/changed tests.

# 29. DATABASE SAFETY

If a Prisma migration is required: additive only, nullable where possible, no destructive changes, no deleting existing rows (Analysis, Jobs, Resumes).
Run Prisma validation to ensure existing records remain readable.

# 30. ARCHITECTURAL RULES

Preserve: Clerk authentication, server-side ownership checks, Prisma, PostgreSQL, React Query, Zod, strict TypeScript, feature-based folder organization, existing AI provider abstraction, Markdown master resume, parentId resume lineage, existing status system, existing design tokens.

Do not replace frameworks or libraries.
Do not introduce Zustand/Redux/etc. for this feature.
Do not introduce another UI framework.
Do not add dependencies unless there is a genuine requirement.

# 31. DO NOT IMPLEMENT

This is critical. Do NOT implement:
Resume diff, Resume review, PDF export, DOCX export, Mark as Applied, application lifecycle, Insights analytics, Recharts, global search, job scraping, LinkedIn automation, Indeed automation, auto-apply, email automation, scheduled notifications, billing, multi-user teams, subscription system.

Those belong to later phases or anti-goals.

# 32. IMPLEMENTATION PROCESS

Follow this exact workflow.

**STEP 1 — Inspect**
Read: `STATE.md`, `MASTER_PROMPT_V2.md`, `PRODUCT_UX_SPEC_V2.md`, current Phase 4 workspace, Prisma schema, Analysis schema, Resume model, Job model, existing API, hooks, tests. Inspect the relevant files before coding.

**STEP 2 — Architecture check**
Determine: Has Analysis.jobId already been implemented? How does Phase 4 select a Job/Resume? Where is Analysis currently stored/read? What React Query patterns are used? Where should match.ts live? Do not guess.

**STEP 3 — Implement matcher first**
Create the deterministic pure function. Add tests. Run tests. Only after the matcher is correct should you build the API/UI.

**STEP 4 — Implement API**
Add the match endpoint using existing ownership/auth patterns. Test various states (valid, missing, ownership boundaries).

**STEP 5 — Integrate into Workspace**
Add: resume selection, Match Score, strong matches, partial matches, gaps, loading/error/empty states. Reuse existing workspace components.

**STEP 6 — Visual pass**
Make the new UI consistent with the established Digital Brutalism system. Only make changes necessary for the new feature to feel native.

**STEP 7 — Verification**
Run: `npx tsc --noEmit`, tests, `npm run build`. Fix regressions.

# 33. DEFINITION OF DONE

Phase 5 is complete only when:
*   Match Score is implemented and deterministic.
*   No AI call is used for matching.
*   Strong matches, partial matches, and gaps are displayed.
*   Resume selection works.
*   Job selection comes from the existing workspace.
*   Job Analysis is correctly linked to the Job.
*   Ownership checks are enforced (no cross-user data access).
*   No raw internal errors are exposed.
*   Loading, error, empty, and no-data states exist.
*   Deterministic matcher has unit tests.
*   Existing tests remain green.
*   TypeScript and production build passes.
*   Existing functionality remains intact.
*   Digital Brutalism visual language is preserved.
*   No Phase 6+ features were implemented.

# 34. FINAL REPORT

When finished, provide a concise implementation report containing:
*   **Implemented**: List the actual files/features changed.
*   **Match Algorithm**: Explain exactly how matching works.
*   **API**: Show the endpoint and request/response shape.
*   **UX**: Explain how Match Score and Skill Gaps appear in the AI Workspace.
*   **Database**: State whether Prisma/schema changes were necessary.
*   **Tests**: Report matcher tests, total tests, TypeScript, production build.
*   **State.md**: Update `STATE.md` to mark "Phase 5 — Match Score + Skill Gaps — COMPLETE" and accurately document what was implemented.

# 35. MOST IMPORTANT RULE

Do not turn this into a generic implementation exercise.
The product goal is: Help a developer quickly understand how their current resume aligns with a specific job before tailoring and applying.

The feature should be: fast → deterministic → explainable → honest → useful

Build Phase 5 only.