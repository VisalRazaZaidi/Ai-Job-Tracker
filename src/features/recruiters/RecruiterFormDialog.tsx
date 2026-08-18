"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Recruiter } from "@prisma/client";
import { createRecruiterSchema, type CreateRecruiterInput } from "./schema";
import { useCreateRecruiter, useUpdateRecruiter } from "./hooks";
import { Dialog } from "@/features/ui/Dialog";
import { Button } from "@/features/ui/Button";

// Dates arrive as ISO strings over the wire; new Date() handles string|Date and
// slices to yyyy-mm-dd for <input type="date">. The resolver re-coerces on submit.
function toDefaults(recruiter?: Recruiter): Record<string, unknown> {
  if (!recruiter) return {};
  const day = (d: Date | string | null) =>
    d ? new Date(d).toISOString().slice(0, 10) : undefined;
  return {
    name: recruiter.name,
    company: recruiter.company ?? undefined,
    email: recruiter.email ?? undefined,
    phone: recruiter.phone ?? undefined,
    linkedinUrl: recruiter.linkedinUrl ?? undefined,
    notes: recruiter.notes ?? undefined,
    lastContact: day(recruiter.lastContact),
    nextFollowUp: day(recruiter.nextFollowUp),
  };
}

const inputCls =
  "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-accent";

export function RecruiterFormDialog({
  recruiter,
  onClose,
}: {
  recruiter?: Recruiter;
  onClose: () => void;
}) {
  const isEdit = !!recruiter;
  const create = useCreateRecruiter();
  const update = useUpdateRecruiter(recruiter?.id ?? "");
  const mutation = isEdit ? update : create;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateRecruiterInput>({
    resolver: zodResolver(createRecruiterSchema),
    defaultValues: toDefaults(recruiter) as Partial<CreateRecruiterInput>,
  });

  const onSubmit = handleSubmit((values) => {
    mutation.mutate(values, { onSuccess: onClose });
  });

  return (
    <Dialog
      open
      onClose={onClose}
      title={isEdit ? "Edit recruiter" : "New recruiter"}
    >
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name" error={errors.name?.message}>
            <input className={inputCls} {...register("name")} />
          </Field>
          <Field label="Company">
            <input className={inputCls} {...register("company")} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Email" error={errors.email?.message}>
            <input className={inputCls} placeholder="name@company.com" {...register("email")} />
          </Field>
          <Field label="Phone">
            <input className={inputCls} {...register("phone")} />
          </Field>
        </div>

        <Field label="LinkedIn URL" error={errors.linkedinUrl?.message}>
          <input className={inputCls} placeholder="https://linkedin.com/in/…" {...register("linkedinUrl")} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Last contact">
            <input type="date" className={inputCls} {...register("lastContact")} />
          </Field>
          <Field label="Next follow-up">
            <input type="date" className={inputCls} {...register("nextFollowUp")} />
          </Field>
        </div>

        <Field label="Conversation notes">
          <textarea rows={4} className={inputCls} {...register("notes")} />
        </Field>

        {mutation.isError && (
          <p className="text-sm text-red-400">Could not save. Please try again.</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : isEdit ? "Save changes" : "Add recruiter"}
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
