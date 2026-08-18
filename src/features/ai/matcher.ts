/**
 * Deterministic, local skill/keyword matching.
 * Compares extracted job requirements against resume content.
 * No AI calls. No external dependencies.
 */

/**
 * Normalized aliases for skills that have common variations.
 * Use for partial matches when the exact name differs.
 */
const SKILL_ALIASES: Record<string, string[]> = {
  react: ["reactjs", "react.js"],
  "react.js": ["react", "reactjs"],
  reactjs: ["react", "react.js"],
  
  node: ["node.js", "nodejs"],
  "node.js": ["node", "nodejs"],
  nodejs: ["node", "node.js"],
  
  typescript: ["ts"],
  ts: ["typescript"],
  
  javascript: ["js"],
  js: ["javascript"],
  
  postgres: ["postgresql"],
  postgresql: ["postgres"],
  
  mysql: ["my sql"],
  "my sql": ["mysql"],
  
  python: ["py"],
  py: ["python"],
  
  docker: ["containerization"],
  
  kubernetes: ["k8s", "k8"],
  k8s: ["kubernetes", "k8"],
  k8: ["kubernetes", "k8s"],
  
  rest: ["restful", "rest api"],
  "rest api": ["rest", "restful"],
  restful: ["rest", "rest api"],
  
  graphql: ["gql"],
  gql: ["graphql"],
  
  sql: ["sql database"],
  "sql database": ["sql"],
  
  aws: ["amazon web services"],
  "amazon web services": ["aws"],
  
  gcp: ["google cloud"],
  "google cloud": ["gcp"],
  
  azure: ["microsoft azure"],
  "microsoft azure": ["azure"],
};

/**
 * Normalize a skill name for comparison:
 * - lowercase
 * - trim whitespace
 * - remove common punctuation
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.()]/g, "") // Remove dots, parens
    .replace(/\s+/g, " "); // Collapse whitespace
}

/**
 * Check if a skill is strongly present in the resume.
 * Strong = exact normalized match.
 */
function isStrongMatch(skill: string, resumeTextNormalized: string): boolean {
  const normalized = normalize(skill);
  const pattern = new RegExp(`\\b${escapeRegex(normalized)}\\b`);
  return pattern.test(resumeTextNormalized);
}

/**
 * Check if a skill has a partial match via aliases.
 */
function isPartialMatch(skill: string, resumeTextNormalized: string): boolean {
  const normalized = normalize(skill);
  const aliases = SKILL_ALIASES[normalized] || [];
  
  for (const alias of aliases) {
    const pattern = new RegExp(`\\b${escapeRegex(normalize(alias))}\\b`);
    if (pattern.test(resumeTextNormalized)) {
      return true;
    }
  }
  return false;
}

/**
 * Escape regex special characters.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Deduplicate skills by normalization.
 * Keeps the first occurrence (preserves order).
 */
function deduplicateSkills(skills: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  
  for (const skill of skills) {
    const key = normalize(skill);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(skill);
    }
  }
  
  return result;
}

export interface MatchResult {
  score: number | null;
  strong: string[];
  partial: string[];
  missing: string[];
  keywords: string[];
}

/**
 * Calculate match between job analysis and resume content.
 * 
 * @param techStack - Technologies from job analysis
 * @param requiredSkills - Required skills from job analysis
 * @param optionalSkills - Optional/preferred skills from job analysis
 * @param keywords - ATS keywords from job analysis
 * @param resumeContent - Raw resume text/markdown
 * @returns Match result with score, strong/partial/missing classifications
 */
export function calculateMatch(
  techStack: string[],
  requiredSkills: string[],
  optionalSkills: string[],
  keywords: string[],
  resumeContent: string
): MatchResult {
  // Combine all skills and deduplicate
  const allSkills = deduplicateSkills([
    ...techStack,
    ...requiredSkills,
    ...optionalSkills,
    ...keywords,
  ]);

  if (allSkills.length === 0) {
    return {
      score: null,
      strong: [],
      partial: [],
      missing: [],
      keywords: allSkills,
    };
  }

  // Normalize the resume text for consistent comparison
  const resumeNormalized = normalize(resumeContent);
  const strong: string[] = [];
  const partial: string[] = [];
  const missing: string[] = [];

  for (const skill of allSkills) {
    if (isStrongMatch(skill, resumeNormalized)) {
      strong.push(skill);
    } else if (isPartialMatch(skill, resumeNormalized)) {
      partial.push(skill);
    } else {
      missing.push(skill);
    }
  }

  // Score: (strong + partial*0.5) / total * 100
  const score =
    allSkills.length > 0
      ? Math.round(
          ((strong.length + partial.length * 0.5) / allSkills.length) * 100
        )
      : 0;

  return {
    score,
    strong,
    partial,
    missing,
    keywords: allSkills,
  };
}
