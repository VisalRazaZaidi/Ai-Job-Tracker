# MASTER PROMPT V2 — AI Job Tracker
## AI-First SaaS Productization & UX Transformation

You are the lead engineer, product designer, UX architect, and technical product partner responsible for transforming the existing AI Job Tracker codebase into a polished, AI-first SaaS product.

This is NOT a greenfield project.

The application already has a working technical foundation, authentication, database, CRUD functionality, AI integrations, resume management, and AI resume tailoring.

Your job is to evolve the existing product into a cohesive AI-powered job application workspace.

You must preserve working functionality, respect the existing architecture, and avoid unnecessary rewrites.

---

# 1. PRODUCT VISION

The product is no longer positioned internally as:

> "A job tracker with some AI features."

The product should be designed and developed as:

> "An AI-powered job application workspace that helps users go from discovering a job to preparing, tailoring, applying, tracking, and following up on that application."

The job tracker is the underlying system of record.

The AI application workflow is the core product experience.

The product should help a user move through this journey:

    FIND A JOB
        ↓
    ADD JOB
        ↓
    UNDERSTAND THE JOB
        ↓
    ANALYZE FIT
        ↓
    IDENTIFY SKILL GAPS
        ↓
    TAILOR RESUME
        ↓
    REVIEW AI CHANGES
        ↓
    EXPORT APPLICATION MATERIALS
        ↓
    APPLY
        ↓
    TRACK APPLICATION
        ↓
    FOLLOW UP
        ↓
    INTERVIEW / OFFER / REJECTION

The UI and information architecture must communicate this workflow.

The user should not feel like they are navigating a collection of CRUD database tables.

They should feel like they are using a personal AI-powered job search operating system.

---

# 2. CRITICAL CONTEXT — THIS IS AN EXISTING CODEBASE

Before making any changes:

1. Read `STATE.md`.
2. Read `Project_Requirment.md`.
3. Read the current project documentation.
4. Inspect the existing Prisma schema.
5. Inspect the current route structure.
6. Inspect existing API routes.
7. Inspect existing feature folders.
8. Inspect the current AI provider abstraction.
9. Inspect the existing dashboard and navigation.
10. Inspect the existing resume and job workflows.

Treat `STATE.md` as the current source of truth for what is already implemented.

Do not assume that the original requirements accurately describe the current implementation.

The current implementation takes precedence when determining what already exists.

---

# 3. CURRENT PROJECT FOUNDATION

The current project already contains, among other things:

- Clerk authentication
- User ownership enforcement
- PostgreSQL + Prisma
- Jobs CRUD
- Recruiters CRUD
- Dashboard overview
- Job detail view
- Follow-up dates
- Recent activity derived from updated records
- Job description AI analysis
- Resume CRUD
- PDF/DOCX resume import
- Markdown-based master resume
- Resume version lineage through `parentId`
- AI resume tailoring
- Gemini native SDK integration
- AI provider abstraction
- Zod validation
- Vitest tests
- TypeScript strict mode
- Deployment
- Existing dark design system

Do not rebuild these systems unnecessarily.

Reuse them.

Improve them where required.

---

# 4. NON-NEGOTIABLE ENGINEERING PRINCIPLES

## 4.1 Do not rewrite the application

Do NOT:

- throw away the current codebase
- replace the entire architecture
- migrate frameworks without a concrete reason
- replace Prisma
- replace Clerk
- rewrite working APIs
- replace the existing AI provider abstraction
- replace working resume parsing
- replace working resume tailoring
- rebuild the database from scratch

The goal is productization, not a technology rewrite.

---

## 4.2 Preserve existing functionality

Every existing feature that currently works must continue to work after the redesign.

This includes:

- Authentication
- User ownership
- Jobs CRUD
- Recruiters CRUD
- Job detail view
- Follow-ups
- Resume CRUD
- PDF/DOCX import
- Markdown editing
- Resume versioning
- AI job analysis
- AI resume tailoring

If an existing feature is moved to a new location in the UI, preserve its underlying functionality.

---

## 4.3 Inspect before modifying

Before modifying any file:

1. Read it.
2. Understand its dependencies.
3. Understand its data flow.
4. Check whether other features depend on it.
5. Make the smallest safe change.

Do not blindly overwrite files.

---

## 4.4 Do not invent functionality

Do not claim that a feature is implemented unless it actually works.

Do not create fake AI outputs.

Do not fabricate ATS scores.

Do not invent skills in resumes.

Do not fabricate candidate experience.

AI must follow the existing product rule:

> Never invent user experience, skills, education, achievements, companies, projects, or credentials.

AI may:

- reorder
- rephrase
- optimize wording
- improve clarity
- improve keyword alignment
- identify gaps
- recommend improvements

AI must not create false qualifications.

---

# 5. PRODUCT ARCHITECTURE

The product should evolve from:

    Dashboard
    Jobs
    Recruiters
    Resumes
    Analyze

into a more cohesive task-oriented experience.

The exact final navigation may be refined during implementation, but the product should conceptually contain:

## Home

The user's job-search command center.

## Applications / Jobs

The user's application pipeline and job database.

## AI Workspace

The primary place where a user analyzes jobs and prepares applications.

## Resumes

Master resumes and tailored resume versions.

## Contacts / Recruiters

Recruiter and hiring-contact management.

## Insights

Application analytics and job-search intelligence.

The navigation must prioritize user goals rather than database entities.

---

# 6. CORE PRODUCT LOOP

The most important product flow is:

    ADD JOB
        ↓
    JOB ANALYSIS
        ↓
    MATCH EVALUATION
        ↓
    SKILL GAP ANALYSIS
        ↓
    RESUME TAILORING
        ↓
    REVIEW CHANGES
        ↓
    EXPORT
        ↓
    APPLY
        ↓
    TRACK
        ↓
    FOLLOW UP

This should be the central experience of the product.

The user should be able to understand this workflow without reading documentation.

---

# 7. DASHBOARD REDESIGN

The current dashboard is functional but overly CRUD-oriented.

Transform it into a Job Search Command Center.

The dashboard should answer:

1. What is happening with my job search?
2. What applications need my attention?
3. What should I do next?
4. Which applications are progressing?
5. Which follow-ups are due?
6. Where can AI help me?

The dashboard should prioritize actionable information.

Avoid excessive generic statistic cards.

Instead of presenting seven equally weighted numbers, establish a visual hierarchy.

Suggested structure:

    HEADER

    Greeting / current job-search summary

    PRIMARY ACTIONS
    [ + Add Job ]
    [ Open AI Workspace ]

    APPLICATION PIPELINE

    Saved
    Preparing
    Applied
    Interview
    Offer
    Rejected

    ATTENTION REQUIRED

    Follow-ups due
    Applications needing action
    Resume improvements

    AI INSIGHTS

    Strong job matches
    Skill gaps
    Resume optimization opportunities

    RECENT APPLICATION ACTIVITY

The dashboard should feel alive and useful.

It should tell the user what to do next.

---

# 8. "ADD JOB" MUST BE A PRIMARY ACTION

Adding a job should be one of the most visible actions in the application.

The user may have discovered the job through:

- LinkedIn
- Indeed
- WhatsApp
- Rozee.pk
- Company websites
- Referrals
- Other job platforms

The product should support adding a job through:

1. Job description
2. Job URL, when supported
3. Manual entry

The primary workflow should be:

    + Add Job
        ↓
    Paste Job Description
        ↓
    Optional URL
        ↓
    Enter / Detect company and role
        ↓
    Save Job
        ↓
    Analyze with AI

The user should not have to navigate through multiple unrelated CRUD pages to start an application workflow.

---

# 9. AI WORKSPACE

The AI Workspace is the core differentiating feature.

It should combine functionality that currently exists separately.

The workspace should support:

    JOB
      +
    USER PROFILE
      +
    MASTER RESUME
      ↓
    AI ANALYSIS
      ↓
    MATCH SCORE
      ↓
    SKILL ANALYSIS
      ↓
    RESUME TAILORING
      ↓
    APPLICATION PREPARATION

The user should be able to understand:

- What the company is looking for
- What skills are required
- What skills they already have
- What skills are missing
- How well their resume matches
- What keywords are important
- What changes AI recommends
- What changes AI made to the resume

Do not hide all information behind AI-generated prose.

Use structured, scannable UI.

---

# 10. JOB ANALYSIS EXPERIENCE

The existing AI Job Analyzer already produces structured information.

Preserve and improve it.

The analysis should present:

- Company summary
- Role summary
- Seniority
- Interview difficulty
- Tech stack
- Required skills
- Optional skills
- Responsibilities
- ATS keywords

The output should be visually organized.

Avoid a large wall of AI-generated text.

Use:

- Tags
- Skill groups
- Structured sections
- Expandable sections where appropriate
- Clear hierarchy

The analysis should feel like intelligence extracted from the JD.

---

# 11. ATS MATCH SCORING

Implement ATS match scoring as a real feature.

The score must be based on an actual comparison between:

    Job Description
        +
    Resume

The system should not fabricate the score.

The score should consider factors such as:

- Required skills
- Technical skills
- Keywords
- Responsibilities
- Seniority
- Relevant experience
- Domain alignment

The UI should show:

    MATCH SCORE
    87%

Then explain:

    Strong matches
    Missing skills
    Missing keywords
    Partial matches

Do not make the score the only output.

The user needs to understand WHY the score is what it is.

---

# 12. SKILL GAP ANALYSIS

The product should identify:

- Strong matches
- Partial matches
- Missing skills
- Missing keywords

Example:

    STRONG MATCHES

    ✓ React
    ✓ TypeScript
    ✓ Node.js

    PARTIAL

    ◐ PostgreSQL
    ◐ Docker

    GAPS

    ! AWS
    ! Kubernetes

The AI must distinguish between:

- Actually missing from the resume
- Actually missing from the candidate profile
- Present but poorly represented

Do not automatically assume that a skill is missing from the user simply because it is missing from the resume.

Use language carefully.

For example:

> "Not detected in your resume"

rather than:

> "You don't know AWS"

unless the system has reliable evidence.

---

# 13. RESUME EXPERIENCE

The current architecture uses:

- Markdown as master resume source of truth
- PDF/DOCX import
- Editable markdown
- Tailored versions
- Parent-child lineage

Preserve this architecture.

The master resume must remain immutable during tailoring.

The workflow should be:

    MASTER RESUME
        ↓
    SELECT JOB
        ↓
    AI TAILOR
        ↓
    SHOW CHANGES
        ↓
    USER REVIEWS
        ↓
    SAVE AS NEW VERSION

Never overwrite the master resume automatically.

---

# 14. RESUME DIFF / REVIEW

The current AI tailoring flow should be improved.

Do not only show:

    Old resume
    New resume

Provide a meaningful review experience.

The user should be able to see:

- Added content
- Removed content
- Reworded content
- Reordered sections
- Keyword improvements

The user must remain in control.

The user should be able to edit the tailored resume before saving.

AI suggestions should be reversible.

---

# 15. PDF / DOCX EXPORT

Implement export after the tailoring workflow is stable.

The user should be able to:

    Tailor Resume
        ↓
    Review
        ↓
    Edit
        ↓
    Export PDF
        ↓
    Download

The exported resume should be professional and ATS-friendly.

Avoid decorative layouts that harm ATS parsing.

Maintain clean typography and consistent formatting.

---

# 16. APPLICATION LIFECYCLE

The product should connect AI preparation to application tracking.

The user should be able to move from:

    Preparing
        ↓
    Applied
        ↓
    Interview
        ↓
    Offer

or:

    Rejected

The transition from AI Workspace to Application Tracking should feel seamless.

For example:

    [Mark as Applied]

should update the job/application state.

The user should not have to manually recreate the application in another section.

---

# 17. APPLICATION TIMELINE

The current Recent Activity system is derived from `updatedAt`.

Keep it for now if it is sufficient.

Do not introduce a full event system unless needed.

However, design the UI so the product can eventually support a real timeline.

The desired future experience is:

    TODAY

    09:42
    AI generated tailored resume
    Senior Full Stack Developer

    09:38
    Job analyzed
    ABC Technologies

    09:30
    Application marked as Applied

    YESTERDAY

    Job added

Do not build fake activity events.

If an event system is not implemented, label derived activity appropriately.

---

# 18. FOLLOW-UP EXPERIENCE

Follow-ups should become more actionable.

Current behavior:

- nextFollowUp on Job
- nextFollowUp on Recruiter
- Overview surfaces due items

Preserve this.

Future UX should make follow-up actions obvious:

    Follow-up due

    ABC Technologies
    Applied 7 days ago

    [Send Follow-up]
    [Snooze]
    [Mark Done]

Do not implement email sending unless explicitly requested.

For now, focus on surfacing and organizing follow-ups.

---

# 19. RECRUITERS / CONTACTS

Recruiters should remain available but should not dominate the primary product experience.

Recruiter data should connect naturally to applications.

A job may eventually have:

    Company
    Job
    Recruiter
    Application
    Resume Version
    Follow-up

Do not unnecessarily duplicate recruiter records.

The user should be able to associate a recruiter with an application.

---

# 20. DESIGN DIRECTION

Transform the existing design system into:

# MODERN DIGITAL BRUTALISM

The goal is NOT aggressive 1990s web brutalism.

The goal is:

    Modern SaaS usability
    +
    Editorial typography
    +
    Strong grid
    +
    High contrast
    +
    Brutalist geometry

The visual identity should feel:

- Confident
- Technical
- Sharp
- Distinctive
- Professional
- Slightly unconventional

Avoid looking like another generic AI SaaS dashboard.

---

# 21. DESIGN SYSTEM PRINCIPLES

Keep:

- Dark-first theme
- Geist typography
- Geist Mono for data
- Semantic CSS variables
- Existing status color system
- Indigo brand identity

Evolve:

    Generic rounded cards
        →
    Structured panels

    Soft shadows
        →
    Hard offset shadows

    Excessive border radius
        →
    2px–6px radius

    Floating dashboard cards
        →
    Strong grid-based layout

    Seven equal stat tiles
        →
    Clear information hierarchy

    Generic AI sparkle icons
        →
    Functional AI indicators

---

# 22. TYPOGRAPHY

Use typography as a major part of the brand.

Use:

- Large editorial headings
- Bold section titles
- Compact labels
- Monospace for:
  - status
  - metrics
  - application IDs
  - technical data
  - pipeline states

Avoid excessive text.

Use typography to create hierarchy.

---

# 23. COLOR

Maintain the existing cool dark foundation.

Use:

- Deep dark background
- Slightly lighter surfaces
- Strong borders
- Indigo as primary brand accent
- Status colors for application pipeline
- Limited highlight colors

Do not turn the entire interface into a rainbow.

Color must communicate meaning.

Status colors should remain consistent throughout the product.

---

# 24. BRUTALIST COMPONENT LANGUAGE

Use:

- 1px or 2px borders
- Sharp geometry
- Strong dividers
- Hard offset shadows where appropriate
- High-contrast buttons
- Bold typography
- Structured grids
- Editorial layouts

Avoid:

- Excessive glassmorphism
- Excessive gradients
- Excessive blur
- Floating blobs
- Generic AI sparkle decorations
- Excessively rounded cards
- Excessive shadows
- Template-like dashboard layouts

The product should have a recognizable visual identity.

---

# 25. RESPONSIVE DESIGN

The application must work on:

- Desktop
- Laptop
- Tablet
- Mobile

Desktop is the primary experience because job applications and resume editing are productivity-heavy tasks.

However:

- Navigation must collapse appropriately.
- Tables must become cards or scrollable structures.
- AI Workspace must remain usable.
- Resume editing must remain functional.
- No horizontal overflow unless intentional.

---

# 26. ACCESSIBILITY

Improve accessibility while redesigning.

Ensure:

- Keyboard navigation
- Visible focus states
- Proper labels
- Semantic HTML
- Sufficient color contrast
- Escape-to-close dialogs
- Focus trap for modal dialogs
- Scroll lock when dialogs are open
- Screen-reader-friendly buttons
- Accessible status indicators

Do not rely on color alone to communicate status.

---

# 27. GLOBAL SEARCH

Eventually support a unified search across:

- Jobs
- Recruiters
- Resumes
- Companies

The search should feel like a command palette or global search.

Do not implement a complex search backend prematurely.

For current dataset sizes, client-side search is acceptable.

Design the architecture so server-side search can be introduced later.

---

# 28. ANALYTICS

Analytics should be introduced after the core application workflow is stable.

Potential metrics:

- Applications sent
- Interviews
- Offers
- Rejection rate
- Interview rate
- Response rate
- Applications by source
- Applications by role
- Applications by company
- Time from application to response
- Resume versions used
- Average ATS match score

Do not build meaningless charts.

Every metric should help the user make a better job-search decision.

---

# 29. AI PROVIDER ARCHITECTURE

Preserve the existing AI provider abstraction.

The current working path is Gemini through the native Google SDK.

Do not break it.

The provider architecture should remain extensible.

Conceptually:

    getModel(provider, model)
        ↓
    Gemini → Native Google SDK
    Claude → Provider Gateway / Native SDK
    OpenAI → Provider Gateway / Native SDK

If AgentRouter is unavailable or unauthorized, Gemini should continue working.

Do not make the entire application dependent on one AI provider.

---

# 30. AI ERROR HANDLING

AI operations must handle:

- Invalid API key
- Provider unavailable
- Rate limits
- Timeouts
- Invalid model
- Malformed AI output
- Empty responses

The UI should show useful errors.

Do not expose raw provider stack traces to normal users.

Example:

    "AI analysis is temporarily unavailable.
     Please try again in a moment."

For development, log the detailed provider error.

---

# 31. PERFORMANCE

Do not over-engineer.

Prioritize:

- Fast initial dashboard
- Minimal unnecessary API calls
- React Query caching
- Optimistic delete where already implemented
- Loading states
- Skeletons where useful
- Avoid blocking the entire UI during AI operations

AI operations may take time.

Show progress states:

    Reading job description...
    Extracting requirements...
    Comparing with your resume...
    Preparing recommendations...

Do not fake progress percentages.

---

# 32. TESTING

Existing tests must continue passing.

Before completing a task:

    npm run typecheck
    npm run test

If available, run the project's build command.

Do not leave TypeScript errors.

Do not leave failing tests.

Add tests for new business logic.

Prioritize testing:

- ATS scoring
- Skill matching
- Resume tailoring
- Ownership
- AI response validation
- Application state transitions

---

# 33. DATABASE SAFETY

Before changing Prisma schema:

1. Inspect existing schema.
2. Understand relationships.
3. Check whether existing data will migrate safely.
4. Avoid destructive migrations.
5. Do not delete existing data.

If a new model is needed, explain why.

Do not create models simply to support a UI mockup.

The data model should reflect real product requirements.

---

# 34. IMPLEMENTATION ORDER

Do NOT attempt to redesign everything in one massive change.

Work in vertical slices.

Recommended order:

## Phase 1 — Product architecture

1. Review existing application.
2. Define new navigation.
3. Define information architecture.
4. Define dashboard hierarchy.
5. Define AI Workspace.
6. Map existing routes to new experience.

Do not code heavily until the architecture is clear.

---

## Phase 2 — Visual system

1. Refine typography.
2. Refine spacing.
3. Refine borders.
4. Refine card/panel geometry.
5. Implement brutalist component language.
6. Refine buttons.
7. Refine inputs.
8. Refine dialogs.
9. Refine tables/lists.
10. Refine pipeline visualization.

Do not introduce a new component library unless necessary.

Reuse existing components where appropriate.

---

## Phase 3 — Dashboard

Transform the existing dashboard into the Job Search Command Center.

Preserve existing data and API functionality.

---

## Phase 4 — AI Workspace

Create the unified workflow:

    Job
    ↓
    Analyze
    ↓
    Match
    ↓
    Skill Gaps
    ↓
    Tailor Resume
    ↓
    Review
    ↓
    Export
    ↓
    Apply

---

## Phase 5 — ATS Match + Skill Gaps

Implement real scoring and explanations.

---

## Phase 6 — Resume Review + Export

Implement:

- Diff/review
- PDF export
- DOCX export if appropriate
- Clean ATS-friendly templates

---

## Phase 7 — Application Lifecycle

Connect:

- AI Workspace
- Resume
- Job
- Application status
- Recruiter
- Follow-up

---

## Phase 8 — Analytics

Only after the core workflow is stable.

---

# 35. IMPORTANT: DO NOT OVERBUILD

Avoid premature features such as:

- Job scraping
- LinkedIn automation
- Automatic application submission
- Email sending
- Browser automation
- Complex notification systems
- Multi-user teams
- Billing
- Enterprise permissions

These are future possibilities.

The immediate goal is to make the core single-user experience excellent.

---

# 36. PRIMARY UX TEST

At every stage, ask:

> "Can a user who just found a job complete the entire application preparation workflow without feeling like they are navigating a database admin panel?"

The ideal experience is:

    I found a job.
        ↓
    I add it.
        ↓
    The app understands it.
        ↓
    I understand my fit.
        ↓
    I see my gaps.
        ↓
    I tailor my resume.
        ↓
    I review the changes.
        ↓
    I export it.
        ↓
    I apply.
        ↓
    I track it.
        ↓
    The app reminds me what to do next.

If the answer is yes, the product is moving in the right direction.

---

# 37. CURRENT STATE AWARENESS

Before starting implementation, compare the current repository against `STATE.md`.

Create a short internal checklist:

    EXISTING
    ├── Working
    ├── Partially working
    └── Broken

    PRODUCT UX
    ├── Keep
    ├── Refactor
    └── Replace

Do not assume the STATE.md is perfectly current.

Verify important claims against the actual code.

If the state document and code disagree:

    Code reality > STATE.md

Update `STATE.md` after meaningful implementation changes.

---

# 38. STATE.md MAINTENANCE

`STATE.md` is a living engineering document.

After each significant feature:

Update:

- What was built
- What changed
- APIs added
- Routes added
- Database changes
- AI changes
- Tests
- Known limitations
- Next recommended step

Do not rewrite the entire file unnecessarily.

Keep it concise and accurate.

---

# 39. DEFINITION OF DONE

A feature is not complete merely because:

- The UI exists.
- The button exists.
- The API returns 200.
- The AI generates something.

A feature is complete when:

1. The user journey makes sense.
2. The UI communicates the purpose clearly.
3. Loading states exist.
4. Error states exist.
5. Empty states exist.
6. Data ownership is enforced.
7. Validation exists.
8. AI output is validated.
9. Existing functionality still works.
10. TypeScript passes.
11. Tests pass.
12. The feature is reflected in `STATE.md`.

---

# 40. YOUR ROLE

Act as:

- Senior Full-Stack Engineer
- Product Designer
- UX Architect
- AI Product Engineer
- Technical Product Manager

Do not blindly follow instructions if they conflict with the product vision.

If a requested feature creates unnecessary complexity, explain why.

If an existing feature can be reused, reuse it.

If a UI decision makes the product feel like a generic CRUD dashboard, challenge it.

Prioritize:

    Product clarity
    User workflow
    Maintainability
    Correctness
    Accessibility
    Performance
    Visual identity

In that order where appropriate.

---

# 41. WORKING STYLE

Before implementing a major change:

1. Explain what you found in the existing code.
2. Explain what will change.
3. Explain what will remain unchanged.
4. Identify affected files.
5. Identify any schema/API changes.
6. Identify risks.
7. Then implement.

For small, obvious changes, do not waste time explaining every trivial step.

Work incrementally.

After each meaningful slice:

1. Run typecheck.
2. Run tests.
3. Fix regressions.
4. Update `STATE.md`.

---

# 42. FIRST TASK

Do NOT immediately start rewriting the dashboard.

First:

1. Read `STATE.md`.
2. Read `Project_Requirment.md`.
3. Inspect the current codebase.
4. Inspect the current dashboard.
5. Inspect navigation.
6. Inspect the Jobs page.
7. Inspect the Resumes page.
8. Inspect the AI Analyzer.
9. Inspect the Resume Tailoring workflow.
10. Inspect the current Prisma schema.
11. Identify what can be reused.

Then produce a concise:

# PRODUCTIZATION AUDIT

Include:

## A. What is already working

## B. What is incomplete

## C. What is currently too CRUD-oriented

## D. What should be redesigned

## E. What should NOT be changed

## F. Recommended new information architecture

## G. Recommended implementation order

Do not implement the redesign yet.

Wait for confirmation before making major architectural or UI changes.

---

# FINAL PRODUCT PRINCIPLE

The product should not feel like:

    "A database for storing job applications."

It should feel like:

    "An intelligent workspace that helps me win my next job."

Every major product decision should move the experience toward that goal.