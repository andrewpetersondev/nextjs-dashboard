import { z } from "zod";
import {
  USERNAME_MAX_LENGTH,
  USERNAME_MAX_LENGTH_ERROR,
  USERNAME_MIN_LENGTH,
  USERNAME_MIN_LENGTH_ERROR,
} from "@/shared/validation/username-policy";

/**
 * Validate and normalize a username.
 *
 * Trims, enforces length, then lowercases.
 */
export const UsernameSchema = z
  .string()
  .min(USERNAME_MIN_LENGTH, {
    error: USERNAME_MIN_LENGTH_ERROR,
  })
  .max(USERNAME_MAX_LENGTH, {
    error: USERNAME_MAX_LENGTH_ERROR,
  })
  .trim()
  .toLowerCase();
