import { SectionLabel } from "@/features/ui/SectionLabel";
import type { JobAnalysis } from "./schema";

// Shared presentation of a structured job analysis. Used by the Analyze page
// (paste-a-JD history) and the AI Workspace (job-keyed analysis) so both render
// an analysis identically — one source of truth for the result layout.

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: "text-green-400 border-green-500/40 bg-green-500/10",
  Medium: "text-amber-400 border-amber-500/40 bg-amber-500/10",
  Hard: "text-red-400 border-red-500/40 bg-red-500/10",
};

function Pill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-line bg-raised px-2.5 py-0.5 font-mono text-[11px] text-fg">
      {label}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <SectionLabel>{title}</SectionLabel>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export function AnalysisResult({ data }: { data: JobAnalysis }) {
  return (
    <div className="grid gap-5 rounded-md border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-fg">{data.seniority}</span>
        <span
          className={`rounded-full border px-2.5 py-0.5 font-mono text-[11px] ${DIFFICULTY_COLOR[data.interviewDifficulty] ?? ""}`}
        >
          {data.interviewDifficulty} interview
        </span>
      </div>

      {data.companySummary && (
        <Section title="Company & role">
          <p className="text-sm leading-relaxed text-fg">{data.companySummary}</p>
        </Section>
      )}

      {data.techStack.length > 0 && (
        <Section title="Tech stack">
          <div className="flex flex-wrap gap-1.5">
            {data.techStack.map((t) => <Pill key={t} label={t} />)}
          </div>
        </Section>
      )}

      {data.requiredSkills.length > 0 && (
        <Section title="Required skills">
          <div className="flex flex-wrap gap-1.5">
            {data.requiredSkills.map((s) => <Pill key={s} label={s} />)}
          </div>
        </Section>
      )}

      {data.optionalSkills.length > 0 && (
        <Section title="Nice to have">
          <div className="flex flex-wrap gap-1.5">
            {data.optionalSkills.map((s) => <Pill key={s} label={s} />)}
          </div>
        </Section>
      )}

      {data.responsibilities.length > 0 && (
        <Section title="Responsibilities">
          <ul className="space-y-1">
            {data.responsibilities.map((r) => (
              <li key={r} className="flex gap-2 text-sm text-fg">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted" />
                {r}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {data.keywords.length > 0 && (
        <Section title="ATS keywords">
          <div className="flex flex-wrap gap-1.5">
            {data.keywords.map((k) => (
              <span
                key={k}
                className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 font-mono text-[11px] text-accent"
              >
                {k}
              </span>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
