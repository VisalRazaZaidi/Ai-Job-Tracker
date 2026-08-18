import { z } from "zod";

export const createResumeSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  content: z.string().trim().min(1, "Content is required"),
  // Set when saving an AI-tailored variant → the master it derives from.
  parentId: z.string().cuid().optional(),
});

export const updateResumeSchema = createResumeSchema.partial();

export type CreateResumeInput = z.infer<typeof createResumeSchema>;
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;
