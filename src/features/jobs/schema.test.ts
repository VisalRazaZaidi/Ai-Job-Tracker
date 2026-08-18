import { describe, it, expect } from "vitest";
import { createJobSchema, updateJobSchema } from "./schema";

describe("createJobSchema", () => {
  it("accepts a valid minimal payload", () => {
    const r = createJobSchema.safeParse({ company: "Acme", position: "SWE" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.status).toBe("WISHLIST"); // default applied
  });

  it("rejects empty company or position", () => {
    expect(createJobSchema.safeParse({ company: "", position: "SWE" }).success).toBe(false);
    expect(createJobSchema.safeParse({ company: "Acme", position: "" }).success).toBe(false);
  });

  it("rejects an unknown status enum value", () => {
    const r = createJobSchema.safeParse({ company: "Acme", position: "SWE", status: "NOPE" });
    expect(r.success).toBe(false);
  });

  it("rejects a malformed jobLink URL", () => {
    const r = createJobSchema.safeParse({ company: "Acme", position: "SWE", jobLink: "not-a-url" });
    expect(r.success).toBe(false);
  });
});

describe("updateJobSchema", () => {
  it("accepts an empty object (all fields optional)", () => {
    expect(updateJobSchema.safeParse({}).success).toBe(true);
  });

  it("accepts a single-field partial update", () => {
    const r = updateJobSchema.safeParse({ status: "OFFER" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.status).toBe("OFFER");
  });

  it("coerces an ISO date string for dateApplied", () => {
    const r = updateJobSchema.safeParse({ dateApplied: "2026-01-15" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.dateApplied).toBeInstanceOf(Date);
  });

  it("still rejects a bad enum or URL in a partial update", () => {
    expect(updateJobSchema.safeParse({ status: "NOPE" }).success).toBe(false);
    expect(updateJobSchema.safeParse({ jobLink: "not-a-url" }).success).toBe(false);
  });
});
