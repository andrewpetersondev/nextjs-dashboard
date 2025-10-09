/**
 * Define auth form schemas and typed field lists.
 *
 * Centralizes Zod schemas for username, email, password, and form objects.
 * Field-name arrays are derived from schema shapes to keep UI and types in sync.
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

/**
 * Validate and normalize an email.
 *
 * Trims, validates RFC email, then lowercases.
 */
export const EmailSchema = z
  .string()
  .trim()
  .pipe(z.email({ error: EMAIL_ERROR }).toLowerCase());

/**
 * Validate a password with strength rules.
 *
 * Trims; enforces length and requires letter, number, and special char.
 */
export const PasswordSchema = z
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
 * Object schema for email/password credentials.
 *
 * Base for login/signup flows.
 */
export const AuthCredentialsSchema = z.strictObject({
  email: EmailSchema,
  password: PasswordSchema,
});

/**
 * Object schema for login form.
 *
 * Alias of AuthCredentialsSchema.
 */
export const LoginSchema = AuthCredentialsSchema;

/**
 * Object schema for signup form.
 *
 * Extends credentials with normalized username.
 */
export const SignupSchema = AuthCredentialsSchema.safeExtend({
  username: UsernameSchema,
});

// Derived types

/**
 * Pre-parse login input type.
 *
 * @deprecated Use z.input<typeof LoginSchema> inline; input may differ from output.
 */
export type LoginInput = z.input<typeof LoginSchema>;

/**
 * Pre-parse signup input type.
 *
 * @deprecated Use z.input<typeof SignupSchema> inline; input may differ from output.
 */
export type SignupInput = z.input<typeof SignupSchema>;

/** Post-parse login data type. */
export type LoginData = z.output<typeof LoginSchema>;

/** Post-parse signup data type. */
export type SignupData = z.output<typeof SignupSchema>;

/** Valid login field name union. */
export type LoginField = keyof LoginData;

/** Valid signup field name union. */
export type SignupField = keyof SignupData;

// Field Name Arrays

// Explicit, readonly field name lists; avoids unsafe `Object.keys(... as ...)`
export const SIGNUP_FIELDS_LIST = [
  "email",
  "password",
  "username",
] as const satisfies readonly SignupField[];

export const LOGIN_FIELDS_LIST = [
  "email",
  "password",
] as const satisfies readonly LoginField[];
