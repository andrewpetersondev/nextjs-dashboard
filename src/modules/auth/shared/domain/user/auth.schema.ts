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

/** The raw input from the form (before Zod parsing) */
export type LoginInput = z.input<typeof LoginSchema>;

/** The raw input from the form (before Zod parsing) */
export type SignupInput = z.input<typeof SignupSchema>;

/** The validated data used by the Workflow and Services */
export type LoginData = z.output<typeof LoginSchema>;

/** The validated data used by the Workflow and Services */
export type SignupData = z.output<typeof SignupSchema>;

/** Field names for type-safe error handling in UI */
export type LoginField = keyof LoginData;

/** Field names for type-safe error handling in UI */
export type SignupField = keyof SignupData;

export const LOGIN_FIELDS_LIST = getSchemaKeys(LoginSchema);
export const SIGNUP_FIELDS_LIST = getSchemaKeys(SignupSchema);
