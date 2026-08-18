import { z } from "zod";
import { optionalString, optionalDate } from "@/features/shared/zod";

export const createRecruiterSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  company: optionalString,
  email: z.string().trim().email("Must be a valid email").optional().or(z.literal("")),
  phone: optionalString,
  linkedinUrl: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")),
  notes: optionalString,
  lastContact: optionalDate,
  nextFollowUp: optionalDate,
});

export const updateRecruiterSchema = createRecruiterSchema.partial();

export type CreateRecruiterInput = z.infer<typeof createRecruiterSchema>;
export type UpdateRecruiterInput = z.infer<typeof updateRecruiterSchema>;
