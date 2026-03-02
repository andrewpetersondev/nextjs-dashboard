import { z } from "zod";
import {
  EMAIL_ERROR,
  EMAIL_MAX_LENGTH,
  EMAIL_MAX_LENGTH_ERROR,
} from "@/shared/policies/email/email-policy";
import { normalizeEmail } from "@/shared/policies/email/normalize.email";

/**
 * Validate and normalize an email.
 *
 * Normalizes first (trim + lowercase), then validates the canonical value.
 */
// biome-ignore lint/nursery/useExplicitType: <fix later>
export const EmailSchema = z
  .string()
  .transform(normalizeEmail)
  .pipe(
    z
      .string()
      .max(EMAIL_MAX_LENGTH, { error: EMAIL_MAX_LENGTH_ERROR })
      .email({ error: EMAIL_ERROR }),
  );
