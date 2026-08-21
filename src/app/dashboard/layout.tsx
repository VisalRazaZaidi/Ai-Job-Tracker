"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/features/ui/ThemeToggle";
import { GlobalSearch } from "@/features/search/GlobalSearch";

// Goal-oriented IA (Productization v2). Routes are preserved — only labels and
// grouping change. "AI Workspace" points at the new /dashboard/workspace stub;
// the existing /dashboard/analyze route is untouched and still reachable directly.
const TABS = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/jobs", label: "Applications" },
  { href: "/dashboard/workspace", label: "AI Workspace" },
  { href: "/dashboard/resumes", label: "Resumes" },
  { href: "/dashboard/recruiters", label: "Contacts" },
  { href: "/dashboard/insights", label: "Insights" },
];

// Home is only active on an exact match; every other tab stays active on its
// nested routes (e.g. /dashboard/jobs/[id], /dashboard/resumes/tailor).
function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-5xl p-6">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: "var(--accent)", boxShadow: "0 0 12px var(--accent)" }}
            />
            <span className="font-mono text-sm font-medium tracking-tight text-fg">
              job<span className="text-muted">/</span>tracker
            </span>
          </Link>
          <nav className="flex items-center gap-1" aria-label="Dashboard">
            {TABS.map((t) => {
              const active = isActive(pathname, t.href);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative rounded-md px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "border border-line bg-surface font-medium text-fg shadow-hard"
                      : "text-muted hover:text-fg"
                  }`}
                >
                  {t.label}
                  {active && (
                    <span
                      className="absolute inset-x-2 -bottom-px h-0.5 rounded-full"
                      style={{ background: "var(--accent)" }}
                      aria-hidden
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-1.5">
          <GlobalSearch />
          <ThemeToggle />
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>
      {children}
    </div>
  );
}

