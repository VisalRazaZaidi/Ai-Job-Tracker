import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractResumeText } from "@/lib/extract";

// pdf-parse / mammoth need the Node runtime (not Edge).
export const runtime = "nodejs";

const MAX_BYTES = 2_000_000; // 2MB — a resume is never larger than this.

export async function POST(req: Request) {
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 2MB)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let content: string;
  try {
    content = await extractResumeText(buffer, file.name);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not read the file";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  const name = file.name.replace(/\.(pdf|docx)$/i, "");
  const resume = await prisma.resume.create({
    data: { name, content, sourceFile: file.name, userId: user.id },
  });
  return NextResponse.json(resume, { status: 201 });
}
