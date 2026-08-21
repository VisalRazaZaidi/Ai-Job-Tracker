import { describe, expect, it } from "vitest";
import { canMarkApplied, buildSnapshotData } from "./apply";

describe("canMarkApplied", () => {
  it("allows and flips status from WISHLIST", () => {
    expect(canMarkApplied("WISHLIST")).toEqual({ ok: true, changeStatus: true });
  });

  it("is idempotent on an already-APPLIED job (allowed, no status change)", () => {
    expect(canMarkApplied("APPLIED")).toEqual({ ok: true, changeStatus: false });
  });

  it("blocks later/closed states without dragging them backwards", () => {
    for (const status of [
      "INTERVIEW",
      "ASSESSMENT",
      "TECHNICAL",
      "HR",
      "OFFER",
      "REJECTED",
      "ACCEPTED",
      "WITHDRAWN",
      "ARCHIVED",
    ] as const) {
      const d = canMarkApplied(status);
      expect(d.ok).toBe(false);
      if (!d.ok) expect(d.reason).toMatch(/already progressed/i);
    }
  });
});

describe("buildSnapshotData", () => {
  const base = {
    userId: "u1",
    job: { id: "j1", description: "Original JD text", dateApplied: null },
    resume: { id: "r1", name: "Master v1", content: "# Resume\nReact, Node" },
    matchScore: 84,
    now: new Date("2026-08-21T10:00:00Z"),
  };

  it("copies resume name/content and JD by value", () => {
    const snap = buildSnapshotData(base);
    expect(snap).toMatchObject({
      userId: "u1",
      jobId: "j1",
      resumeId: "r1",
      resumeName: "Master v1",
      resumeContent: "# Resume\nReact, Node",
      jobDescription: "Original JD text",
      matchScore: 84,
      note: null,
    });
  });

  // Historical integrity (§5, §25): mutating the source after building the
  // snapshot must not change the recorded copy.
  it("is immutable against later edits to the source resume and job", () => {
    const job = { id: "j1", description: "Original JD", dateApplied: null };
    const resume = { id: "r1", name: "Master v1", content: "old content" };
    const snap = buildSnapshotData({ ...base, job, resume });

    job.description = "EDITED JD";
    resume.content = "EDITED content";
    resume.name = "Master v2";

    expect(snap.jobDescription).toBe("Original JD");
    expect(snap.resumeContent).toBe("old content");
    expect(snap.resumeName).toBe("Master v1");
  });

  it("preserves the match score, including null", () => {
    expect(buildSnapshotData({ ...base, matchScore: null }).matchScore).toBeNull();
    expect(buildSnapshotData({ ...base, matchScore: 0 }).matchScore).toBe(0);
  });

  it("prefers the job's existing dateApplied over now, else stamps now", () => {
    const dateApplied = new Date("2026-01-01T00:00:00Z");
    expect(
      buildSnapshotData({ ...base, job: { ...base.job, dateApplied } }).appliedAt
    ).toBe(dateApplied);
    expect(buildSnapshotData(base).appliedAt).toBe(base.now);
  });

  it("trims a note and nulls a blank one", () => {
    expect(buildSnapshotData({ ...base, note: "  hi  " }).note).toBe("hi");
    expect(buildSnapshotData({ ...base, note: "   " }).note).toBeNull();
    expect(buildSnapshotData({ ...base, note: undefined }).note).toBeNull();
  });

  it("treats a missing job description as empty string", () => {
    expect(
      buildSnapshotData({ ...base, job: { ...base.job, description: null } }).jobDescription
    ).toBe("");
  });
});
