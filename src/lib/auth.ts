import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

/**
 * The single place Clerk identity maps to a local User row.
 * Every API handler calls this; nothing else touches the User table.
 * Returns null when unauthenticated so callers can respond 401.
 */
export async function getOrCreateUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (existing) return existing;

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? "";

  return prisma.user.create({ data: { id: userId, email } });
}
