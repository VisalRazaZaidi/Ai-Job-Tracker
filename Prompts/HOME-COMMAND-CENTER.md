# AI JOB TRACKER — PHASE 3 IMPLEMENTATION PROMPT

You are continuing work on the existing AI Job Tracker project.

Phase 1 — IA + Navigation Shell — is complete.

Phase 2 — Modern Digital Brutalism Visual Pass — is complete.

Your task now is to implement:

# PHASE 3 — HOME COMMAND CENTER

This phase transforms the current `/dashboard` Home page from a CRUD-oriented statistics dashboard into a goal-oriented application command center.

IMPORTANT:

Implement PHASE 3 ONLY.

Do not implement Phase 4 or later.

Do not implement AI Workspace functionality.
Do not implement Match Score.
Do not implement Skill Gap analysis.
Do not implement Resume Diff.
Do not implement PDF export.
Do not implement Application Snapshot.
Do not implement Insights analytics.
Do not implement Global Search.
Do not redesign the Applications page.
Do not redesign the Contacts page.
Do not redesign the Resumes page.

The primary objective is:

> Make Home feel like the control center for the user's job search.

---

# 1. REQUIRED CONTEXT

Before changing code, read:

1. `STATE.md`
2. `MASTER_PROMPT_V2.md`
3. `PRODUCT_UX_SPEC_V2.md`
4. `Project_Requirements.md`

Then inspect:

* `src/app/dashboard/page.tsx`
* `src/app/dashboard/layout.tsx`
* `src/app/dashboard/jobs/page.tsx`
* `src/app/dashboard/recruiters/page.tsx`
* `src/features/jobs/hooks.ts`
* `src/features/jobs/status.ts`
* recruiter hooks
* existing shared UI primitives created during Phase 2
* `src/app/globals.css`
* existing dashboard components
* existing TypeScript types/schemas

Understand exactly what data Home currently receives before changing the UI.

Do not assume new APIs are necessary.

---

# 2. PRODUCT TRANSFORMATION

CURRENT:

Dashboard
→ 7 equal stat tiles
→ Follow-ups Due
→ Recent Activity

This is technically functional but product-wise it behaves like a database overview.

TARGET:

Home
→ Greeting / context
→ Primary actions
→ Application pipeline
→ Attention required
→ Recent activity
→ Optional lightweight job-search insight

The target experience should answer:

"What should I do right now?"

The page should not feel like a reporting dashboard.

It should feel like a command center.

---

# 3. CORE UX PRINCIPLE

The Home page must have clear visual hierarchy.

Not every piece of information is equally important.

Priority should be approximately:

1. What needs action
2. What I can do next
3. Current application pipeline
4. Recent activity
5. Secondary statistics

The user should not need to scan seven equal cards to understand their current state.

---

# 4. TARGET HOME STRUCTURE

Implement the following conceptual structure:

```text
┌──────────────────────────────────────────────────────┐
│ Greeting / Context                                   │
│ Good morning, [Name].                                │
│ [contextual application summary]                     │
│                                                      │
│ [ + Add Job ]              [ Open AI Workspace ]     │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ APPLICATION PIPELINE                                 │
│                                                      │
│ Wishlist → Applied → Interview → Offer → Rejected    │
│    3         5          2          1         4       │
└──────────────────────────────────────────────────────┘

┌───────────────────────────────┬──────────────────────┐
│ ATTENTION REQUIRED            │ QUICK STATUS          │
│                               │                       │
│ 2 follow-ups overdue          │ 15 applications       │
│ 1 application needs resume    │ 5 applied             │
│ 1 interview this week         │ 2 interviews          │
│                               │ 1 offer               │
└───────────────────────────────┴──────────────────────┘

┌──────────────────────────────────────────────────────┐
│ RECENT ACTIVITY                                      │
│                                                      │
│ ...                                                  │
└──────────────────────────────────────────────────────┘
```

This is a conceptual hierarchy, not a requirement to reproduce the exact ASCII layout.

Use the existing Phase 2 design system.

---

# 5. SECTION 1 — GREETING / CONTEXT HEADER

At the top of Home, introduce a concise contextual greeting.

Example:

"Good morning, Visal."

Below it, provide a short contextual sentence.

Examples:

If there are applications:

"You have 3 applications that need attention."

If there are no applications:

"Your job search starts here."

If there are overdue follow-ups:

"You have 2 overdue follow-ups."

If there are interviews:

"You have 1 interview coming up."

The message should be generated from real application data.

Do not fabricate activity.

Do not create an AI-generated greeting.

This is deterministic UI logic.

---

# 6. TIME-OF-DAY GREETING

Use the user's local browser time.

Suggested ranges:

Morning:
05:00–11:59

Afternoon:
12:00–17:59

Evening:
18:00–23:59

Night:
00:00–04:59

Examples:

"Good morning, [Name]."

"Good afternoon, [Name]."

"Good evening, [Name]."

Do not make the greeting overly conversational.

Avoid:

"Hey superstar!"

"Let's crush your job search!"

"You're going to land that job!"

The tone should remain professional and product-oriented.

---

# 7. PRIMARY ACTIONS

Immediately below the greeting, provide two primary actions:

## Primary

`+ Add Job`

Route/action:

Open the existing Job creation dialog.

Do NOT create a new job form.

Reuse the existing JobFormDialog and existing create mutation.

---

## Secondary Primary Action

`Open AI Workspace`

Navigate to:

`/dashboard/workspace`

Remember:

The AI Workspace is currently only a Phase 1 stub.

Do NOT implement Workspace functionality in this phase.

The button simply provides the future primary AI entry point.

---

# 8. IMPORTANT — "ANALYZE NEW JOB"

Do NOT add a third prominent CTA called:

"Analyze New Job"

during this phase unless the existing application already has a clean reusable mechanism for it.

The future intended flow is:

Analyze New Job
→ Save Job
→ AI Workspace

But implementing that flow belongs to Phase 4.

For Phase 3:

The primary CTA should be:

`+ Add Job`

The AI CTA should be:

`Open AI Workspace`

Do not duplicate entry points unnecessarily.

---

# 9. APPLICATION PIPELINE

Create a prominent pipeline section.

Use the existing Job status enum and status configuration.

The pipeline should represent the user's application lifecycle.

Target visible stages:

* Wishlist
* Applied
* Interview
* Offer
* Rejected

Use the actual existing status values and map them appropriately.

IMPORTANT:

Before implementing, inspect the existing status enum.

Do NOT invent new database statuses.

Do NOT modify the Prisma enum.

Do NOT change existing status semantics.

If the existing application has multiple interview/application states, use the existing status mapping rather than altering the schema.

---

# 10. PIPELINE VISUAL DESIGN

This should NOT look like five generic cards.

It should visually communicate progression.

Possible structure:

```text
WISHLIST      APPLIED       INTERVIEW       OFFER       REJECTED
   3             5              2              1            4
   ●─────────────●──────────────●──────────────●────────────●
```

Or an equivalent structured layout.

Use:

* status colors from `src/features/jobs/status.ts`
* Geist Mono for counts
* strong borders
* compact spacing
* Phase 2 brutalist visual language

Do not introduce a new color system.

---

# 11. PIPELINE INTERACTION

Each pipeline stage must be clickable.

Clicking:

Wishlist
→ `/dashboard/jobs` filtered to Wishlist

Applied
→ `/dashboard/jobs` filtered to Applied

Interview
→ `/dashboard/jobs` filtered appropriately

Offer
→ `/dashboard/jobs` filtered appropriately

Rejected
→ `/dashboard/jobs` filtered to Rejected

IMPORTANT:

Before implementing URL filters, inspect how `JobFilters.tsx` currently works.

If the existing Applications page does not support URL-based filtering:

Do NOT build a large filtering architecture in Phase 3.

Instead use the smallest reliable approach.

Possible acceptable implementation:

* query parameter
* route state
* existing filter state if reusable

Prefer URL query parameters if they can be implemented cleanly because they make the Home → Applications transition shareable and predictable.

Example:

`/dashboard/jobs?status=APPLIED`

But adapt this to the actual existing status implementation.

Do not break existing filtering.

---

# 12. PIPELINE COUNTS

Counts must come from real Jobs data.

Do not hardcode.

Use existing `useJobs` data where practical.

Do not create a new analytics API just to calculate these counts.

At the current scale, client-side aggregation is acceptable if the existing page already loads the user's jobs.

Example:

```ts
const wishlistCount = jobs.filter(...).length;
```

Use the actual enum values.

Do not duplicate status definitions.

---

# 13. ATTENTION REQUIRED

This is the most important new Home section.

The user should immediately see items that require action.

Possible attention categories:

## A. Overdue follow-ups

Existing `nextFollowUp` data.

Example:

"2 follow-ups overdue"

Click:

→ Applications or Contacts depending on the item.

Use the existing follow-up data.

---

## B. Upcoming follow-ups

Example:

"Follow up with Acme tomorrow"

Make the item actionable.

---

## C. Applications without a tailored resume

Only show this if the current data model can reliably determine it.

IMPORTANT:

Do NOT invent a relationship that does not exist.

The existing application/job model and Resume lineage must be inspected first.

If there is currently no reliable way to determine:

"this job has no tailored resume"

then DO NOT fake the metric.

Instead omit this attention category until Phase 4/6 provides the necessary relationship.

---

## D. Upcoming interviews

If the existing status/data model contains enough information to identify upcoming interviews, surface them.

If there is no interview date in the current schema:

DO NOT invent one.

Do not add schema changes in Phase 3.

---

# 14. ATTENTION ITEM LANGUAGE

Use precise language.

Good:

"2 follow-ups overdue"

"Follow up with Acme Corp"

"Interview status needs attention"

Bad:

"You're falling behind!"

"You need to hustle!"

"Don't forget your dream job!"

Keep it professional.

---

# 15. EMPTY ATTENTION STATE

If there is nothing requiring attention, do NOT leave an empty blank panel.

Show a positive but restrained state.

Example:

"You're all caught up."

"Nothing requires attention right now."

This should still visually occupy the appropriate section without feeling like a large empty card.

Do not use celebratory animations.

---

# 16. QUICK STATUS / SECONDARY SUMMARY

The old dashboard had seven equal stat tiles.

Do NOT preserve the old seven-tile grid.

Instead, retain useful information in a compact secondary summary.

Potential values:

* Total applications
* Applied
* Interviews
* Offers
* Rejected

Use the existing data.

The exact implementation can be:

* compact inline metrics
* small structured panel
* side summary beside Attention Required

Do not create another equal-weight tile dashboard.

The pipeline already communicates the major lifecycle counts.

The secondary summary should therefore be visually subordinate.

---

# 17. RECENT ACTIVITY

Keep the existing Recent Activity functionality.

It currently derives activity from existing records/`updatedAt`.

Do NOT create a new Activity model.

Do NOT build an event system.

Do NOT pretend that derived activity is a true event log.

Preserve the existing honest behavior.

Visually move Recent Activity lower on the page because it is secondary to current actions.

Keep:

* loading state
* empty state
* existing links
* existing activity derivation

Improve presentation using Phase 2 primitives.

---

# 18. OPTIONAL AI INSIGHTS

The Product UX Specification mentions future AI insights on Home.

DO NOT introduce AI API calls in Phase 3.

Do NOT call Gemini from Home.

Do NOT create AI-generated dashboard summaries.

If useful, a small deterministic "Job Search Snapshot" may be displayed.

Example:

"5 applications this month"

But only use existing data.

Do NOT label deterministic statistics as "AI insights."

AI-powered insights belong to a future phase.

---

# 19. HOME LAYOUT

Use responsive layout.

Desktop:

```text
Header
Actions

Pipeline

Attention + Secondary Status

Recent Activity
```

A two-column layout may be used for:

Attention Required
+
Secondary Status

But avoid forcing two columns if the content would become cramped.

Mobile:

Stack sections vertically.

Primary actions should remain accessible.

Pipeline should remain readable without creating horizontal overflow.

Do NOT build a completely separate mobile application.

Use responsive CSS.

---

# 20. DIGITAL BRUTALISM APPLICATION

Phase 2 established the visual system.

Phase 3 should USE that system.

Use:

* semantic surfaces
* strong borders
* compact radii
* selective hard offset shadows
* editorial section labels
* Geist Mono for data
* accent for primary actions
* status colors from `status.ts`

Do NOT introduce new visual patterns.

Do NOT create a second design system specifically for Home.

---

# 21. HARD SHADOW USAGE

Use hard shadows selectively.

Recommended:

Primary "Add Job" action:
→ optional hard offset shadow

Important pipeline/attention container:
→ optional hard offset shadow

Do NOT put hard shadows on every element.

Avoid making the dashboard look like a collection of stickers.

The visual target is:

structured + brutalist

not:

chaotic + brutalist

---

# 22. INFORMATION DENSITY

This is a productivity application.

Do not waste excessive vertical space.

The user should be able to understand the majority of their job-search state without excessive scrolling on a typical desktop viewport.

Prioritize:

* concise labels
* compact metadata
* clear numbers
* strong hierarchy

Avoid:

* huge hero sections
* giant typography
* decorative illustrations
* unnecessary descriptions

Home is a command center, not a marketing page.

---

# 23. ADD JOB ACTION

Reuse the existing:

`JobFormDialog`

Do not create another job creation form.

The Add Job action should behave exactly like the existing job creation flow.

After creating a job:

* invalidate/refetch jobs
* Home counts should update
* pipeline should update
* recent activity should update if existing behavior supports it

Do not create new APIs.

---

# 24. DATA ARCHITECTURE

Use existing hooks and APIs wherever possible.

Prefer:

`useJobs()`

and:

`useRecruiters()`

over creating new dashboard endpoints.

Do not introduce:

* `/api/dashboard`
* `/api/analytics`
* `/api/activity`
* new database models

unless an actual blocking issue proves an existing API is insufficient.

At the current application scale, derived client-side data is acceptable.

---

# 25. AUTHORIZATION / OWNERSHIP

Do not change ownership logic.

All data must continue to come through the existing owner-scoped APIs/hooks.

Never query another user's data.

Do not introduce direct client access to Prisma.

---

# 26. LOADING STATES

Home must have intentional loading states.

Avoid displaying:

`0 applications`

while data is still loading.

Use the existing loading approach where possible.

Possible treatment:

* skeleton
* muted placeholder
* existing loading component

Do not introduce excessive skeleton animations.

---

# 27. ERROR STATES

If Jobs or Recruiters data fails:

Show a clear user-facing message.

Do NOT expose:

* stack traces
* Prisma errors
* raw API errors
* provider errors

Example:

"Couldn't load your applications."

Provide:

`Retry`

if the existing query mechanism supports it cleanly.

Do not refactor the entire error architecture in Phase 3.

---

# 28. EMPTY STATE

For a new user with no jobs:

Home should feel intentional.

Example structure:

```text
Good morning, [Name].

Your job search starts here.

[ + Add Job ]    [ Open AI Workspace ]

No applications yet.

Add your first job to start building your pipeline.
```

The empty state should direct the user toward the first meaningful action.

Do not show:

0 Wishlist
0 Applied
0 Interview
0 Offer
0 Rejected

as the dominant experience.

The product should encourage the first action instead.

---

# 29. NAVIGATION INTEGRATION

Do not change the Phase 1 navigation.

It remains:

Home
Applications
AI Workspace
Resumes
Contacts
Insights

Home should act as the command center that links users into those areas.

Examples:

Pipeline stage
→ Applications

Follow-up contact
→ Contacts

Open AI Workspace
→ AI Workspace

Do not add additional top-level navigation items.

---

# 30. ROUTES

Do not create new routes.

Use:

`/dashboard`

for Home.

Use existing:

`/dashboard/jobs`

for Applications.

Use existing:

`/dashboard/recruiters`

for Contacts.

Use:

`/dashboard/workspace`

for AI Workspace.

No new routes are required for Phase 3.

---

# 31. ACCESSIBILITY

The Home page must remain keyboard accessible.

Ensure:

* buttons are real buttons
* navigation uses links
* clickable pipeline items are keyboard accessible
* focus states remain visible
* color is not the only indicator
* semantic headings are used
* interactive elements have meaningful accessible labels

Do not create clickable `<div>` elements when a button or link is appropriate.

---

# 32. DO NOT OVER-ABSTRACT

Use Phase 2 shared primitives.

Do not create:

`DashboardCard1`
`DashboardCard2`
`DashboardCard3`
`DashboardPipelineCard`
`DashboardFancyPanel`

unless there is a real reusable abstraction.

Prefer semantic components such as:

* `HomeHeader`
* `Pipeline`
* `AttentionRequired`
* `RecentActivity`

if componentization improves readability.

Keep the implementation understandable.

---

# 33. COMPONENT STRUCTURE

A reasonable structure may be:

```text
src/
└── app/
    └── dashboard/
        ├── page.tsx
        └── components/
            ├── HomeHeader.tsx
            ├── ApplicationPipeline.tsx
            ├── AttentionRequired.tsx
            ├── QuickStatus.tsx
            └── RecentActivity.tsx
```

However:

Do not create this exact structure if the current project architecture suggests a better location.

Follow the existing project's conventions.

---

# 34. PERFORMANCE

Do not add unnecessary requests.

Do not fetch the same Jobs data multiple times just to populate different sections.

Prefer deriving all Home information from the existing query/cache.

Avoid unnecessary client-side effects.

Do not introduce a global state library.

---

# 35. PHASE 3 NON-GOALS

Explicitly DO NOT implement:

### AI Workspace

No functionality.

### Analyze New Job

No new workflow.

### Match Score

No algorithm.

### Skill Gaps

No algorithm.

### Resume tailoring

No changes.

### Resume Diff

No changes.

### PDF export

No changes.

### Application Snapshot

No changes.

### Application history model

No changes.

### Insights

No analytics.

### Global Search

No search.

### Notifications

No email/push notifications.

### Scheduled reminders

No notification scheduler.

### Activity event system

No new Activity model.

### Database changes

No Prisma migration.

---

# 36. VALIDATION

After implementation run:

1. TypeScript typecheck
2. Full existing Vitest suite
3. Production build

Use the project's existing commands from `package.json`.

Expected:

TypeScript → PASS
Tests → PASS
Build → PASS

Do not delete or weaken tests.

Do not bypass type errors.

Do not suppress build errors.

---

# 37. MANUAL UX VERIFICATION

Before reporting completion, manually inspect Home and verify:

## New user

* Greeting works
* Empty state is useful
* Add Job works
* AI Workspace button works
* No misleading zero-stat overload

## Existing user

* Pipeline counts are correct
* Pipeline status colors are correct
* Clicking pipeline stages works
* Attention items are accurate
* Recent activity still works
* Add Job works
* Home updates after creating a job

## Responsive

Check:

* desktop
* tablet
* mobile

Verify there is no accidental horizontal overflow.

---

# 38. DATA ACCURACY CHECK

This is critical.

Every number shown on Home must be derived from actual application data.

Do not fabricate:

* application counts
* interviews
* offers
* follow-ups
* tailored resumes
* upcoming interviews

If the schema does not contain enough information to make a statement accurately:

DO NOT display it.

This principle is more important than filling every planned UI slot.

---

# 39. STATE.md UPDATE

After successful implementation, update:

`STATE.md`

Under:

`Productization v2 progress`

mark:

`Phase 3 — Home command center` as COMPLETE.

Add a concise summary describing:

* command-center hierarchy
* contextual greeting
* primary actions
* application pipeline
* attention-required section
* secondary status summary
* recent activity repositioning
* Home → Applications interactions

Do NOT mark Phase 4+ complete.

Update the roadmap so the next phase is:

`Phase 4 — AI Workspace functionality`

Do not erase historical implementation information.

---

# 40. FINAL REPORT

When complete, provide:

## 1. Files changed

List every modified/created file and explain why.

## 2. Home architecture

Explain the final Home hierarchy.

## 3. Data sources

Explain which existing hooks/APIs power:

* pipeline
* attention
* quick status
* activity

Confirm whether any new API/database changes were required.

## 4. User interactions

Explain:

* Add Job
* Open AI Workspace
* Pipeline filtering/navigation
* Attention item navigation

## 5. Responsive behavior

Briefly describe desktop/tablet/mobile behavior.

## 6. Validation

Report:

TypeScript: PASS/FAIL
Tests: PASS/FAIL
Production build: PASS/FAIL

## 7. Scope control

Explicitly state:

"Only Phase 3 was implemented. No Phase 4+ functionality was implemented."

## 8. STATE.md

Confirm it was updated.

Then STOP.

Do not automatically begin Phase 4.

Wait for further instructions.

```

### Why I want Phase 3 structured this way

There are a few deliberate constraints here that are important for your product.

**First, we're killing the "7 equal cards" problem.** The old dashboard technically showed useful information, but it didn't tell you what mattered. Your Home should instead have a hierarchy:

**Context → Action → Pipeline → Attention → Activity**

That is much closer to a real SaaS workspace.

**Second, I'm explicitly preventing Claude from inventing data.** For example, your current schema may not be able to reliably answer *"1 application without a tailored resume"* because the current tailoring relationship isn't necessarily attached to a Job in a way Home can safely query. If the data isn't there, **don't fake the metric**. We'll solve that properly when the AI Workspace/application model is connected in Phase 4.

**Third, the pipeline should become a navigation mechanism, not just decoration.** If you click `Applied: 5`, you should land in Applications already filtered to those applications. That makes Home an actual command center rather than another dashboard.

And finally, **Phase 3 should be the last "mostly existing-data" phase.** Phase 4 is where things get substantially more interesting: we'll take the existing Analyze + Tailor functionality and turn `/dashboard/workspace` into the actual job-centric AI workflow you originally wanted.
```
