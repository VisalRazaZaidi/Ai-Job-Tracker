import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Optional ?jobId= scopes the list to one Job's analyses (Workspace). Always
  // owner-scoped, so a foreign jobId simply returns [] — no existence leak.
  const jobId = new URL(req.url).searchParams.get("jobId");

  const analyses = await prisma.analysis.findMany({
    where: { userId: user.id, ...(jobId ? { jobId } : {}) },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(analyses);
}
