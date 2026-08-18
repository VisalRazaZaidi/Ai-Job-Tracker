"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Job } from "@prisma/client";
import { createJobSchema, JOB_STATUSES, WORK_MODES, type CreateJobInput } from "./schema";
import { useCreateJob, useUpdateJob } from "./hooks";
import { Dialog } from "@/features/ui/Dialog";
import { Button } from "@/features/ui/Button";

// Turns a Job row into form defaults; nullable DB fields become "" for inputs,
// and the applied date is sliced to yyyy-mm-dd for <input type="date">. The date
// is typed loosely because the resolver re-coerces the string back to a Date.
function toDefaults(job?: Job): Record<string, unknown> {
  if (!job) return { status: "WISHLIST" };
  return {
    company: job.company,
    position: job.position,
    status: job.status,
    source: job.source ?? undefined,
    jobLink: job.jobLink ?? undefined,
    description: job.description ?? undefined,
    salary: job.salary ?? undefined,
    location: job.location ?? undefined,
    workMode: job.workMode ?? undefined,
    dateApplied: job.dateApplied
      ? new Date(job.dateApplied).toISOString().slice(0, 10)
      : undefined,
    nextFollowUp: job.nextFollowUp
      ? new Date(job.nextFollowUp).toISOString().slice(0, 10)
      : undefined,
    notes: job.notes ?? undefined,
  };
}

const inputCls =
  "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-accent";

export function JobFormDialog({ job, onClose }: { job?: Job; onClose: () => void }) {
  const isEdit = !!job;
  const create = useCreateJob();
  const update = useUpdateJob(job?.id ?? "");
  const mutation = isEdit ? update : create;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateJobInput>({
    resolver: zodResolver(createJobSchema),
    defaultValues: toDefaults(job) as Partial<CreateJobInput>,
  });

  const onSubmit = handleSubmit((values) => {
    mutation.mutate(values, { onSuccess: onClose });
  });

  return (
    <Dialog open onClose={onClose} title={isEdit ? "Edit job" : "New job"}>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Company" error={errors.company?.message}>
            <input className={inputCls} {...register("company")} />
          </Field>
          <Field label="Position" error={errors.position?.message}>
            <input className={inputCls} {...register("position")} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Status">
            <select className={inputCls} {...register("status")}>
              {JOB_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Work mode">
            <select className={inputCls} {...register("workMode")} defaultValue="">
              <option value="">—</option>
              {WORK_MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Source">
            <input className={inputCls} placeholder="LinkedIn, Referral…" {...register("source")} />
          </Field>
          <Field label="Location">
            <input className={inputCls} {...register("location")} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Salary">
            <input className={inputCls} {...register("salary")} />
          </Field>
          <Field label="Date applied">
            <input type="date" className={inputCls} {...register("dateApplied")} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Next follow-up">
            <input type="date" className={inputCls} {...register("nextFollowUp")} />
          </Field>
        </div>

        <Field label="Job link" error={errors.jobLink?.message}>
          <input className={inputCls} placeholder="https://…" {...register("jobLink")} />
        </Field>

        <Field label="Description">
          <textarea rows={3} className={inputCls} {...register("description")} />
        </Field>

        <Field label="Notes">
          <textarea rows={2} className={inputCls} {...register("notes")} />
        </Field>

        {mutation.isError && (
          <p className="text-sm text-red-400">Could not save. Please try again.</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : isEdit ? "Save changes" : "Add job"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
    </label>
  );
}
