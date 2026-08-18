"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import { useJobs } from "@/features/jobs/hooks";
import { useRecruiters } from "@/features/recruiters/hooks";
import { JobFormDialog } from "@/features/jobs/JobFormDialog";
import { Button } from "@/features/ui/Button";
import { HomeHeader } from "./components/HomeHeader";
import { ApplicationPipeline } from "./components/ApplicationPipeline";
import { AttentionRequired } from "./components/AttentionRequired";
import { QuickStatus } from "./components/QuickStatus";
import { RecentActivity } from "./components/RecentActivity";

// Home = the job-search command center. Everything is derived from the existing
// owner-scoped useJobs()/useRecruiters() caches — no dashboard/analytics API.
export default function HomePage() {
  const { user } = useUser();
  const jobsQ = useJobs();
  const recruitersQ = useRecruiters();
  const [adding, setAdding] = useState(false);

  const name = user?.firstName;

  if (jobsQ.isLoading || recruitersQ.isLoading) return <HomeSkeleton />;

  if (jobsQ.error || recruitersQ.error || !jobsQ.data || !recruitersQ.data) {
    return (
      <ErrorState
        onRetry={() => {
          jobsQ.refetch();
          recruitersQ.refetch();
        }}
      />
    );
  }

  const jobs = jobsQ.data;
  const recruiters = recruitersQ.data;

  return (
    <>
      <HomeHeader name={name} jobs={jobs} recruiters={recruiters} onAddJob={() => setAdding(true)} />

      {jobs.length === 0 ? (
        <section className="rounded-md border border-dashed border-line p-8 text-center">
          <p className="text-sm text-fg">No applications yet.</p>
          <p className="mt-1 text-sm text-muted">
            Add your first job to start building your pipeline.
          </p>
          <div className="mt-4 flex justify-center">
            <Button variant="primary" onClick={() => setAdding(true)}>
              <Plus size={16} /> Add job
            </Button>
          </div>
        </section>
      ) : (
        <>
          <ApplicationPipeline jobs={jobs} />

          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <AttentionRequired jobs={jobs} recruiters={recruiters} />
            </div>
            <QuickStatus jobs={jobs} />
          </div>

          <RecentActivity jobs={jobs} recruiters={recruiters} />
        </>
      )}

      {adding && <JobFormDialog onClose={() => setAdding(false)} />}
    </>
  );
}

// Intentional loading state — never flash "0 applications" before data arrives.
function HomeSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className="h-6 w-56 rounded bg-surface" />
        <div className="mt-2 h-4 w-72 rounded bg-surface" />
      </div>
      <div className="grid grid-cols-3 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 bg-surface" />
        ))}
      </div>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-md border border-line bg-surface p-8 text-center">
      <p className="text-sm text-fg">Couldn&apos;t load your dashboard.</p>
      <div className="mt-4 flex justify-center">
        <Button variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      </div>
    </div>
  );
}
