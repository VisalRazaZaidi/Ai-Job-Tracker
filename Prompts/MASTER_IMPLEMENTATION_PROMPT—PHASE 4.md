# AI JOB TRACKER — PHASE 4 IMPLEMENTATION PROMPT

You are implementing Phase 4 of the AI Job Tracker Productization v2.

The product is being transformed from a CRUD-style job tracker into an:

> AI-powered job-application workspace

Phase 1 — IA + Navigation Shell: COMPLETE
Phase 2 — Modern Digital Brutalism Visual Pass: COMPLETE
Phase 3 — Home Command Center: COMPLETE

You are now implementing:

# PHASE 4 — AI WORKSPACE: JOB SELECTION + JOB-KEYED ANALYSIS

This phase establishes the core architectural connection between:

Job → AI Analysis → future Match Score → future Skill Gaps → future Resume Tailoring → future Review → future Export → Apply

IMPORTANT:

This is a vertical slice.

Do NOT implement Phase 5, 6, 7, 8, or 9 functionality.

The goal is to make the AI Workspace genuinely job-centric without overbuilding it.

---

# 0. BEFORE TOUCHING CODE — MANDATORY

Read these project documents first:

1. `STATE.md`
2. `MASTER_PROMPT_V2.md`
3. `PRODUCT_UX_SPEC_V2.md`
4. `Project_Requirment.md` / equivalent requirements document
5. Existing AI implementation
6. Existing Jobs implementation
7. Existing Analysis implementation
8. Existing Resume implementation
9. Existing Phase 3 Home implementation

Inspect the actual codebase rather than assuming the documents are perfectly synchronized.

The codebase is the source of truth for implementation details.

Before coding, produce a concise implementation assessment:

- Current Job model/schema
- Current Analysis model/schema
- Current analyze-job API
- Current analysis history API
- Current `useAnalyses` / `useAnalyzeJob` hooks
- Current job hooks
- Current Analyze page
- Current AI Workspace page
- Current AI provider abstraction
- Current design primitives/tokens
- Current tests

Then identify exactly which existing code can be reused.

DO NOT rewrite working systems unnecessarily.

---

# 1. PRODUCT INTENT

The current product has:

- Jobs
- Resumes
- AI Job Analyzer
- Saved Analysis history
- AI Resume Tailoring
- Home command center
- AI Workspace route

But the AI workflow is still fragmented.

Currently:

Analyze:
    paste JD
    ↓
    AI analyzes JD
    ↓
    Analysis saved independently

Tailoring:
    select Resume + Job
    ↓
    AI generates tailored resume

The problem:

The Analysis is not fundamentally attached to the Job.

Phase 4 fixes this.

The AI Workspace should become the place where a user works on ONE specific job.

The mental model should be:

    JOB
      ↓
    ANALYSIS
      ↓
    MATCH
      ↓
    SKILL GAPS
      ↓
    TAILOR
      ↓
    REVIEW
      ↓
    EXPORT
      ↓
    APPLY

Only the first two stages are being implemented now.

---

# 2. PHASE 4 SCOPE

Implement ONLY:

## Step 1 — Select Job

User enters:

`/dashboard/workspace`

They should be able to:

- see/select one of their saved Jobs
- select a Job
- see basic information about that Job
- enter the workspace for that Job

The workspace should clearly communicate:

> You are working on this application.

Display useful job context such as:

- Job title
- Company
- Location if available
- Work mode if available
- Current application status
- Source if available

Do not dump every database field onto the screen.

Use a compact job context header.

---

## Step 2 — Analyze Selected Job

After selecting a Job:

Show the existing AI analysis experience inside the Workspace.

The user should NOT have to manually copy/paste the JD again if the selected Job already contains a description.

The flow becomes:

    Select Job
       ↓
    Existing Job.description
       ↓
    Analyze with existing AI analyzer
       ↓
    Save Analysis
       ↓
    Analysis is linked to Job
       ↓
    Display analysis result

Reuse the existing structured AI analysis schema and Gemini path.

Do NOT rewrite the AI provider abstraction.

---

# 3. IMPORTANT UX DECISION

The AI Workspace is NOT a forced wizard.

Do NOT implement:

    Step 1 → Next → Step 2 → Next → Step 3

Instead, treat it as a persistent job-centric workspace.

The user should feel like they are opening a workspace for an application.

For example:

--------------------------------------------------

AI WORKSPACE

[ Senior Full Stack Developer ]
[ Acme Corp ]   [Applied]   [Remote]

--------------------------------------------------

JOB ANALYSIS

[ Analyze Job ]

or

[ Analysis available · Updated Aug 18 ]

--------------------------------------------------

ANALYSIS RESULT

Company
...

Seniority
...

Tech Stack
...

Required Skills
...

Optional Skills
...

Responsibilities
...

ATS Keywords
...

--------------------------------------------------

Future workspace sections can later appear below:

MATCH SCORE
SKILL GAPS
TAILOR RESUME
REVIEW
EXPORT
APPLICATION

--------------------------------------------------

Do not build those future sections yet.

---

# 4. JOB SELECTION UX

When `/dashboard/workspace` is opened without a selected Job:

Show a purposeful empty state.

NOT:

"No jobs found."

Instead:

# Choose an application to work on

Select a saved job to analyze, match against your resume, and prepare your application.

[ Select Job ]

Below it, optionally show a small list of recent jobs.

Possible layout:

    AI WORKSPACE

    Choose an application
    ─────────────────────────────

    Select a job to begin working on its
    analysis and application preparation.

    [ Search jobs... ]

    ┌───────────────────────────────┐
    │ Senior Full Stack Developer   │
    │ Acme Corp                     │
    │ APPLIED                       │
    └───────────────────────────────┘

    ┌───────────────────────────────┐
    │ React Developer               │
    │ XYZ Labs                      │
    │ WISHLIST                      │
    └───────────────────────────────┘

Keep it simple.

Do not create a complex job-picker component unless the existing UI patterns require it.

Reuse existing Job hooks and components where sensible.

---

# 5. URL / ROUTING DECISION

The workspace must be able to represent WHICH job is being worked on.

Prefer a URL-driven selection.

Recommended:

    /dashboard/workspace?jobId=<JOB_ID>

OR, if the existing routing architecture strongly favors a nested route:

    /dashboard/workspace/<jobId>

Use the least disruptive approach.

Prefer the query parameter if it avoids unnecessary route restructuring.

The selected Job should be recoverable from the URL.

This means:

- refresh should preserve the selected Job
- browser back/forward should behave sensibly
- a workspace can be shared internally through its URL
- the UI does not depend solely on ephemeral React state

Do NOT create a new database entity for Workspace.

The Workspace is a UI concept around an existing Job.

---

# 6. JOB OWNERSHIP / SECURITY

This is critical.

A user must NEVER be able to access another user's Job through:

    /dashboard/workspace?jobId=<other-user-job>

Server-side ownership must remain authoritative.

Existing ownership patterns must be reused.

For example, use the same conceptual pattern as:

    findOwnedJob(id, userId)

Do not trust:

- client-side filtering
- hidden UI
- React state
- query parameters

The server must verify ownership.

If the Job does not belong to the current user:

Return the same safe not-found behavior already used elsewhere.

Do not leak whether the ID exists.

---

# 7. DATABASE CHANGE

The current Analysis model needs to become job-aware.

Add:

    jobId

to `Analysis`.

Requirements:

- nullable
- additive
- existing Analysis records remain valid
- no destructive migration
- existing analysis history must not break

Conceptually:

    Analysis
      id
      userId
      jobId?       ← NEW
      title
      description
      result
      model
      createdAt

Add the appropriate Prisma relation.

Use the project's existing relation conventions.

Do NOT introduce a MatchResult model.

Do NOT introduce a Workspace model.

Do NOT redesign Analysis.

---

# 8. ANALYSIS OWNERSHIP

Analysis must remain user-scoped.

The relationship should effectively be:

    User
      ├── Jobs
      │     └── Analysis
      └── Analysis

An Analysis must not become accessible merely because someone knows its ID.

Existing owner checks remain mandatory.

When creating a job-linked Analysis:

1. authenticate user
2. resolve local User
3. verify Job belongs to User
4. run AI analysis
5. save Analysis with:
       userId
       jobId
6. return the saved Analysis

---

# 9. ANALYZE-JOB API

Inspect the existing:

    POST /api/ai/analyze-job

Do not replace it.

Extend it minimally.

The endpoint should support the job-centric workflow.

Recommended input:

    {
      jobId: string
    }

The server should then:

1. authenticate
2. resolve user
3. fetch owned Job
4. validate Job.description exists
5. use Job.description as the analysis input
6. call the existing AI provider abstraction
7. validate structured output with existing Zod schema
8. persist Analysis with `jobId`
9. return saved Analysis

Do NOT trust the client to provide the Job description.

The Job description must come from the server-side Job record.

This is important for historical integrity and security.

---

# 10. EXISTING ANALYZER COMPATIBILITY

The current analyzer already works with Gemini.

The working path is:

    @ai-sdk/google
          ↓
    Gemini
          ↓
    structured output
          ↓
    Zod validation

DO NOT BREAK THIS.

Do not modify provider routing unless absolutely necessary.

Do not replace:

    src/lib/ai.ts

with a new architecture.

Do not remove:

- Gemini
- existing model picker
- existing AI models
- existing Zod schema
- existing structured output

Claude/GPT gateway failures are NOT part of Phase 4.

If the existing UI exposes unsupported/dead providers, do not spend this phase fixing the gateway.

Gemini remains the known-good provider.

---

# 11. ANALYSIS HISTORY

Existing analysis history must continue working.

Existing behavior:

- list analyses
- open saved analysis
- delete analysis

Do not break existing analyses where:

    jobId = null

These are legacy/unattached analyses.

They should remain accessible.

If useful, visually distinguish:

    Linked to Job
    Unlinked / Legacy Analysis

But this is optional.

Do not migrate old analyses artificially onto Jobs.

---

# 12. WORKSPACE ANALYSIS STATES

The Workspace must handle at least:

## No Job selected

Show job selection UI.

## Job selected, no analysis

Show:

    Job context

    Job description status

    [ Analyze Job ]

## Analyzing

Show a clear loading state.

Example:

    ANALYZING JOB

    Extracting requirements and skills...

Do not use fake progress percentages.

Do not pretend to know how long the AI call will take.

## Analysis success

Show the structured analysis.

## Analysis failure

Show a user-friendly error.

NEVER expose:

- raw provider stack traces
- Bedrock errors
- API keys
- internal request IDs
- raw infrastructure messages

Example:

    Analysis couldn't be completed.

    The AI service didn't return a valid response.
    Please try again.

    [ Try Again ]

The server may log the detailed provider error.

The client should receive a safe message.

If the current implementation violates this, make the smallest necessary improvement while implementing Phase 4.

---

# 13. ANALYSIS RESULT UX

Reuse the existing analysis result presentation where possible.

Do not redesign every analysis component in this phase.

The analysis should clearly belong to the selected Job.

Example hierarchy:

    AI WORKSPACE

    Senior Full Stack Developer
    Acme Corp

    ─────────────────────────────

    JOB ANALYSIS

    Last analyzed
    Aug 18, 2026 · Gemini ...

    ─────────────────────────────

    COMPANY
    ...

    SENIORITY
    ...

    TECH STACK
    ...

    REQUIRED SKILLS
    ...

    OPTIONAL SKILLS
    ...

    RESPONSIBILITIES
    ...

    ATS KEYWORDS
    ...

The exact visual implementation should follow the existing Phase 2 Digital Brutalism system.

---

# 14. MODERN DIGITAL BRUTALISM REQUIREMENTS

Phase 2 established the visual language.

Phase 4 must use it.

Do NOT introduce a new visual system.

Use:

- semantic design tokens
- existing Panel primitive
- existing Button primitive
- existing Pill/status treatment
- hard offset shadows where appropriate
- strong borders
- compact radii
- Geist / Geist Mono
- functional typography
- editorial hierarchy
- dark-first interface

Avoid:

- glassmorphism
- gradients everywhere
- excessive rounded cards
- floating SaaS blobs
- generic dashboard cards
- sparkle AI icons
- decorative AI imagery
- excessive animations

AI should feel like a functional capability, not decoration.

---

# 15. JOB HEADER

The workspace needs a strong persistent context header.

Example:

    AI WORKSPACE

    Senior Full Stack Developer
    Acme Corp

    [APPLIED]  [REMOTE]

    Source: LinkedIn
    Location: Karachi / Remote

    [ View Job ]

Keep the header compact.

The user should always know:

    "Which job am I currently working on?"

This is one of the primary UX goals of Phase 4.

---

# 16. JOB DESCRIPTION

The workspace should provide access to the original Job Description.

Important product principle:

The original JD should remain preserved.

Do not rewrite or mutate the Job.description during AI analysis.

Possible UI:

    ORIGINAL JOB DESCRIPTION

    [ Expand / Collapse ]

    <original description>

This becomes important later for:

    Application Snapshot
    Match Score
    Tailored Resume
    Historical integrity

Do not implement Application Snapshot yet.

Just preserve and display the original JD.

---

# 17. "ANALYZE NEW JOB" ENTRY POINT

The product decision is:

> "Analyze New Job" should remain a first-class entry point.

Do not remove the existing Analyze functionality.

Instead, make it clear how the two concepts relate.

Preferred future model:

    Existing saved Job
        ↓
    AI Workspace

and:

    Analyze New Job
        ↓
    create/save Job
        ↓
    AI Workspace

However:

DO NOT fully implement the "paste JD → automatically create Job → open workspace" flow unless it can be done safely without expanding Phase 4.

The minimum Phase 4 requirement is:

    Existing Job → Workspace → Analyze

If the existing Analyze page remains functional, preserve it.

---

# 18. DO NOT DUPLICATE ANALYSIS LOGIC

Avoid having:

    Analyze page logic

and

    Workspace analyzer logic

that implement the same AI call differently.

Create/reuse shared hooks and components where appropriate.

For example:

    useAnalyzeJob()

should remain the single client mutation abstraction if practical.

The Workspace should call that abstraction.

Do not copy-paste the analyzer request implementation.

---

# 19. ANALYSIS RE-RUN BEHAVIOR

Decide explicitly how repeated analysis works.

Recommended:

If a Job already has an Analysis:

Show:

    Analysis available

    [ Re-analyze ]

Re-analyze should create a NEW Analysis record rather than silently overwrite history.

This preserves analysis history.

Each analysis should retain:

- model
- result
- createdAt
- jobId

The newest analysis can be treated as the current analysis for the workspace.

Do not delete previous analyses automatically.

---

# 20. MULTIPLE ANALYSES FOR ONE JOB

A Job may have:

    Analysis A — Gemini — Aug 10
    Analysis B — Gemini — Aug 15
    Analysis C — Gemini — Aug 18

The Workspace should use the newest one by default.

Do not build a sophisticated version browser in Phase 4.

A simple:

    Previous analyses

or existing history access is sufficient.

Future phases may use historical analysis more deeply.

---

# 21. DATA MODEL / MIGRATION SAFETY

Before changing Prisma:

Inspect the current schema.

Then:

1. Add nullable `jobId`
2. Add relation
3. Generate migration using project conventions
4. Run Prisma validation
5. Run existing tests
6. Verify existing Analysis rows still work

Do NOT:

- delete Analysis rows
- make jobId required
- rename existing fields
- change result JSON shape
- change Job ownership structure
- change Resume lineage
- change Clerk
- change database architecture

---

# 22. TESTING REQUIREMENTS

At minimum, add/update tests for:

### API / data behavior

1. Analysis can be created for an owned Job.
2. Analysis stores correct `jobId`.
3. Analysis cannot be created for another user's Job.
4. Missing Job returns safe not-found behavior.
5. Job without description returns a safe validation error.
6. Existing unlinked Analysis remains valid.
7. Re-analysis creates a new Analysis record.

### UI / hook behavior where the project has test coverage

8. Workspace without jobId shows selection state.
9. Workspace with valid jobId loads the Job.
10. Analyze action triggers the existing analyzer mutation.
11. Loading state is represented.
12. Error state is represented.
13. Successful analysis renders the result.

Do not add a massive testing framework.

Follow the project's existing Vitest conventions.

---

# 23. TYPE SAFETY

Maintain:

    strict TypeScript

No:

    any

No unsafe casts unless absolutely unavoidable and justified.

Use existing Zod schemas.

Do not duplicate types manually if they can be derived.

---

# 24. PERFORMANCE

Do not introduce unnecessary API calls.

When workspace loads:

    Job data
    ↓
    Analysis data

Avoid repeatedly fetching:

    all jobs
    all analyses
    all resumes
    all recruiters

if the workspace only needs one Job and its relevant analyses.

Reuse React Query caching where appropriate.

---

# 25. BACKWARD COMPATIBILITY

Existing routes must continue working:

    /dashboard
    /dashboard/jobs
    /dashboard/recruiters
    /dashboard/resumes
    /dashboard/resumes/tailor
    /dashboard/analyze
    /dashboard/workspace
    /dashboard/insights

Do not break the existing Analyze page.

Do not break Resume Tailoring.

Do not break Jobs CRUD.

Do not break Phase 3 Home.

---

# 26. WHAT MUST NOT BE IMPLEMENTED

This is extremely important.

DO NOT implement:

❌ Match Score

❌ ATS scoring

❌ Skill Gap analysis

❌ Resume diff

❌ Resume review

❌ PDF export

❌ DOCX export

❌ Mark as Applied workflow

❌ Application Snapshot

❌ Insights analytics

❌ Global Search

❌ LinkedIn scraping

❌ Job scraping

❌ Auto-apply

❌ Email automation

❌ Notifications

❌ Scheduled reminders

❌ Billing

❌ Multi-user teams

❌ New Workspace database model

❌ New Activity/event system

❌ New AI provider architecture

These belong to later phases.

---

# 27. IMPORTANT PRODUCT DECISIONS TO PRESERVE

Do not silently change these decisions:

### Match Score terminology

Use:

    Match Score

NOT:

    ATS Score

### Workspace model

Persistent job-centric workspace.

NOT:

    forced wizard

### Resume source of truth

Master resume remains immutable.

Tailored resumes use:

    parentId

### Historical integrity

Original Job Description must remain preserved.

Submitted/tailored resume versions must eventually be traceable.

### AI interaction

AI must never invent experience, skills, companies, metrics, or credentials.

### AI transparency

The product should distinguish:

    detected
    inferred
    missing/not detected

Never tell the user:

    "You don't know Docker"

if the resume simply doesn't mention Docker.

---

# 28. UX PRINCIPLES

Apply these throughout Phase 4:

1. Always show the current job context.
2. Keep the next action obvious.
3. Never hide important state behind decoration.
4. Do not make users repeat information the system already has.
5. Preserve user data.
6. AI actions should explain what they are doing.
7. Loading states must be honest.
8. Errors must be actionable and human-readable.

---

# 29. IMPLEMENTATION STRATEGY

Work in small vertical slices.

Recommended sequence:

### Slice A — Data model

- Add nullable Analysis.jobId
- Add Prisma relation
- Migration
- Verify existing data
- Tests

STOP and verify.

### Slice B — Job-aware analyze API

- Extend analyze-job API to accept jobId
- Fetch owned Job
- Use server-side Job.description
- Save jobId
- Preserve existing analyzer behavior
- Safe errors

STOP and verify.

### Slice C — Workspace job selection

- Read jobId from URL
- Load selected Job
- Show selection state when absent
- Show Job context when selected

STOP and verify.

### Slice D — Workspace analysis

- Existing analysis lookup
- Analyze button
- Loading
- Result
- Re-analyze
- Error state

STOP and verify.

### Slice E — Cleanup / regression

Run:

    TypeScript
    Prisma validation
    Vitest
    Next build

Fix only regressions caused by Phase 4.

---

# 30. DEFINITION OF DONE

Phase 4 is complete ONLY when:

## Job selection

- [ ] `/dashboard/workspace` works
- [ ] User can select a saved Job
- [ ] Selected Job is represented in URL
- [ ] Refresh preserves selected Job
- [ ] Workspace clearly identifies current Job
- [ ] Unauthorized Job cannot be accessed

## Analysis

- [ ] Selected Job's description is used automatically
- [ ] User does not need to paste the JD again
- [ ] Existing AI analysis schema is reused
- [ ] Existing Gemini provider path still works
- [ ] Analysis is persisted
- [ ] Analysis contains `jobId`
- [ ] Existing unlinked analyses still work
- [ ] Re-analysis preserves history

## UX

- [ ] Empty state exists
- [ ] Loading state exists
- [ ] Error state exists
- [ ] Success state exists
- [ ] Original JD remains unchanged
- [ ] Workspace follows Digital Brutalism design system
- [ ] Current Job context is always visible

## Engineering

- [ ] Ownership checks are server-side
- [ ] No raw provider errors reach client
- [ ] No `any`
- [ ] Existing tests remain green
- [ ] New relevant tests added
- [ ] `tsc` passes
- [ ] Prisma validates
- [ ] Production build passes

---

# 31. STATE.MD REQUIREMENT

After implementation, update `STATE.md`.

Record:

### Completed

Phase 4 — AI Workspace: Job Selection + Job-Keyed Analysis

Document:

- Workspace URL strategy
- Analysis.jobId addition
- API changes
- ownership behavior
- analysis history behavior
- UX states
- tests/build status

### Not implemented

Explicitly preserve the upcoming roadmap:

Phase 5 — Match Score + Skill Gaps
Phase 6 — Resume Review + Export
Phase 7 — Application Lifecycle
Phase 8 — Insights
Phase 9 — Global Search

Do not mark future functionality as complete.

---

# 32. FINAL REPORT REQUIRED

When finished, provide a concise implementation report containing:

## 1. Files changed

List files created/modified.

## 2. Database changes

Explain exactly what changed to Analysis.

## 3. API changes

Explain the new/changed request and response behavior.

## 4. Workspace UX

Explain:

- no-job state
- job-selected state
- analyzing state
- success state
- error state

## 5. Security

Explain how Job ownership is enforced.

## 6. Tests

Report:

    tsc:
    Prisma:
    Vitest:
    Build:

Use actual results.

## 7. Scope check

Explicitly confirm:

    Match Score: NOT IMPLEMENTED
    Skill Gaps: NOT IMPLEMENTED
    Resume Review: NOT IMPLEMENTED
    Export: NOT IMPLEMENTED
    Application lifecycle: NOT IMPLEMENTED

## 8. STATE.md

Confirm it was updated.

---

# FINAL INSTRUCTION

Think like a product engineer, not a code generator.

The objective is NOT to produce the largest amount of code.

The objective is to establish the correct product architecture:

        SAVED JOB
           ↓
      AI WORKSPACE
           ↓
       ANALYSIS
           ↓
    [future phases]
      MATCH SCORE
      SKILL GAPS
      TAILOR
      REVIEW
      EXPORT
      APPLY

Keep this phase focused.

Preserve working code.

Prefer reuse over rewriting.

Prefer additive changes over destructive changes.

Do not invent requirements.

Do not move into future phases.

Before making any major architectural change not described above, STOP and explain the proposed change and why it is necessary.