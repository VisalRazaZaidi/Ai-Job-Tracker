import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createRecruiterSchema } from "@/features/recruiters/schema";

export async function GET() {
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const recruiters = await prisma.recruiter.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(recruiters);
}

export async function POST(req: Request) {
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createRecruiterSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { email, linkedinUrl, ...rest } = parsed.data;
  const recruiter = await prisma.recruiter.create({
    data: { ...rest, email: email || null, linkedinUrl: linkedinUrl || null, userId: user.id },
  });
  return NextResponse.json(recruiter, { status: 201 });
}
