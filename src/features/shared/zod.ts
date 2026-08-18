import { z } from "zod";

// Empty form inputs arrive as "" — normalize to undefined so .optional() applies
// and blank fields never trip validation. Shared across feature schemas.

export const optionalString = z
  .string()
  .trim()
  .transform((v) => (v === "" ? undefined : v))
  .optional();

export const optionalDate = z.preprocess(
  (v) => (v === "" || v === null ? undefined : v),
  z.coerce.date().optional()
);

export const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess((v) => (v === "" || v === null ? undefined : v), z.enum(values).optional());
