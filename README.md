# AI Job Tracker

A modern AI-powered job application workspace built for software engineers and job seekers who want to stay organized, compare their resume against job requirements, and keep everything in one place.

This project combines job tracking, recruiter management, resume versioning, and AI analysis into a single dashboard built with Next.js, Prisma, Clerk, and the Google AI SDK.

## Overview

Job searching is chaotic: applications get lost, recruiter follow-ups slip through the cracks, and tailoring a resume for every job is time-consuming.

AI Job Tracker is designed to be a personal Job CRM for career growth. Instead of juggling spreadsheets, notes, LinkedIn tabs, and random resume copies, you keep everything in one system:

- track every application
- save job descriptions and analysis
- manage recruiter conversations
- maintain a master resume
- generate tailored versions
- compare your resume against a role using a match score and skill gap view
- keep your history organized without losing context

---

## Key Features

### 1. Job tracking and workflow management
- Create, edit, and delete job applications
- Track status across your pipeline
- Store job descriptions, notes, URL, salary, location, and source
- Filter by status and search by company, position, or keywords
- View application history and recent activity

### 2. AI job analysis workspace
- Analyze a saved job description to extract:
  - seniority
  - company summary
  - tech stack
  - required skills
  - optional skills
  - responsibilities
  - ATS keywords
- Save job-specific analysis history
- Re-run analysis without losing prior records
- Review the latest result directly in the workspace

### 3. Resume management
- Keep a master resume as the source of truth
- Upload PDF or DOCX resumes
- Extract text automatically into editable markdown
- Maintain a clean, versioned resume workflow
- Tailor resumes for specific jobs without overwriting the master copy

### 4. Resume-to-job match scoring
- Compare a selected resume against a job analysis
- Get a deterministic match score from 0 to 100
- View strong matches, partial matches, and missing skills
- Understand which skills are missing or underrepresented
- Help guide resume improvements before applying

### 5. Recruiter tracking
- Track recruiters and contacts
- Save company, email, phone, LinkedIn, notes, follow-ups
- Keep reminders for outreach and communication follow-ups

### 6. Dashboard and productivity overview
- Dashboard with quick job pipeline visibility
- Follow-up reminders
- Recent activity feed
- Goal-oriented command-center layout for staying on top of application workflow

### 7. Secure and scoped data access
- Authentication via Clerk
- Every job, resume, and analysis is scoped to the signed-in user
- Prevents cross-user access to personal records

---

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Clerk Auth
- Google AI SDK
- Vitest

---

## Project Structure

```text
ai-job-tracker/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── dashboard/
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── features/
│   ├── lib/
│   └── middleware.ts
├── .gitignore
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── README.md
└── SMOKE_TEST.md
```

---

## Getting Started

### Prerequisites

Before running the project, make sure you have:

- Node.js 18+ or 20+
- PostgreSQL database running
- A Clerk account and project keys
- A Google AI API key

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd ai-job-tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory and add the following values:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
CLERK_SECRET_KEY="your-clerk-secret-key"
GOOGLE_GENERATIVE_AI_API_KEY="your-google-ai-key"
```

If you use other AI providers, the app may also support additional model keys depending on configuration.

### 4. Generate Prisma client

```bash
npx prisma generate
```

If Prisma needs a fresh schema sync in your local database:

```bash
npx prisma db push
```

### 5. Run the app

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

## Available Scripts

```bash
npm run dev         # start Next.js in development mode
npm run build       # build the production app
npm run start       # run the production server
npm run lint        # run lint checks
npm run test        # run Vitest tests
npm run test:watch  # watch tests while developing
```

---

## Development Notes

### Prisma note
If `npx prisma generate` fails on your machine due to environment or filesystem issues, run it manually in your terminal and send the exact error output before continuing. This project relies on Prisma for the database layer and AI-analysis persistence.

### Project Context (STATE.md)
This repository includes a `STATE.md` file that tracks the project's phases, architecture, progress, and deployment notes. This file is intentionally excluded from version control (`.gitignore`) because it is maintained by individual developers as a personal reference.

**When you first clone this project, create your own `STATE.md` file** to track:
- Current phase and implementation status
- Architecture decisions and notes for your AI agent
- Deployment checklist and environment setup
- Any debugging notes or blockers

Your `STATE.md` serves as a living document for you and your AI assistant during development. Each contributor creates and maintains their own copy — this keeps the repo clean and lets everyone use their own tracking format.

### Authentication
The app uses Clerk and protects the main dashboard and API routes behind signed-in user sessions.

### AI behavior
The app intentionally keeps AI usage focused on analysis and resume tailoring rather than automating the entire job search process.

---

## Usage Workflow

A typical workflow looks like this:

1. Sign in with Clerk
2. Add one or more job applications
3. Save the original job description
4. Run AI analysis on the job
5. Upload or create a resume
6. Compare your resume to the job using Match Score
7. Tailor the resume for the role
8. Track recruiter follow-ups and application progress

---

## Current Status

This project is currently in active productization and includes:

- dashboard overview
- job tracking and workflow stages
- recruiter management
- resume upload and editing
- AI-based job analysis
- AI match scoring and skill-gap analysis
- test coverage for matching logic and schema validation

---

## Roadmap

Planned future improvements include:

- resume review and export workflows
- more advanced ATS-style match analysis
- richer application lifecycle tracking
- export/shareable application snapshots
- deeper insights and analytics

---

## Important

This project is a personal productivity tool for job tracking and resume optimization. It is intended to help users manage their job search process more effectively, not automate applications or fake credentials.

---

## License

This project is currently for personal and project use. If you intend to publish or distribute it publicly, confirm the licensing before sharing externally.
