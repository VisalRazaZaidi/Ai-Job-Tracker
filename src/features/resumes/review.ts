export interface ResumeReview {
  wordCount: number;
  headingCount: number;
  headings: string[];
  skills: string[];
  missingSections: string[];
  summary: string;
  issues: string[];
}

const REQUIRED_SECTIONS = ["Summary", "Experience", "Skills"] as const;
const DETECTABLE_SKILLS = [
  "React",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Node",
  "Python",
  "SQL",
  "Postgres",
  "PostgreSQL",
  "AWS",
  "Docker",
  "Kubernetes",
  "GraphQL",
  "REST",
  "Tailwind",
  "Next.js",
  "Next",
  "HTML",
  "CSS",
  "AI",
  "Machine Learning",
  "Product",
  "Leadership",
  "Customer Experience",
];

function normalizeHeading(label: string): string {
  return label
    .toLowerCase()
    .replace(/[#*_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function unique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function extractHeadings(content: string): string[] {
  return unique(
    [...content.matchAll(/^#{1,6}\s+(.+)$/gm)].map((match) => match[1].trim()).filter(Boolean)
  );
}

function extractSkillsFromMarkdown(content: string): string[] {
  const raw = content ?? "";
  const lines = raw.split(/\r?\n/);
  const matches: string[] = [];
  let inSkillsSection = false;

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,6}\s+(.+)$/);
    if (headingMatch) {
      const heading = normalizeHeading(headingMatch[1]);
      inSkillsSection = /(skills|technical skills|core competencies|tooling)/.test(heading);
      continue;
    }

    if (!inSkillsSection) continue;

    const bullet = line.replace(/^[-*•]\s*/, "").trim();
    if (!bullet) continue;

    const items = bullet
      .split(/[,;|]/)
      .map((part) => part.trim())
      .filter(Boolean);

    for (const item of items) {
      if (item.length > 1) matches.push(item);
    }
  }

  if (matches.length > 0) return unique(matches);

  const detected = DETECTABLE_SKILLS.filter((skill) => raw.toLowerCase().includes(skill.toLowerCase()));
  return detected;
}

export function buildResumeReview(content: string): ResumeReview {
  const text = content ?? "";
  const headings = extractHeadings(text);
  const normalizedHeadings = headings.map(normalizeHeading);
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const skills = extractSkillsFromMarkdown(text);

  const missingSections = REQUIRED_SECTIONS.filter((section) => {
    const normalizedSection = normalizeHeading(section);
    return !normalizedHeadings.some(
      (heading) => heading === normalizedSection || heading.includes(normalizedSection)
    );
  }).map((section) => section);

  const issues: string[] = [];
  if (missingSections.length > 0) {
    issues.push(`Missing section(s): ${missingSections.join(", ")}`);
  }
  if (wordCount < 200) {
    issues.push("Resume may be too short for a competitive application.");
  }
  if (skills.length === 0) {
    issues.push("No skills were detected in the current resume.");
  }

  const summary =
    headings.length === 0
      ? "This resume is still a draft. Add a clear summary, experience, and skills sections before applying."
      : `This resume contains ${headings.length} headings and ${skills.length} detected skill areas across ${wordCount} words. ${
          missingSections.length > 0
            ? "A few structural sections are still missing, which may reduce clarity."
            : "The experience and skills sections are clearly structured and review-ready for a job application."
        }`;

  return {
    wordCount,
    headingCount: headings.length,
    headings,
    skills,
    missingSections,
    summary,
    issues,
  };
}
