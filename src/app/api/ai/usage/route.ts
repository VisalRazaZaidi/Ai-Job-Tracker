import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  AI_RATE_LIMIT_MAX_CALLS,
  AI_RATE_LIMIT_WINDOW_MS,
  getAiRateLimitStatus,
} from "@/lib/ai-rate-limit";

export async function GET() {
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const usage = await prisma.aiUsage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  const status = getAiRateLimitStatus(
    user.id,
    usage.map((entry) => ({ at: new Date(entry.createdAt).getTime(), count: 1 }))
  );

  return NextResponse.json({
    maxCalls: AI_RATE_LIMIT_MAX_CALLS,
    windowMs: AI_RATE_LIMIT_WINDOW_MS,
    remaining: status.remaining,
    allowed: status.allowed,
    retryAfterSeconds: status.retryAfterSeconds,
    resetAt: status.resetAt,
    used: usage.length,
  });
}
