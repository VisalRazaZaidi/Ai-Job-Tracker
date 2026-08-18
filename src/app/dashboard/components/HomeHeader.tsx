"use client";

import Link from "next/link";
import type { Job, Recruiter } from "@prisma/client";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/features/ui/Button";
import { stageByKey } from "@/features/jobs/status";
import { isDue } from "@/features/shared/dates";

// Time-of-day from the viewer's local clock. Night (00:00–04:59) folds into
// "evening" so the greeting stays professional — no "good night" sign-off.
function timeGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Good morning";
  if (h >= 12 && h < 18) return "Good afternoon";
  return "Good evening";
}

// One deterministic sentence, chosen by what most needs the user's attention.
// Never fabricated — every branch is backed by real data.
function contextSentence(jobs: Job[], recruiters: Recruiter[]) {
  if (jobs.length === 0) return "Your job search starts here.";

  const due = [...jobs, ...recruiters].filter(
    (x) => x.nextFollowUp && isDue(x.nextFollowUp)
  ).length;
  if (due > 0) return `${due} follow-up${due > 1 ? "s" : ""} need${due > 1 ? "" : "s"} your attention.`;

  const interview = stageByKey("interview")!.statuses as readonly string[];
  const inInterview = jobs.filter((j) => interview.includes(j.status)).length;
  if (inInterview > 0)
    return `${inInterview} application${inInterview > 1 ? "s" : ""} in the interview stage.`;

  return `You're tracking ${jobs.length} application${jobs.length > 1 ? "s" : ""}.`;
}

export function HomeHeader({
  name,
  jobs,
  recruiters,
  onAddJob,
}: {
  name?: string | null;
  jobs: Job[];
  recruiters: Recruiter[];
  onAddJob: () => void;
}) {
  return (
    <header className="mb-8">
      <h1 className="text-xl font-semibold tracking-tight text-fg">
        {timeGreeting()}
        {name ? `, ${name}` : ""}.
      </h1>
      <p className="mt-1 text-sm text-muted">{contextSentence(jobs, recruiters)}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="primary" onClick={onAddJob} className="shadow-hard">
          <Plus size={16} /> Add job
        </Button>
        {/* Navigation → a real anchor styled to match the secondary button. */}
        <Link
          href="/dashboard/workspace"
          className="inline-flex items-center gap-1.5 rounded-md border border-line px-4 py-2 text-sm font-medium text-fg transition hover:bg-surface"
        >
          <Sparkles size={16} /> Open AI Workspace
        </Link>
      </div>
    </header>
  );
}
