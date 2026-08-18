import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateMatch } from "@/features/ai/matcher";
import type { JobAnalysis } from "@/features/ai/schema";

/**
 * POST /api/ai/match
 * 
 * Calculate match score between a job's analysis and a resume.
 * 
 * Request:
 *   { jobId: string, resumeId: string }
 * 
 * Response:
 *   { score: number | null, strong: string[], partial: string[], missing: string[], keywords: string[] }
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { jobId, resumeId } = body;

    if (!jobId || typeof jobId !== "string") {
      return NextResponse.json(
        { error: "jobId is required" },
        { status: 400 }
      );
    }

    if (!resumeId || typeof resumeId !== "string") {
      return NextResponse.json(
        { error: "resumeId is required" },
        { status: 400 }
      );
    }

    // Fetch and ownership-check the Job
    const job = await prisma.job.findFirst({
      where: { id: jobId, userId: user.id },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Fetch and ownership-check the Resume
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: user.id },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Find the latest analysis for this job
    const analysis = await prisma.analysis.findFirst({
      where: {
        jobId,
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!analysis) {
      return NextResponse.json({
        score: null,
        strong: [],
        partial: [],
        missing: [],
        keywords: [],
      });
    }

    // Parse the analysis result (it's stored as JSON)
    let jobAnalysis: JobAnalysis;
    try {
      jobAnalysis = analysis.result as unknown as JobAnalysis;
    } catch {
      return NextResponse.json(
        { error: "Invalid analysis data" },
        { status: 500 }
      );
    }

    // Calculate match
    const matchResult = calculateMatch(
      jobAnalysis.techStack || [],
      jobAnalysis.requiredSkills || [],
      jobAnalysis.optionalSkills || [],
      jobAnalysis.keywords || [],
      resume.content
    );

    return NextResponse.json(matchResult);
  } catch (err) {
    console.error("Match endpoint error:", err);
    return NextResponse.json(
      { error: "Failed to calculate match" },
      { status: 500 }
    );
  }
}
