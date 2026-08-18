import { describe, it, expect } from "vitest";
import { calculateMatch } from "./matcher";

describe("calculateMatch", () => {
  describe("strong matches", () => {
    it("matches exact skills", () => {
      const result = calculateMatch(
        ["React"],
        [],
        [],
        [],
        "I have React experience"
      );
      expect(result.strong).toContain("React");
      expect(result.missing).not.toContain("React");
    });

    it("is case-insensitive", () => {
      const result = calculateMatch(
        ["TypeScript"],
        [],
        [],
        [],
        "I love typescript development"
      );
      expect(result.strong).toContain("TypeScript");
    });

    it("uses word boundaries", () => {
      const result = calculateMatch(
        ["Java"],
        [],
        [],
        [],
        "Expert in JavaScript"
      );
      // Should NOT match JavaScript for Java skill
      expect(result.strong).not.toContain("Java");
      expect(result.missing).toContain("Java");
    });

    it("matches with punctuation variations", () => {
      const result = calculateMatch(
        ["Node.js"],
        [],
        [],
        [],
        "Node.js backend developer"
      );
      expect(result.strong).toContain("Node.js");
    });
  });

  describe("partial matches", () => {
    it("matches React aliases", () => {
      const result = calculateMatch(
        ["React"],
        [],
        [],
        [],
        "ReactJS expert"
      );
      expect(result.partial).toContain("React");
    });

    it("matches Node aliases", () => {
      const result = calculateMatch(
        ["Node"],
        [],
        [],
        [],
        "Node.js development"
      );
      expect(result.partial).toContain("Node");
    });

    it("matches Postgres aliases", () => {
      const result = calculateMatch(
        ["Postgres"],
        [],
        [],
        [],
        "PostgreSQL database"
      );
      expect(result.partial).toContain("Postgres");
    });

    it("matches Kubernetes aliases", () => {
      const result = calculateMatch(
        ["Kubernetes"],
        [],
        [],
        [],
        "k8s orchestration"
      );
      expect(result.partial).toContain("Kubernetes");
    });

    it("matches REST API aliases", () => {
      const result = calculateMatch(
        ["REST"],
        [],
        [],
        [],
        "Built RESTful APIs"
      );
      expect(result.partial).toContain("REST");
    });
  });

  describe("missing skills", () => {
    it("detects missing skills", () => {
      const result = calculateMatch(
        ["AWS"],
        [],
        [],
        [],
        "I know Azure and GCP"
      );
      expect(result.missing).toContain("AWS");
      expect(result.strong).not.toContain("AWS");
    });

    it("does not confuse similar-sounding but different technologies", () => {
      const result = calculateMatch(
        ["Java"],
        [],
        [],
        [],
        "JavaScript expert"
      );
      expect(result.missing).toContain("Java");
      expect(result.strong).not.toContain("Java");
    });
  });

  describe("score calculation", () => {
    it("calculates score correctly: (strong + partial*0.5) / total * 100", () => {
      // 4 strong, 0 partial, 1 missing (REST not in resume) = 5 total
      // score = (4 + 0*0.5) / 5 * 100 = 4 / 5 * 100 = 80
      const result = calculateMatch(
        ["React", "TypeScript"],
        ["Postgres"],
        ["Docker"],
        ["REST"],
        "React TypeScript Postgres Docker"
      );
      expect(result.strong.length).toBe(4); // React, TypeScript, Postgres, Docker
      expect(result.missing.length).toBe(1); // REST
      expect(result.score).toBe(80);
    });

    it("handles partial matches in score", () => {
      // 1 strong (React), 1 partial (Node via Node.js), 1 missing (AWS)
      // score = (1 + 1*0.5) / 3 * 100 = 1.5 / 3 * 100 = 50
      const result = calculateMatch(
        ["React"],
        ["Node"],
        [],
        ["AWS"],
        "React Node.js"
      );
      expect(result.strong.length).toBe(1);
      expect(result.partial.length).toBe(1);
      expect(result.missing.length).toBe(1);
      expect(result.score).toBe(50);
    });

    it("rounds score to integer", () => {
      // 1 strong, 1 partial, 1 missing = 3 total
      // (1 + 1*0.5) / 3 * 100 = 50
      const result = calculateMatch(
        ["React", "Vue", "Angular"],
        [],
        [],
        [],
        "React Vue"
      );
      expect(typeof result.score).toBe("number");
      if (result.score !== null) {
        expect(result.score).toBe(Math.round(result.score));
      }
    });

    it("returns null score for empty keywords", () => {
      const result = calculateMatch([], [], [], [], "Some resume");
      expect(result.score).toBeNull();
      expect(result.keywords).toEqual([]);
    });
  });

  describe("deduplication", () => {
    it("deduplicates identical skills", () => {
      const result = calculateMatch(
        ["React", "React"],
        ["React"],
        [],
        [],
        "React developer"
      );
      // React should appear only once, all as strong matches
      expect(result.keywords.filter((k) => k === "React").length).toBe(1);
    });

    it("deduplicates normalized variants", () => {
      const result = calculateMatch(
        ["react"],
        ["React"],
        ["REACT"],
        [],
        "React developer"
      );
      // All normalized to 'react', deduplicated
      expect(result.keywords.filter((k) => normalize(k) === "react").length).toBe(
        1
      );
    });
  });

  describe("real-world examples", () => {
    it("handles complex resume", () => {
      const resume = `
        Senior Full Stack Engineer
        
        Skills: React, TypeScript, Node.js, PostgreSQL, Docker, REST APIs, GraphQL
        
        Experience:
        - Built React applications with TypeScript
        - Designed RESTful and GraphQL APIs with Node.js
        - Database: PostgreSQL
        - Container: Docker
        
        Not used: AWS, Kubernetes
      `;

      const result = calculateMatch(
        ["React", "Vue"],
        ["TypeScript", "Node.js", "PostgreSQL"],
        ["Docker", "GraphQL"],
        ["REST", "AWS", "Kubernetes"],
        resume
      );

      // Most skills should match because they're in the resume
      expect(result.strong).toContain("React");
      expect(result.strong).toContain("TypeScript");
      expect(result.strong).toContain("Node.js");
      // Vue is not in the resume
      expect(result.missing).toContain("Vue");
      // Score should be high since most skills are present
      expect(result.score).toBeGreaterThan(60);
    });

    it("handles minimal resume", () => {
      const result = calculateMatch(
        ["React"],
        ["Node.js"],
        [],
        ["AWS"],
        "I know React."
      );

      expect(result.strong).toContain("React");
      expect(result.missing).toContain("Node.js");
      expect(result.missing).toContain("AWS");
    });
  });
});

// Helper for tests
function normalize(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.()]/g, "")
    .replace(/\s+/g, " ");
}
