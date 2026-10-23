import { z } from "zod";

export const passwordRule = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(72, "Use 72 characters or fewer")
  .refine((v) => /[A-Za-z]/.test(v), "Include at least one letter")
  .refine((v) => /\d/.test(v), "Include at least one number");
