import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applyJobSchema } from "@/features/jobs/schema";
import { canMarkApplied, buildSnapshotData } from "@/features/jobs/apply";
import { calculateMatch } from "@/features/ai/matcher";
import type { JobAnalysis } from "@/features/ai/schema";

type Params = { params: Promise<{ id: string }> };

// GET /api/jobs/[id]/apply — the recorded application snapshot for this job, or
// null if it hasn't been applied to yet. Owner-scoped: a foreign/unknown job id
// returns null (same as "no snapshot"), so existence never leaks.
export async function GET(_req: Request, { params }: Params) {
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const snapshot = await prisma.applicationSnapshot.findFirst({
    where: { jobId: id, userId: user.id },
  });
  return NextResponse.json(snapshot);
}

// POST /api/jobs/[id]/apply — mark this job as applied and record an immutable
// snapshot. Deterministic and DB-only: never calls Gemini, never touches the AI
// usage ledger (§34). Idempotent (§13): a job that already has a snapshot is
// returned unchanged. Atomic (§19): snapshot + status move in one transaction.
export async function POST(req: Request, { params }: Params) {
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const parsed = applyJobSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Select a resume before marking as applied." },
      { status: 400 }
    );
  }
  const { resumeId, note } = parsed.data;

  try {
    // Ownership on both entities (§32) — never trust the client for scoping.
    const job = await prisma.job.findFirst({ where: { id, userId: user.id } });
    if (!job) {
      return NextResponse.json({ error: "This application could not be found." }, { status: 404 });
    }

    // Idempotent: if it's already recorded, return the existing snapshot untouched
    // — never overwrite history, reset the date, or duplicate the record.
    const existing = await prisma.applicationSnapshot.findUnique({ where: { jobId: id } });
    if (existing) {
      return NextResponse.json({ job, snapshot: existing });
    }

    const decision = canMarkApplied(job.status);
    if (!decision.ok) {
      return NextResponse.json({ error: decision.reason }, { status: 409 });
    }

    const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId: user.id } });
    if (!resume) {
      return NextResponse.json({ error: "The selected resume could not be found." }, { status: 404 });
    }

    // Recompute the match server-side from the latest analysis (deterministic, so
    // it equals what the UI showed) rather than trusting a client-sent score (§8).
    const analysis = await prisma.analysis.findFirst({
      where: { jobId: id, userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    let matchScore: number | null = null;
    if (analysis) {
      const a = analysis.result as unknown as JobAnalysis;
      matchScore = calculateMatch(
        a.techStack ?? [],
        a.requiredSkills ?? [],
        a.optionalSkills ?? [],
        a.keywords ?? [],
        resume.content
      ).score;
    }

    const data = buildSnapshotData({
      userId: user.id,
      job,
      resume,
      matchScore,
      note,
      now: new Date(),
    });

    const result = await prisma.$transaction(async (tx) => {
      const snapshot = await tx.applicationSnapshot.create({ data });
      const updatedJob = await tx.job.update({
        where: { id },
        data: decision.changeStatus
          ? { status: "APPLIED", dateApplied: data.appliedAt }
          : { dateApplied: job.dateApplied ?? data.appliedAt },
      });
      return { job: updatedJob, snapshot };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("Apply endpoint error:", err);
    return NextResponse.json(
      { error: "This application could not be recorded. Please try again." },
      { status: 500 }
    );
  }
}
