import { describe, expect, it } from "vitest";
import { buildResumeReview } from "./review";

describe("buildResumeReview", () => {
  it("extracts core resume structure from markdown", () => {
    const review = buildResumeReview(`# Alex Morgan

## Summary
Senior product engineer with 6 years building SaaS experiences.

## Experience
- Built customer-facing web applications with React and TypeScript.
- Improved onboarding conversion by 22%.

## Skills
- React
- TypeScript
- Node.js
`);

    expect(review.wordCount).toBeGreaterThan(30);
    expect(review.headingCount).toBeGreaterThanOrEqual(3);
    expect(review.headings).toContain("Summary");
    expect(review.headings).toContain("Experience");
    expect(review.skills).toContain("React");
    expect(review.skills).toContain("TypeScript");
    expect(review.missingSections).toEqual([]);
    expect(review.summary.toLowerCase()).toContain("experience");
  });

  it("flags absent sections for an incomplete resume", () => {
    const review = buildResumeReview(`# Alex Morgan

## Summary
Needs work.
`);

    expect(review.missingSections).toContain("Experience");
    expect(review.missingSections).toContain("Skills");
    expect(review.issues.some((issue) => issue.toLowerCase().includes("missing"))).toBe(true);
  });
});
