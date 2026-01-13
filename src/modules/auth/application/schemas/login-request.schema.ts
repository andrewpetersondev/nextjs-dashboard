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
export const LoginRequestSchema = AuthCredentialsSchema;

/**
 * Object schema for signup form.
 *
 * Extends credentials with normalized username.
 */
export const SignupRequestSchema = AuthCredentialsSchema.safeExtend({
  username: UsernameSchema,
});

/** The validated data used by the Workflow and Services */
export type LoginRequestDto = z.output<typeof LoginRequestSchema>;

/** The validated data used by the Workflow and Services */
export type SignupRequestDto = z.output<typeof SignupRequestSchema>;

export const LOGIN_FIELDS_LIST = toSchemaKeys(LoginRequestSchema);
export const SIGNUP_FIELDS_LIST = toSchemaKeys(SignupRequestSchema);
