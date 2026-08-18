import { describe, expect, it } from "vitest";
import { createResumeSchema, updateResumeSchema } from "./schema";

describe("createResumeSchema", () => {
  it("accepts a name + content", () => {
    expect(createResumeSchema.safeParse({ name: "My CV", content: "# Hi" }).success).toBe(true);
  });

  it("rejects an empty name", () => {
    expect(createResumeSchema.safeParse({ name: "", content: "# Hi" }).success).toBe(false);
  });

  it("rejects empty content", () => {
    expect(createResumeSchema.safeParse({ name: "My CV", content: "   " }).success).toBe(false);
  });
});

describe("updateResumeSchema", () => {
  it("allows a partial update (content only)", () => {
    expect(updateResumeSchema.safeParse({ content: "# Updated" }).success).toBe(true);
  });
});
