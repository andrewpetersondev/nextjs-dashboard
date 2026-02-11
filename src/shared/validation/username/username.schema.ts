import { z } from "zod";
import { normalizeUsername } from "@/shared/validation/username/normalize.username";
import {
  USERNAME_MAX_LENGTH,
  USERNAME_MAX_LENGTH_ERROR,
  USERNAME_MIN_LENGTH,
  USERNAME_MIN_LENGTH_ERROR,
} from "@/shared/validation/username/username-policy";

/**
 * Validate and normalize a username.
 *
 * Normalizes first (trim + lowercase), then enforces policy on the canonical value.
 */
// biome-ignore lint/nursery/useExplicitType: <fix later>
export const UsernameSchema = z
  .string()
  .transform(normalizeUsername)
  .pipe(
    z
      .string()
      .min(USERNAME_MIN_LENGTH, {
        error: USERNAME_MIN_LENGTH_ERROR,
      })
      .max(USERNAME_MAX_LENGTH, {
        error: USERNAME_MAX_LENGTH_ERROR,
      }),
  );
