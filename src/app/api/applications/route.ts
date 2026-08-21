import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ApplicationRecord } from "@/features/analytics/insights";

// GET /api/applications — the caller's recorded application snapshots (the
// immutable historical record) joined with each job's CURRENT status. Owner-
// scoped via `where: { userId }` — the query itself is user-scoped, never a
// global fetch filtered afterward (§26). Every snapshot has a job (required
// relation, cascades on delete), so the join is always present.
//
// Feeds the Insights page, which derives all metrics client-side from this plus
// the existing jobs cache (§25 — no analytics mega-endpoint).
export async function GET() {
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const snapshots = await prisma.applicationSnapshot.findMany({
    where: { userId: user.id },
    orderBy: { appliedAt: "asc" },
    select: {
      id: true,
      appliedAt: true,
      matchScore: true,
      job: { select: { status: true } },
    },
  });

  const applications: ApplicationRecord[] = snapshots.map((s) => ({
    id: s.id,
    appliedAt: s.appliedAt.toISOString(),
    matchScore: s.matchScore,
    status: s.job.status,
  }));
  return NextResponse.json(applications);
}
