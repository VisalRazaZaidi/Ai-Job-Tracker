import { z } from "zod";

export const jobAnalysisSchema = z.object({
  title: z.string().describe('Short label for this analysis, e.g. "Full Stack Engineer at Design District"'),
  companySummary: z.string().describe("1–3 sentence summary of the company and role context"),
  seniority: z.enum(["Intern", "Junior", "Mid", "Senior", "Staff", "Principal", "Lead", "Manager"]),
  interviewDifficulty: z.enum(["Easy", "Medium", "Hard"]),
  techStack: z.array(z.string()).describe("Technologies, frameworks, tools mentioned"),
  requiredSkills: z.array(z.string()).describe("Must-have skills explicitly stated"),
  optionalSkills: z.array(z.string()).describe("Nice-to-have or preferred skills"),
  responsibilities: z.array(z.string()).describe("Key responsibilities, max 6"),
  keywords: z.array(z.string()).describe("ATS keywords worth including in a resume"),
});

export type JobAnalysis = z.infer<typeof jobAnalysisSchema>;

// Input to the analyzer. Two mutually-exclusive entry modes:
//   { description }  — the legacy "paste a JD" flow (Analyze page)
//   { jobId }        — the AI Workspace flow; the server reads the saved Job's
//                      description (never trust the client for the JD — historical
//                      integrity + security, see analyze-job/route.ts)
export const analyzeJobInputSchema = z
  .object({
    // Cap length so one paste can't run up an unbounded token bill. ~15k chars
    // comfortably covers any real JD (roughly 4–5k tokens).
    description: z
      .string()
      .trim()
      .min(50, "Paste at least 50 characters of the job description")
      .max(15000, "That's too long — paste just the job description (max 15,000 characters)")
      .optional(),
    jobId: z.string().cuid().optional(),
    model: z.string().optional(),
  })
  .refine((d) => (d.description === undefined) !== (d.jobId === undefined), {
    message: "Provide either a job description or a jobId",
  });

// Tailor an existing resume to a specific saved job. Both are looked up by id
// server-side (ownership-checked); the AI only reorders/rewords what's already
// in the resume against the job — it never invents experience.
export const tailorResumeInputSchema = z.object({
  resumeId: z.string().cuid(),
  jobId: z.string().cuid(),
  model: z.string().optional(),
});
