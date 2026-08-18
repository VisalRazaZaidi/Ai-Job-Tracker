import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateResumeSchema } from "@/features/resumes/schema";

type Params = { params: Promise<{ id: string }> };

// Only return a resume that belongs to the caller; null otherwise → 404.
async function findOwnedResume(resumeId: string, userId: string) {
  return prisma.resume.findFirst({ where: { id: resumeId, userId } });
}

export async function GET(_req: Request, { params }: Params) {
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const resume = await findOwnedResume(id, user.id);
  if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(resume);
}

export async function PATCH(req: Request, { params }: Params) {
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await findOwnedResume(id, user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = updateResumeSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const resume = await prisma.resume.update({ where: { id }, data: parsed.data });
  return NextResponse.json(resume);
}

export async function DELETE(_req: Request, { params }: Params) {
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await findOwnedResume(id, user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.resume.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
