<div align="center">

# 🎯 AI Job Tracker

### Your personal Job CRM — track every application as a pipeline, not a spreadsheet.

An AI-powered workspace that keeps your entire job search in one place: applications, recruiters, resumes, and role-by-role AI analysis — so nothing slips through the cracks.

<br/>

![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_6-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk_Auth-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)

![License](https://img.shields.io/badge/License-Personal_Use-2D2A7B?style=flat-square)
![Tests](https://img.shields.io/badge/tests-passing-22c55e?style=flat-square&logo=vitest&logoColor=white)
![Status](https://img.shields.io/badge/status-active_development-EAF4FF?style=flat-square&labelColor=2D2A7B)

<br/>

<!-- 📸 Drop a product screenshot or demo GIF at docs/preview.png and it will render here:
     ![AI Job Tracker preview](docs/preview.png) -->
<em>🎨 Ghost White + Persian Indigo · light &amp; dark · WCAG AA</em>

</div>

---

## 🧭 Overview

Job searching is chaotic: applications get lost, recruiter follow-ups slip, and tailoring a resume for every role eats hours. **AI Job Tracker** replaces the pile of spreadsheets, sticky notes, and random resume copies with a single dashboard where you:

- 📊 Track every application through its pipeline
- 🤖 Analyze job descriptions with AI (skills, stack, ATS keywords)
- 📄 Keep a master resume and generate tailored versions on demand
- 🎯 Score your resume against a role and see the skill gaps
- 👥 Manage recruiter conversations and follow-ups
- 📈 See your search at a glance with insights and global search

---

## ✨ Features

| | Feature | What it does |
|:--:|---|---|
| 📊 | **Pipeline tracking** | Create, edit, filter, and move applications through each stage — with color-coded status. |
| 🤖 | **AI job analysis** | Extract seniority, tech stack, required/optional skills, responsibilities, and ATS keywords from any job description. |
| 📄 | **Resume management** | Upload PDF/DOCX, auto-extract to editable markdown, and keep a versioned master resume. |
| 🎯 | **Match scoring** | Deterministic 0–100 score comparing a resume to a role, with strong / partial / missing skills. |
| ✍️ | **Resume tailoring** | AI reorders and rewords your existing resume for a role — never invents experience — saved as a new version. |
| 📤 | **PDF export** | Export any resume version to a clean PDF. |
| 🔖 | **Application snapshots** | "Mark as Applied" freezes an immutable snapshot of what you submitted. |
| 👥 | **Recruiter CRM** | Track contacts, companies, and follow-up reminders. |
| 📈 | **Insights dashboard** | Analytics across your pipeline and activity. |
| 🔍 | **Global search** | Jump to any job, resume, or recruiter from one overlay. |
| 🔐 | **Scoped security** | Every record is scoped to the signed-in user via Clerk. |

<details>
<summary><strong>See detailed capabilities</strong></summary>

**Job tracking & workflow**
- Create, edit, and delete job applications
- Track status across your pipeline
- Store description, notes, URL, salary, location, and source
- Filter by status and search by company, position, or keyword
- View application history and recent activity

**AI analysis workspace**
- Analyze a saved description to extract seniority, company summary, tech stack, required & optional skills, responsibilities, and ATS keywords
- Save per-job analysis history and re-run without losing prior records

**Resume-to-job match scoring**
- Compare a selected resume against a job analysis
- Deterministic score from 0–100 with strong, partial, and missing skills
- Guides resume improvements before you apply

**Recruiter tracking**
- Save company, email, phone, LinkedIn, notes, and follow-ups
- Reminders for outreach and communication

</details>

---

## 🎨 Design system

Built on a two-color brand kit and a token-driven theme, so light and dark are the *same palette inverted*.

![Ghost White](https://img.shields.io/badge/Ghost%20White-%23EAF4FF-EAF4FF?style=flat-square&labelColor=2D2A7B)
![Persian Indigo](https://img.shields.io/badge/Persian%20Indigo-%232D2A7B-2D2A7B?style=flat-square&labelColor=EAF4FF&logoColor=2D2A7B)

- **Light (default):** Ghost White field, Persian Indigo text & accents
- **Dark:** the brand inverted — Persian Indigo field, Ghost White contrast
- Every text pair verified **WCAG AA** (primary contrast 10.9:1)
- *Modern Digital Brutalism* — hard offset shadows, Geist / Geist Mono type

---

## 🧱 Tech stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) · React 19 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 3 · CSS-variable theming (light/dark) |
| **Auth** | Clerk |
| **Database** | PostgreSQL · Prisma 6 |
| **AI** | Vercel AI SDK · Google Gemini |
| **Data fetching** | TanStack Query |
| **Forms & validation** | React Hook Form · Zod |
| **Files** | jsPDF (export) · Mammoth + pdf-parse (import) |
| **Icons** | lucide-react |
| **Testing** | Vitest |

---

## 🚀 Quick start

### Prerequisites

- **Node.js** 20 LTS or newer
- A running **PostgreSQL** database
- A **Clerk** account (publishable + secret keys)
- A **Google Gemini** API key

### 1 · Clone & install

```bash
git clone <your-repo-url>
cd ai-job-tracker
npm install
```

### 2 · Configure environment

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
CLERK_SECRET_KEY="your-clerk-secret-key"

# AI (Google Gemini — default provider)
GOOGLE_GENERATIVE_AI_API_KEY="your-google-ai-key"
```

### 3 · Set up the database

```bash
npx prisma generate
npx prisma db push
```

### 4 · Run

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** 🎉

---

## 🔑 Environment variables

| Variable | Required | Description |
|---|:--:|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | Clerk publishable key |
| `CLERK_SECRET_KEY` | ✅ | Clerk secret key |
| `GOOGLE_GENERATIVE_AI_API_KEY` | ✅ | Google Gemini key — the default AI provider |
| `AI_MODEL` | ⬜ | Override the default model (`gemini-3.5-flash-lite`) |
| `AI_BASE_URL` · `AI_API_KEY` | ⬜ | Advanced: route non-Gemini models through an OpenAI-compatible gateway |

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server on `:3000` |
| `npm run build` | Generate the Prisma client, then build for production |
| `npm run start` | Run the production server |
| `npm run lint` | ESLint checks |
| `npm run test` | Run the Vitest suite once |
| `npm run test:watch` | Watch tests while developing |

---

## 🗂️ Project structure

```text
ai-job-tracker/
├── prisma/
│   └── schema.prisma          # data model
├── src/
│   ├── app/
│   │   ├── api/               # route handlers
│   │   ├── dashboard/         # authenticated app (jobs, resumes, insights…)
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── features/              # feature modules (jobs, resumes, ai, ui…)
│   ├── lib/                   # ai config, db, shared helpers
│   └── middleware.ts          # Clerk route protection
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

---

## 🧭 Usage workflow

1. 🔐 Sign in with Clerk
2. ➕ Add one or more job applications
3. 📝 Save the original job description
4. 🤖 Run AI analysis on the role
5. 📄 Upload or create a resume
6. 🎯 Compare your resume to the job with **Match Score**
7. ✍️ Tailor the resume for the role
8. 📤 Export to PDF and mark it **Applied**
9. 👥 Track recruiter follow-ups and progress

---

## 🧪 Testing

Core logic — match scoring and schema validation — is covered by **Vitest** pure-function tests (no database harness required):

```bash
npm run test
```

---

## 🗺️ Roadmap

- [ ] Richer, ATS-style match analysis
- [ ] Deeper insights & trend analytics
- [ ] Shareable application snapshots
- [ ] Multi-resume comparison against a single role
- [ ] Bulk import of applications

> ✅ Recently shipped: Insights dashboard · Global search · PDF export · immutable application snapshots · Ghost White + Persian Indigo rebrand.

---

## 🔒 Security & privacy

- Authentication and session management via **Clerk**
- Every job, resume, analysis, and recruiter record is **scoped to the signed-in user**
- No cross-user access to personal records

AI usage is deliberately focused on **analysis and resume tailoring** — it never automates applications or fabricates credentials. This is a personal productivity tool for running a *better* job search, not a bot that runs it for you.

---

<details>
<summary>🛠️ <strong>Development notes</strong></summary>

**Prisma:** If `npx prisma generate` fails due to a local environment or filesystem issue, run it manually and check the exact error before continuing — the database layer and AI-analysis persistence depend on it.

**STATE.md:** This repo expects a personal `STATE.md` (git-ignored) that tracks phases, architecture decisions, and deployment notes per developer. Create your own after cloning to keep a living reference for you and your AI assistant — the repo stays clean and everyone uses their own format.

</details>

---

## 📄 License

Currently for **personal and project use**. Confirm licensing before publishing or distributing externally.

<div align="center">
<br/>
<sub>Built with Next.js · Prisma · Google Gemini — themed in Ghost White + Persian Indigo.</sub>
</div>
