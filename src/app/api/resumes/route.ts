import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createResumeSchema } from "@/features/resumes/schema";

export async function GET() {
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resumes = await prisma.resume.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(resumes);
}

export async function POST(req: Request) {
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createResumeSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // If tailoring off a parent, the parent must belong to the caller — never trust
  // a client-supplied parentId to point at someone else's resume.
  if (parsed.data.parentId) {
    const parent = await prisma.resume.findFirst({
      where: { id: parsed.data.parentId, userId: user.id },
      select: { id: true },
    });
    if (!parent) return NextResponse.json({ error: "Parent resume not found" }, { status: 404 });
  }

  const resume = await prisma.resume.create({
    data: { ...parsed.data, userId: user.id },
  });
  return NextResponse.json(resume, { status: 201 });
}
