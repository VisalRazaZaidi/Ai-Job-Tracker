import { describe, it, expect } from "vitest";
import { createRecruiterSchema, updateRecruiterSchema } from "./schema";

describe("createRecruiterSchema", () => {
  it("accepts a name-only payload", () => {
    expect(createRecruiterSchema.safeParse({ name: "Dana" }).success).toBe(true);
  });

  it("rejects an empty name", () => {
    expect(createRecruiterSchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("normalizes empty optional strings to undefined", () => {
    const r = createRecruiterSchema.safeParse({ name: "Dana", company: "", email: "", linkedinUrl: "" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.company).toBeUndefined();
      expect(r.data.email).toBe(""); // "" allowed for email/url; route maps to null
    }
  });

  it("rejects a malformed email or LinkedIn URL", () => {
    expect(createRecruiterSchema.safeParse({ name: "Dana", email: "nope" }).success).toBe(false);
    expect(createRecruiterSchema.safeParse({ name: "Dana", linkedinUrl: "nope" }).success).toBe(false);
  });
});

describe("updateRecruiterSchema", () => {
  it("accepts an empty object (all fields optional)", () => {
    expect(updateRecruiterSchema.safeParse({}).success).toBe(true);
  });

  it("coerces ISO date strings for the follow-up dates", () => {
    const r = updateRecruiterSchema.safeParse({ nextFollowUp: "2026-02-01" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.nextFollowUp).toBeInstanceOf(Date);
  });
});
