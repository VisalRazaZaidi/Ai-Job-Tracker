import { z } from "zod";
import { optionalString, optionalDate, optionalEnum } from "@/features/shared/zod";

export const JOB_STATUSES = [
  "WISHLIST",
  "APPLIED",
  "INTERVIEW",
  "ASSESSMENT",
  "TECHNICAL",
  "HR",
  "OFFER",
  "REJECTED",
  "ACCEPTED",
  "WITHDRAWN",
  "ARCHIVED",
] as const;

export const WORK_MODES = ["REMOTE", "HYBRID", "ONSITE"] as const;

export const createJobSchema = z.object({
  company: z.string().trim().min(1, "Company is required"),
  position: z.string().trim().min(1, "Position is required"),
  status: z.enum(JOB_STATUSES).default("WISHLIST"),
  source: optionalString,
  jobLink: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")),
  description: optionalString,
  salary: optionalString,
  location: optionalString,
  workMode: optionalEnum(WORK_MODES),
  dateApplied: optionalDate,
  nextFollowUp: optionalDate,
  notes: optionalString,
});

export const updateJobSchema = createJobSchema.partial();

// Phase 7 — body for POST /api/jobs/[id]/apply. The resume is required (§12):
// we never record an application without knowing what was submitted.
export const applyJobSchema = z.object({
  resumeId: z.string().trim().min(1, "Select a resume before marking as applied"),
  note: optionalString,
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type ApplyJobInput = z.infer<typeof applyJobSchema>;
