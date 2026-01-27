import { z } from "zod";
import { toSchemaKeys } from "@/shared/forms/logic/inspectors/zod-schema.inspector";
import { EmailSchema } from "@/shared/validation/zod/email.schema";
import { PasswordSchema } from "@/shared/validation/zod/password.schema";

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

/** The validated data used by the Workflow and Services */
export type LoginRequestDto = z.output<typeof LoginRequestSchema>;

export const LOGIN_FIELDS_LIST = toSchemaKeys(LoginRequestSchema);
