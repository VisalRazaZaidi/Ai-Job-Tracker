import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateJobSchema } from "@/features/jobs/schema";

type Params = { params: Promise<{ id: string }> };

// Fetch a job only if it belongs to the caller. Returns null otherwise so the
// handler responds 404 — never leak existence of another user's row.
async function findOwnedJob(jobId: string, userId: string) {
  return prisma.job.findFirst({ where: { id: jobId, userId } });
}

export async function GET(_req: Request, { params }: Params) {
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const job = await findOwnedJob(id, user.id);
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(job);
}

export async function PATCH(req: Request, { params }: Params) {
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await findOwnedJob(id, user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = updateJobSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { jobLink, ...rest } = parsed.data;
  const job = await prisma.job.update({
    where: { id },
    data: { ...rest, ...(jobLink !== undefined && { jobLink: jobLink || null }) },
  });
  return NextResponse.json(job);
}

export async function DELETE(_req: Request, { params }: Params) {
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await findOwnedJob(id, user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.job.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
