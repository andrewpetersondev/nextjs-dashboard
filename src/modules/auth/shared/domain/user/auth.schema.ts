import { z } from "zod";
import { getSchemaKeys } from "@/shared/forms/utilities/get-schema-keys";
import { EmailSchema } from "@/shared/validation/zod/email.schema";
import { PasswordSchema } from "@/shared/validation/zod/password.schema";
import { UsernameSchema } from "@/shared/validation/zod/username.schema";

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

export type LoginInput = z.input<typeof LoginSchema>;
export type SignupInput = z.input<typeof SignupSchema>;

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
