import { describe, it, expect } from "vitest";
import type { Job, Recruiter, Resume } from "@prisma/client";
import type { SavedAnalysis } from "@/features/ai/hooks";
import { normalizeSearchText, searchAll, recentItems, type SearchData } from "./search";

// Deterministic fixtures — search is pure, so tests build minimal owner-scoped
// records and assert on grouping/ranking/deep-links. Dates drive recency ties.
let seq = 0;
const D = (day: number) => new Date(2026, 7, day, 12, 0, 0);

function job(over: Partial<Job>): Job {
  return {
    id: `j${seq++}`, userId: "u1", company: "", position: "", status: "WISHLIST",
    source: null, jobLink: null, description: null, salary: null, location: null,
    workMode: null, dateApplied: null, nextFollowUp: null, notes: null,
    createdAt: D(1), updatedAt: D(1), ...over,
  };
}
function recruiter(over: Partial<Recruiter>): Recruiter {
  return {
    id: `r${seq++}`, userId: "u1", name: "", company: null, email: null, phone: null,
    linkedinUrl: null, notes: null, lastContact: null, nextFollowUp: null,
    createdAt: D(1), updatedAt: D(1), ...over,
  };
}
function resume(over: Partial<Resume>): Resume {
  return {
    id: `re${seq++}`, userId: "u1", name: "", content: "", sourceFile: null,
    parentId: null, createdAt: D(1), updatedAt: D(1), ...over,
  };
}
function analysis(over: Partial<SavedAnalysis>): SavedAnalysis {
  return {
    id: `an${seq++}`, userId: "u1", jobId: null, title: "", description: "", model: "gemini",
    createdAt: D(1),
    result: {
      title: "", companySummary: "", seniority: "Mid", interviewDifficulty: "Medium",
      techStack: [], requiredSkills: [], optionalSkills: [], responsibilities: [], keywords: [],
    },
    ...over,
  };
}
const data = (over: Partial<SearchData>): SearchData => ({ jobs: [], recruiters: [], resumes: [], analyses: [], ...over });

describe("normalizeSearchText", () => {
  it("lowercases, and folds punctuation/whitespace to single spaces", () => {
    expect(normalizeSearchText("  Full-Stack   Developer! ")).toBe("full stack developer");
    expect(normalizeSearchText("GOOGLE")).toBe("google");
    expect(normalizeSearchText("john@acme.com")).toBe("john acme com");
  });
});

describe("case insensitivity", () => {
  it("matches regardless of case", () => {
    const d = data({ jobs: [job({ position: "Engineer", company: "Google" })] });
    for (const q of ["Google", "google", "GOOGLE"]) {
      const groups = searchAll(q, d);
      expect(groups).toHaveLength(1);
      expect(groups[0].results[0].title).toBe("Engineer");
    }
  });
});

describe("partial / multi-term matching", () => {
  it("'full stack' matches 'Senior Full Stack Developer'", () => {
    const d = data({ jobs: [job({ position: "Senior Full Stack Developer", company: "X" })] });
    const groups = searchAll("full stack", d);
    expect(groups[0].results[0].title).toBe("Senior Full Stack Developer");
  });
});

describe("ranking", () => {
  it("exact company match outranks a long-content mention", () => {
    const d = data({
      jobs: [job({ position: "Senior Full Stack Developer", company: "Acme" })],
      resumes: [resume({ name: "My Resume", content: "...worked with an Acme project..." })],
    });
    const groups = searchAll("Acme", d);
    // Both groups present, Applications first (§13).
    expect(groups.map((g) => g.type)).toEqual(["application", "resume"]);
    const app = groups[0].results[0];
    const res = groups[1].results[0];
    expect(app.score).toBeGreaterThan(res.score);
  });

  it("exact beats starts-with beats contains within a group", () => {
    const d = data({
      jobs: [
        job({ position: "Acme", company: "Z", updatedAt: D(1) }), // exact title
        job({ position: "Acme Corp Engineer", company: "Z", updatedAt: D(2) }), // starts-with
        job({ position: "Lead at Acme", company: "Z", updatedAt: D(3) }), // contains
      ],
    });
    const titles = searchAll("Acme", d)[0].results.map((r) => r.title);
    expect(titles).toEqual(["Acme", "Acme Corp Engineer", "Lead at Acme"]);
  });
});

describe("metadata matching", () => {
  it("matches applications on status/source/location", () => {
    const d = data({ jobs: [job({ position: "Eng", company: "X", location: "Remote", status: "APPLIED" })] });
    expect(searchAll("remote", d)[0].results[0].title).toBe("Eng");
    expect(searchAll("applied", d)[0].results[0].title).toBe("Eng");
  });
  it("matches resumes on the master/tailored indicator", () => {
    const d = data({ resumes: [resume({ name: "R", parentId: "master-1" })] });
    const groups = searchAll("tailored", d);
    expect(groups[0].results[0].subtitle).toBe("Tailored");
  });
});

describe("multiple entities in one query", () => {
  it("returns application + contact + resume + analysis groups", () => {
    const d = data({
      jobs: [job({ position: "Eng", company: "Acme" })],
      recruiters: [recruiter({ name: "Jane", company: "Acme" })],
      resumes: [resume({ name: "Acme Resume" })],
      analyses: [analysis({ title: "Acme JD analysis" })],
    });
    const groups = searchAll("acme", d);
    expect(groups.map((g) => g.type)).toEqual(["application", "contact", "resume", "analysis"]);
    expect(groups.every((g) => g.results.length === 1)).toBe(true);
  });
});

describe("empty query", () => {
  it("searchAll returns no groups for blank/whitespace queries", () => {
    const d = data({ jobs: [job({ position: "Eng", company: "Acme" })] });
    expect(searchAll("", d)).toEqual([]);
    expect(searchAll("   ", d)).toEqual([]);
  });
  it("recentItems returns records newest-first across entities", () => {
    const d = data({
      jobs: [job({ position: "Old", company: "X", updatedAt: D(1) })],
      recruiters: [recruiter({ name: "Newest", updatedAt: D(9) })],
      resumes: [resume({ name: "Mid", updatedAt: D(5) })],
    });
    const titles = recentItems(d).map((r) => r.title);
    expect(titles).toEqual(["Newest", "Mid", "Old"]);
  });
});

describe("no results", () => {
  it("returns [] when nothing matches", () => {
    const d = data({ jobs: [job({ position: "Eng", company: "Acme" })] });
    expect(searchAll("zzzzz", d)).toEqual([]);
  });
});

describe("deep-link targets", () => {
  it("maps each result type to the correct destination", () => {
    const linkedJob = job({ id: "job-1", position: "Eng", company: "Acme" });
    const d = data({
      jobs: [linkedJob],
      recruiters: [recruiter({ name: "Jane Acme" })],
      resumes: [resume({ id: "res-1", name: "Acme Resume" })],
      analyses: [
        analysis({ id: "a-linked", title: "Acme linked", jobId: "job-1" }),
        analysis({ id: "a-legacy", title: "Acme legacy", jobId: null }),
      ],
    });
    const byType = Object.fromEntries(searchAll("acme", d).map((g) => [g.type, g.results]));
    expect(byType.application[0].href).toBe("/dashboard/workspace?jobId=job-1");
    expect(byType.contact[0].href).toBe("/dashboard/recruiters?q=Jane%20Acme");
    expect(byType.resume[0].href).toBe("/dashboard/resumes?resume=res-1");
    // Linked analysis → job workspace; legacy (no jobId) → Analyze history, no fabricated job.
    const linked = byType.analysis.find((r) => r.id === "a-linked")!;
    const legacy = byType.analysis.find((r) => r.id === "a-legacy")!;
    expect(linked.href).toBe("/dashboard/workspace?jobId=job-1");
    expect(linked.title).toBe("Eng"); // uses linked job context
    expect(legacy.href).toBe("/dashboard/analyze");
    expect(legacy.title).toBe("Acme legacy"); // falls back to its own title
    expect(legacy.subtitle).toBe("Standalone analysis");
  });
});

describe("result limits", () => {
  it("caps each group at the per-group limit", () => {
    const jobs = Array.from({ length: 8 }, (_, i) => job({ position: `Acme role ${i}`, company: "Acme" }));
    const groups = searchAll("acme", data({ jobs }), 5);
    expect(groups[0].results).toHaveLength(5);
  });
});
