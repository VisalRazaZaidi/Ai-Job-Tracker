# Plan: Complete the `auth-jobs-crud-dashboard` slice

## Context
Auth (Clerk), Jobs CRUD API (GET/POST/PATCH/DELETE with per-user ownership),
Zod validation, dashboard stat tiles, create form, list + delete, and schema
tests already exist and pass (`tsc --noEmit` clean, 4/4 vitest green).

The API already fully supports **update** and **all 11 job fields**, but the UI
only exposes create (company/position/status), list, and delete. The `PATCH`
endpoint has no UI at all. Search and filters (required functional features) are
absent. This plan closes those gaps to make the named slice production-complete
without expanding into other entities (Recruiters/AI/etc.).

## Goals (in scope)
1. **Edit jobs from the UI** — an edit dialog covering all fields the API accepts
   (company, position, status, source, jobLink, description, salary, location,
   workMode, dateApplied, notes), wired to `PATCH /api/jobs/[id]`.
2. **Inline status change** — quick status `<select>` per job row (common action,
   1-click per design philosophy) using the same update hook.
3. **Search** — client-side text filter over company/position/location/notes.
4. **Status filter** — filter chips/select to narrow the list by status.
5. **Robust states** — surface create/update/delete errors; optimistic delete
   with rollback; disable controls while pending.
6. **Tests** — extend vitest to cover `updateJobSchema` (partial, coercion,
   URL/enum rejection).

## Non-goals (defer, confirm before starting)
- Recruiters / Notes / Resume / AI features.
- Extra schema fields for "follow-ups due today", "recent activity".
- shadcn/ui install — keep the existing hand-rolled Tailwind components for
  consistency with current code (no new heavy deps).

## Files to add
- `src/features/jobs/hooks.ts` — add `useUpdateJob(id)`; add optimistic
  `onMutate`/`onError`/`onSettled` to `useDeleteJob`.
- `src/features/jobs/schema.test.ts` — add `updateJobSchema` cases.
- `src/features/jobs/JobFormDialog.tsx` — reusable create/edit modal (RHF + Zod
  resolver) covering all fields.
- `src/features/jobs/JobRow.tsx` — row with inline status select + edit/delete.
- `src/features/jobs/JobFilters.tsx` — search input + status filter, controlled
  by the page.

## Files to modify
- `src/app/page.tsx` — compose filters + dialog + rows; keep stat tiles;
  derive filtered list; add mutation error banners.

## Approach notes
- Reuse existing fetch/`json<T>` helper and query key `["jobs"]`.
- Use `@hookform/resolvers/zod` (already a dependency) for the form.
- `updateJobSchema` is `createJobSchema.partial()`; the dialog submits only
  changed/di­rty fields, or the full set (API handles both).
- Keep strict TS, no `any`, dark-mode Tailwind styling matching current tiles.
- Filtering is client-side (dataset is one user's jobs) — no API change needed.

## Verification
1. `npx tsc --noEmit` → clean.
2. `npx vitest run` → all green (existing 4 + new update-schema cases).
3. Manual: create → edit all fields → inline status change → search → filter →
   delete (optimistic) → error path (stop dev server / force 400).

## Rollout
Single incremental change set; no DB migration (schema unchanged). Safe to build
with `npm run build` afterward.
