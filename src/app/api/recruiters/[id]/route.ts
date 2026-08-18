import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateRecruiterSchema } from "@/features/recruiters/schema";

type Params = { params: Promise<{ id: string }> };

// Fetch a recruiter only if it belongs to the caller; null otherwise so the
// handler responds 404 — never leak existence of another user's row.
async function findOwnedRecruiter(recruiterId: string, userId: string) {
  return prisma.recruiter.findFirst({ where: { id: recruiterId, userId } });
}

export async function GET(_req: Request, { params }: Params) {
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const recruiter = await findOwnedRecruiter(id, user.id);
  if (!recruiter) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(recruiter);
}

export async function PATCH(req: Request, { params }: Params) {
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await findOwnedRecruiter(id, user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = updateRecruiterSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { email, linkedinUrl, ...rest } = parsed.data;
  const recruiter = await prisma.recruiter.update({
    where: { id },
    data: {
      ...rest,
      ...(email !== undefined && { email: email || null }),
      ...(linkedinUrl !== undefined && { linkedinUrl: linkedinUrl || null }),
    },
  });
  return NextResponse.json(recruiter);
}

export async function DELETE(_req: Request, { params }: Params) {
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await findOwnedRecruiter(id, user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.recruiter.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
