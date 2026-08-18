# AI Job Tracker
Version: 1.0
Author: Visal Raza Zaidi

---

# Overview

AI Job Tracker is a personal productivity application that helps job seekers organize applications, tailor resumes using AI, and never lose track of where they've applied.

The goal is NOT to automate job applications.

The goal is to become the user's personal Job CRM.

Think of it as:

Notion
+
Teal
+
Jobscan
+
Linear

Designed specifically for software engineers.

---

# Problem Statement

Current job hunting is painful because:

- Users apply to hundreds of jobs and forget them.
- Recruiters contact them weeks later and they cannot remember the application.
- Every application requires a customized resume.
- Existing job trackers only store information.
- Existing resume builders only edit resumes.
- Users constantly switch between LinkedIn, ChatGPT, Google Docs and spreadsheets.

This application combines everything into one workflow.

---

# Primary Goals

1. Track every application.

2. Generate AI-tailored resumes.

3. Keep a single Master Resume.

4. Generate unlimited Resume Versions.

5. Track recruiter conversations.

6. Provide reminders for follow-ups.

7. Save job descriptions forever.

8. Help increase interview rate.

---

# Target Users

- Junior Developers
- Associate Developers
- Full Stack Developers
- Software Engineers
- Career Switchers
- Students

---

# Core Features

## Dashboard

Show

- Total Applications
- Interviews
- Offers
- Rejections
- Wishlist Jobs
- Follow-ups Due Today
- Applications This Week
- Recent Activity

---

## Job Management

User can

Create Job

Fields

- Company
- Position
- Source

Examples

LinkedIn
Indeed
Referral
WhatsApp
Discord
Career Page
Twitter

- Job Link
- Job Description
- Salary
- Location
- Remote/Hybrid/Onsite
- Date Applied
- Notes

Status

Wishlist

Applied

Interview

Assessment

Technical Interview

HR Interview

Offer

Rejected

Accepted

Withdrawn

Archived

---

## Resume Management

Master Resume

Only one editable source.

Every AI-generated resume is created from this.

Never overwrite Master Resume.

Resume Versions

Each version stores

- Resume Name
- Created Date
- Target Company
- Target Position
- ATS Score
- Matching Percentage

---

## AI Resume Analysis

Input

- Master Resume
- Job Description

AI should

Extract

- Required Skills
- Nice-to-have Skills
- Responsibilities
- Keywords
- Technologies
- Seniority

Compare against Master Resume.

Return

Missing Skills

Matching Skills

Suggestions

ATS Optimization

Bullet Improvements

Summary Improvements

Projects to Highlight

Skills to Prioritize

Never invent experience.

Only reorganize existing information.

---

## Resume Generator

Generate

PDF

DOCX

Markdown

Version History

Every generated resume should be saved.

---

## Recruiter Timeline

Store

Recruiter Name

Company

LinkedIn URL

Email

Phone

Conversation Notes

Last Contact

Next Follow-up

Communication History

---

## Follow-up System

User can schedule reminders.

Examples

Follow up after 5 days

Interview reminder

Assessment reminder

Offer expiration reminder

---

## Search

Search everything.

Jobs

Companies

Skills

Recruiters

Resume Versions

Notes

---

## Analytics

Charts

Applications per month

Interview rate

Offer rate

Rejection rate

Most common missing skills

Top technologies requested

Average ATS Match

Most applied companies

---

# AI Features

## AI Job Analyzer

Input

Job Description

Output

Company Summary

Tech Stack

Responsibilities

Required Skills

Optional Skills

Interview Difficulty

Estimated ATS Match

---

## AI Resume Optimizer

Given

Master Resume

Job Description

Generate

Optimized Resume

Highlight missing keywords

Improve wording

Improve bullet points

Keep facts truthful.

---

## AI Cover Letter

Generate personalized cover letter.

---

## Future Features

Chrome Extension

Paste LinkedIn URL

Automatically import

Job

Company

Description

Salary

Location

---

Auto Apply

(Not part of MVP)

---

Email Sync

Detect recruiter emails.

Automatically attach them to applications.

---

Calendar Sync

Interview reminders

Google Calendar

Outlook

---

GitHub Sync

Import repositories.

---

LinkedIn Sync

Import profile.

---

# Functional Requirements

- Authentication
- CRUD Jobs
- CRUD Resume Versions
- CRUD Recruiters
- CRUD Notes
- AI Resume Generation
- AI Job Analysis
- Search
- Filters
- Dashboard
- Analytics

---

# Non Functional Requirements

Fast

Responsive

Mobile Friendly

Accessible

Dark Mode

Secure

Scalable

Offline Draft Support

---

# Suggested Tech Stack

Frontend

Next.js
TypeScript
TailwindCSS
shadcn/ui
React Query
React Hook Form
Zod

Backend

Node.js
NestJS (preferred)

or

Express

Database

PostgreSQL

ORM

Prisma

Authentication

Better Auth / Clerk

Storage

Cloudinary
or
Supabase Storage

AI

OpenAI GPT-5.5
Claude Sonnet
Gemini

PDF

React PDF

Charts

Recharts

Deployment

Vercel

Railway

Supabase

---

# Design Philosophy

Simple.

Fast.

Minimal.

Everything accessible within 2 clicks.

No clutter.

Looks like Linear + Notion.

---

# Success Metrics

Reduce application time from

20 minutes

to

5 minutes.

Increase interview rate.

Never forget an application again.

Generate tailored resume in under 60 seconds.
