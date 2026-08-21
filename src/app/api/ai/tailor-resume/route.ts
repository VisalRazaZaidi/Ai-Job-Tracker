import { NextResponse } from "next/server";
import { generateText } from "ai";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tailorResumeInputSchema } from "@/features/ai/schema";
import { getModel, isAllowedModel, DEFAULT_MODEL } from "@/lib/ai";
import { getAiRateLimitStatus, getAiRateLimitErrorMessage } from "@/lib/ai-rate-limit";

export async function POST(req: Request) {
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = tailorResumeInputSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { resumeId, jobId, model: requestedModel } = parsed.data;

  // Both scoped to the caller — a foreign id just reads as "not found".
  const [resume, job] = await Promise.all([
    prisma.resume.findFirst({ where: { id: resumeId, userId: user.id } }),
    prisma.job.findFirst({ where: { id: jobId, userId: user.id } }),
  ]);
  if (!resume) return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  if (!job.description || job.description.trim().length < 20) {
    return NextResponse.json(
      { error: "That job has no description to tailor against — add one on the Jobs tab first." },
      { status: 422 }
    );
  }

  const jd = [
    `Position: ${job.position}`,
    `Company: ${job.company}`,
    job.location && `Location: ${job.location}`,
    `\nDescription:\n${job.description}`,
  ]
    .filter(Boolean)
    .join("\n");

  const existingResult = await prisma.tailoredResumeResult.findFirst({
    where: { userId: user.id, resumeId, jobId },
    orderBy: { createdAt: "desc" },
  });

  if (existingResult) {
    return NextResponse.json({ tailored: existingResult.content });
  }

  const modelId =
    requestedModel && isAllowedModel(requestedModel) ? requestedModel : DEFAULT_MODEL;

  const recentUsage = await prisma.aiUsage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });
  const rateLimit = getAiRateLimitStatus(
    user.id,
    recentUsage.map((entry) => ({ at: new Date(entry.createdAt).getTime(), count: 1 }))
  );

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: getAiRateLimitErrorMessage(rateLimit.retryAfterSeconds) },
      { status: 429 }
    );
  }

  try {
    const { text } = await generateText({
      model: getModel(modelId),
      system:
        "You are a resume editor. You tailor an existing resume to a specific job by " +
        "REORDERING and REWORDING what is already in the resume so the most relevant " +
        "experience and skills lead, and by surfacing terminology from the job description " +
        "ONLY where the resume already supports it. Absolute rules: never invent employers, " +
        "titles, dates, degrees, skills, or metrics that are not in the original resume. Do " +
        "not remove factual history. Keep it truthful. Output ONLY the tailored resume as " +
        "clean Markdown — no preamble, no explanation, no code fences.",
      prompt:
        `ORIGINAL RESUME (Markdown):\n${resume.content}\n\n` +
        `TARGET JOB:\n${jd}\n\n` +
        `Return the tailored resume in Markdown.`,
    });

    const tailored = text.trim();

    await prisma.tailoredResumeResult.create({
      data: {
        userId: user.id,
        resumeId,
        jobId,
        content: tailored,
      },
    });

    await prisma.aiUsage.create({
      data: {
        userId: user.id,
        action: "tailor-resume",
      },
    });

    return NextResponse.json({ tailored });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
