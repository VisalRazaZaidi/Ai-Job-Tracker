import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeJobInputSchema, jobAnalysisSchema } from "@/features/ai/schema";
import { getModel, isAllowedModel, DEFAULT_MODEL } from "@/lib/ai";
import { getAiRateLimitStatus, getAiRateLimitErrorMessage } from "@/lib/ai-rate-limit";

export async function POST(req: Request) {
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = analyzeJobInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { description, jobId, model: requestedModel } = parsed.data;
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

  // Resolve the text to analyze. In the Workspace flow the client sends only a
  // jobId; the JD MUST come from the owned Job record on the server — never trust
  // the client to supply it (security + historical integrity).
  let jd: string;
  if (jobId) {
    const job = await prisma.job.findFirst({ where: { id: jobId, userId: user.id } });
    if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!job.description || job.description.trim().length < 50) {
      return NextResponse.json(
        { error: "This job has no description to analyze — add one on the Applications tab first." },
        { status: 422 }
      );
    }
    jd = job.description;
  } else {
    jd = description!; // schema guarantees exactly one of description / jobId
  }

  try {
    const { object } = await generateObject({
      model: getModel(modelId),
      schema: jobAnalysisSchema,
      system:
        "You are a job-description analyst. Extract factual information only. " +
        "Never invent skills, technologies, or requirements not present in the text.",
      prompt: `Analyze this job description:\n\n${jd}`,
    });

    // Persist so the history list can re-open it without another AI call. `jobId`
    // links it to the Job (Workspace flow) or stays null (legacy paste flow). We
    // store the exact JD analyzed as `description` for historical integrity.
    const saved = await prisma.analysis.create({
      data: {
        userId: user.id,
        jobId: jobId ?? null,
        title: object.title,
        description: jd,
        result: object,
        model: modelId,
      },
    });

    await prisma.aiUsage.create({
      data: {
        userId: user.id,
        action: "analyze-job",
      },
    });

    return NextResponse.json(saved, { status: 201 });
  } catch (err) {
    // Log the real provider error server-side; never leak it to the client (§12).
    console.error("analyze-job failed:", err);
    return NextResponse.json(
      {
        error:
          "Analysis couldn't be completed. The AI service didn't return a valid response. Please try again.",
      },
      { status: 502 }
    );
  }
}
