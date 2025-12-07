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
} from "@/modules/auth/domain/auth.constants";
import { getSchemaKeys } from "@/shared/forms/utilities/get-schema-keys";

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

/** Post-parse login data type. */
export type LoginData = z.output<typeof LoginSchema>;

/** Post-parse signup data type. */
export type SignupData = z.output<typeof SignupSchema>;

/** Valid login field name union. */
export type LoginField = keyof LoginData;

/** Valid signup field name union. */
export type SignupField = keyof SignupData;

// --- Auto-synced, immutable field name lists ---

export const LOGIN_FIELDS_LIST = getSchemaKeys(LoginSchema);
export const SIGNUP_FIELDS_LIST = getSchemaKeys(SignupSchema);
