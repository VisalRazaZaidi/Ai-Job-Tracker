"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useResumes, useCreateResume } from "@/features/resumes/hooks";
import { useJobs } from "@/features/jobs/hooks";
import { useAiUsageStatus, useTailorResume } from "@/features/ai/hooks";
import { AI_MODELS, DEFAULT_MODEL, type AiModelId } from "@/lib/ai";

export default function TailorResumePage() {
  const router = useRouter();
  const { data: resumes } = useResumes();
  const { data: jobs } = useJobs();
  const { data: usage } = useAiUsageStatus();
  const tailor = useTailorResume();
  const createResume = useCreateResume();

  const [resumeId, setResumeId] = useState("");
  const [jobId, setJobId] = useState("");
  const [model, setModel] = useState<AiModelId>(DEFAULT_MODEL);
  const [draft, setDraft] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (!usage || usage.allowed) {
      setCooldownSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const secondsLeft = Math.max(0, Math.ceil((usage.resetAt - Date.now()) / 1000));
      setCooldownSeconds(secondsLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [usage]);

  const aiBlocked = usage ? !usage.allowed : false;

  // Default the pickers to the first of each once loaded.
  useEffect(() => {
    if (!resumeId && resumes?.length) setResumeId(resumes[0].id);
  }, [resumes, resumeId]);
  useEffect(() => {
    if (!jobId && jobs?.length) setJobId(jobs[0].id);
  }, [jobs, jobId]);

  const resume = resumes?.find((r) => r.id === resumeId);
  const job = jobs?.find((j) => j.id === jobId);

  function handleTailor() {
    tailor.mutate(
      { resumeId, jobId, model },
      { onSuccess: (d) => setDraft(d.tailored) }
    );
  }

  function handleSave() {
    if (!draft || !resume || !job) return;
    const name = `${resume.name} → ${job.position} @ ${job.company}`.slice(0, 120);
    createResume.mutate(
      { name, content: draft, parentId: resume.id },
      { onSuccess: () => router.push("/dashboard/resumes") }
    );
  }

  const noResumes = resumes?.length === 0;
  const noJobs = jobs?.length === 0;

  return (
    <>
      <Link
        href="/dashboard/resumes"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-fg"
      >
        <ArrowLeft size={15} /> Resumes
      </Link>

      <div className="mb-6">
        <h1 className="text-lg font-semibold text-fg">Tailor a resume</h1>
        <p className="mt-1 text-sm text-muted">
          Pick a resume and a saved job. The AI reorders and rewords what&apos;s already there
          to match the role — it never invents experience. Review before saving.
        </p>
      </div>

      {usage && !usage.allowed && (
        <div className="mb-4 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          AI usage limit reached. You can run another resume tailoring in {cooldownSeconds || usage.retryAfterSeconds}s.
        </div>
      )}
      {/* PLACEHOLDER_CONTROLS */}
      {(noResumes || noJobs) && (
        <p className="rounded-lg border border-line bg-surface px-4 py-3 text-sm text-muted">
          {noResumes && "Add a resume on the Resumes tab first. "}
          {noJobs && "Add a job (with a description) on the Jobs tab first."}
        </p>
      )}

      {!noResumes && !noJobs && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs font-medium text-muted">Resume</span>
              <select
                value={resumeId}
                onChange={(e) => setResumeId(e.target.value)}
                className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
              >
                {resumes?.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="mb-1.5 block text-xs font-medium text-muted">Target job</span>
              <select
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
              >
                {jobs?.map((j) => (
                  <option key={j.id} value={j.id}>{j.position} @ {j.company}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as AiModelId)}
              className="rounded-md border border-line bg-surface px-3 py-1.5 text-sm text-fg focus:border-accent focus:outline-none"
            >
              {AI_MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.provider} — {m.label}</option>
              ))}
            </select>
            <button
              onClick={handleTailor}
              disabled={tailor.isPending || !resumeId || !jobId || aiBlocked}
              className="rounded-md bg-accent px-4 py-1.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40"
            >
              {tailor.isPending ? "Tailoring…" : aiBlocked ? `Wait ${cooldownSeconds || usage?.retryAfterSeconds || 0}s` : draft ? "Re-tailor" : "Tailor"}
            </button>
          </div>

          {tailor.error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {tailor.error.message}
            </p>
          )}

          {draft !== null && (
            <div className="space-y-3">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={22}
                spellCheck={false}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 font-mono text-[13px] leading-relaxed text-fg focus:border-accent focus:outline-none"
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={createResume.isPending}
                  className="rounded-md bg-accent px-4 py-1.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40"
                >
                  {createResume.isPending ? "Saving…" : "Save as new version"}
                </button>
                <span className="text-xs text-muted">
                  Saved as a tailored copy — your master resume is untouched.
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
