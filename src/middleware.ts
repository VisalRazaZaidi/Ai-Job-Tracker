import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// The landing page and Clerk's own sign-in/sign-up UI are public;
// everything else (dashboard, API) requires a session.
const isPublic = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublic(req)) await auth.protect();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
