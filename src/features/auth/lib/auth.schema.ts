/**
 * @file Auth form validation schemas and derived types.
 *
 * Centralizes Zod schemas for username, email, and password along with
 * form-level schemas used by login and signup flows. Also exposes typed,
 * runtime-safe field name lists for UI layers.
 *
 * Design notes:
 * - Schemas reuse shared constants for limits, messages, and regex rules.
 * - Username/email are normalized to lower-case; password is trimmed only.
 * - UI-facing field name arrays are derived from schema shapes to eliminate
 *   scattered string literals and keep types in sync with validation.
 */

import { z } from "zod";
import {
  EMAIL_ERROR,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MAX_LENGTH_ERROR,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_LENGTH_ERROR,
  PASSWORD_RULE_REGEX_CONTAIN_LETTER,
  PASSWORD_RULE_REGEX_CONTAIN_NUMBER,
  PASSWORD_RULE_REGEX_CONTAIN_SPECIAL_CHARACTER,
  PASSWORD_RULE_REGEX_ERROR_LETTER,
  PASSWORD_RULE_REGEX_ERROR_NUMBER,
  PASSWORD_RULE_REGEX_ERROR_SPECIAL_CHARACTER,
  USERNAME_MAX_LENGTH,
  USERNAME_MAX_LENGTH_ERROR,
  USERNAME_MIN_LENGTH,
  USERNAME_MIN_LENGTH_ERROR,
} from "@/features/auth/lib/auth.constants";

/**
 * Username validation and normalization.
 *
 * - Trims surrounding whitespace.
 * - Enforces minimum and maximum length constraints.
 * - Normalizes to lower-case to ensure case-insensitive uniqueness.
 */
export const usernameSchema = z
  .string()
  .min(USERNAME_MIN_LENGTH, {
    error: USERNAME_MIN_LENGTH_ERROR,
  })
  .max(USERNAME_MAX_LENGTH, {
    error: USERNAME_MAX_LENGTH_ERROR,
  })
  .trim()
  .toLowerCase();

/**
 * Email validation and normalization.
 *
 * - Trims surrounding whitespace.
 * - Validates RFC-compliant email format with a shared error message.
 * - Normalizes to lower-case since email local-part handling is typically
 *   case-insensitive in most systems.
 */
export const emailSchema = z
  .string()
  .trim()
  .pipe(z.email({ error: EMAIL_ERROR }).toLowerCase());

/**
 * Password validation.
 *
 * - Trims surrounding whitespace (no lower-casing to preserve entropy).
 * - Enforces length bounds.
 * - Requires at least one letter, one number, and one special character via regex rules.
 */
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, {
    error: PASSWORD_MIN_LENGTH_ERROR,
  })
  .max(PASSWORD_MAX_LENGTH, {
    error: PASSWORD_MAX_LENGTH_ERROR,
  })
  .regex(PASSWORD_RULE_REGEX_CONTAIN_LETTER, {
    error: PASSWORD_RULE_REGEX_ERROR_LETTER,
  })
  .regex(PASSWORD_RULE_REGEX_CONTAIN_NUMBER, {
    error: PASSWORD_RULE_REGEX_ERROR_NUMBER,
  })
  .regex(PASSWORD_RULE_REGEX_CONTAIN_SPECIAL_CHARACTER, {
    error: PASSWORD_RULE_REGEX_ERROR_SPECIAL_CHARACTER,
  })
  .trim();

/**
 * Base schema for authentication forms that include email and password.
 * Extend this for flows that require additional fields (e.g., username).
 *
 * TODO: refactor to use z.strictObject() because it throws an error if there are extra fields
 */
export const AuthFormBaseSchema = z.object({
  email: emailSchema, // validated + normalized email
  password: passwordSchema, // validated password with strength rules
});

/**
 * Login form schema.
 * Reuses the base email/password requirements.
 */
export const LoginFormSchema = AuthFormBaseSchema;

/**
 * Signup form schema.
 * Extends the base with a normalized username.
 */
export const SignupFormSchema = AuthFormBaseSchema.extend({
  username: usernameSchema,
});

// UI/view-model types derived from the shared schema

/** Input type for login forms (pre-parse). */
export type LoginFormInput = z.input<typeof LoginFormSchema>;
/** Union of valid login form field names. */
export type LoginFormFieldNames = keyof LoginFormInput;
/** Input type for signup forms (pre-parse). */
export type SignupFormInput = z.input<typeof SignupFormSchema>;
/** Union of valid signup form field names. */
export type SignupFormFieldNames = keyof SignupFormInput;
/**
 * Output type for login forms (post-parse).
 */
export type LoginFormOutput = z.output<typeof LoginFormSchema>;
/**
 * Output type for signup forms (post-parse).
 */
export type SignupFormOutput = z.output<typeof SignupFormSchema>;

/**
 * Runtime list of signup field names derived from schema shape.
 * Keeps UI in sync with schema without duplicating string literals.
 */
export const SIGNUP_FIELDS = Object.keys(
  SignupFormSchema.shape,
) as readonly SignupFormFieldNames[];

/**
 * Runtime list of login field names derived from schema shape.
 * Keeps UI in sync with schema without duplicating string literals.
 */
export const LOGIN_FIELDS = Object.keys(
  LoginFormSchema.shape,
) as readonly LoginFormFieldNames[];
