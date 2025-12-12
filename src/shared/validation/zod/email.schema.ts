import { z } from "zod";
import { EMAIL_ERROR } from "@/shared/validation/email-policy";

/**
 * Validate and normalize an email.
 *
 * Trims, validates RFC email, then lowercases.
 */
export const EmailSchema = z
  .string()
  .trim()
  .pipe(z.email({ error: EMAIL_ERROR }).toLowerCase());
