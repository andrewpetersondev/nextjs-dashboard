import { z } from "zod";
import { toSchemaKeys } from "@/shared/forms/logic/inspectors/zod-schema.inspector";
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
export type AuthLoginSchemaDto = z.output<typeof LoginSchema>;

/** The validated data used by the Workflow and Services */
export type AuthSignupSchemaDto = z.output<typeof SignupSchema>;

/** Field names for type-safe error handling in UI */
export type LoginField = keyof AuthLoginSchemaDto;

/** Field names for type-safe error handling in UI */
export type SignupField = keyof AuthSignupSchemaDto;

export const LOGIN_FIELDS_LIST = toSchemaKeys(LoginSchema);
export const SIGNUP_FIELDS_LIST = toSchemaKeys(SignupSchema);
