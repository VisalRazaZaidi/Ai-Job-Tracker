import { describe, expect, it } from "vitest";
import { analyzeJobInputSchema, jobAnalysisSchema, tailorResumeInputSchema } from "./schema";

describe("analyzeJobInputSchema", () => {
  const cuid = "clh1234567890abcdefghijkl";

  it("rejects a too-short description", () => {
    expect(analyzeJobInputSchema.safeParse({ description: "short" }).success).toBe(false);
  });

  it("accepts a long-enough description without a model", () => {
    const parsed = analyzeJobInputSchema.safeParse({ description: "x".repeat(60) });
    expect(parsed.success).toBe(true);
  });

  it("keeps an optional model when provided", () => {
    const parsed = analyzeJobInputSchema.parse({ description: "x".repeat(60), model: "gpt-4o" });
    expect(parsed.model).toBe("gpt-4o");
  });

  it("accepts a jobId instead of a description (Workspace flow)", () => {
    expect(analyzeJobInputSchema.safeParse({ jobId: cuid }).success).toBe(true);
  });

  it("rejects a non-cuid jobId", () => {
    expect(analyzeJobInputSchema.safeParse({ jobId: "nope" }).success).toBe(false);
  });

  it("rejects providing both a description and a jobId", () => {
    expect(
      analyzeJobInputSchema.safeParse({ description: "x".repeat(60), jobId: cuid }).success
    ).toBe(false);
  });

  it("rejects providing neither a description nor a jobId", () => {
    expect(analyzeJobInputSchema.safeParse({}).success).toBe(false);
  });
});

describe("jobAnalysisSchema", () => {
  const valid = {
    title: "Senior Engineer at Acme",
    companySummary: "A fintech building payment rails.",
    seniority: "Senior",
    interviewDifficulty: "Hard",
    techStack: ["TypeScript", "Postgres"],
    requiredSkills: ["React"],
    optionalSkills: [],
    responsibilities: ["Ship features"],
    keywords: ["react", "typescript"],
  };

  it("accepts a well-formed analysis", () => {
    expect(jobAnalysisSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an out-of-range difficulty", () => {
    expect(jobAnalysisSchema.safeParse({ ...valid, interviewDifficulty: "Brutal" }).success).toBe(false);
  });
});

describe("tailorResumeInputSchema", () => {
  const cuid = "clh1234567890abcdefghijkl";

  it("accepts valid resume + job cuids", () => {
    expect(tailorResumeInputSchema.safeParse({ resumeId: cuid, jobId: cuid }).success).toBe(true);
  });

  it("rejects a non-cuid id", () => {
    expect(tailorResumeInputSchema.safeParse({ resumeId: "nope", jobId: cuid }).success).toBe(false);
  });
});
