import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import { statusHex } from "@/features/jobs/status";

// The hero thesis: a job search IS a pipeline. These four stages echo the
// app's status color language exactly (statusHex), so the landing and the
// product speak the same visual language.
const PIPELINE = [
  { label: "Wishlist", status: "WISHLIST" },
  { label: "Applied", status: "APPLIED" },
  { label: "Interview", status: "INTERVIEW" },
  { label: "Offer", status: "OFFER" },
] as const;

export default function LandingPage() {
  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        background:
          "radial-gradient(60rem 40rem at 50% -10%, color-mix(in srgb, var(--accent) 12%, transparent), transparent)",
      }}
    >
      <header className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: "var(--accent)", boxShadow: "0 0 12px var(--accent)" }}
          />
          <span className="font-mono text-sm font-medium tracking-tight text-fg">
            job<span className="text-muted">/</span>tracker
          </span>
        </div>
        <SignedOut>
          <Link href="/sign-in" className="text-sm text-muted transition-colors hover:text-fg">
            Sign in
          </Link>
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center">
        <p className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Your personal job CRM
        </p>

        <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-fg sm:text-5xl">
          Track every application as a pipeline, not a spreadsheet.
        </h1>

        <p className="mt-5 max-w-xl text-base text-muted">
          Save jobs, move them through each stage, and never lose track of where you
          applied. Built for engineers who apply to a lot of roles.
        </p>

        {/* Signature: the pipeline in the product's own colors. */}
        <div className="mt-12 flex items-center gap-1 sm:gap-2">
          {PIPELINE.map((stage, i) => (
            <div key={stage.status} className="flex items-center gap-1 sm:gap-2">
              <div className="flex flex-col items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{
                    background: statusHex(stage.status),
                    boxShadow: `0 0 10px ${statusHex(stage.status)}`,
                  }}
                />
                <span className="font-mono text-[11px] uppercase tracking-wide text-muted">
                  {stage.label}
                </span>
              </div>
              {i < PIPELINE.length - 1 && (
                <span
                  className="mb-5 h-px w-8 sm:w-14"
                  style={{
                    background: `linear-gradient(90deg, ${statusHex(stage.status)}, ${statusHex(
                      PIPELINE[i + 1].status
                    )})`,
                  }}
                  aria-hidden
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          <SignedOut>
            <Link
              href="/sign-up"
              className="flex items-center gap-1.5 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition hover:opacity-90"
            >
              Get started <ArrowRight size={16} />
            </Link>
            <Link
              href="/sign-in"
              className="rounded-md border border-line px-5 py-2.5 text-sm font-medium text-fg transition-colors hover:bg-surface"
            >
              Sign in
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition hover:opacity-90"
            >
              Open dashboard <ArrowRight size={16} />
            </Link>
          </SignedIn>
        </div>
      </main>
    </div>
  );
}
