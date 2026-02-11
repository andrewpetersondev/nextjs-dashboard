import { z } from "zod";
import { toSchemaKeys } from "@/shared/forms/logic/inspectors/zod-schema.inspector";
import { EmailSchema } from "@/shared/validation/email/email.schema";
import { PasswordSchema } from "@/shared/validation/password/password.schema";

/**
 * Object schema for email/password credentials.
 *
 * Base for login/signup flows.
 */
type AuthCredentialsSchemaShape = Readonly<{
  email: typeof EmailSchema;
  password: typeof PasswordSchema;
}>;

export const AuthCredentialsSchema: z.ZodObject<AuthCredentialsSchemaShape> =
  z.strictObject({
    email: EmailSchema,
    password: PasswordSchema,
  });

/**
 * Object schema for login form.
 *
 * Alias of AuthCredentialsSchema.
 */
export const LoginFormSchema: typeof AuthCredentialsSchema =
  AuthCredentialsSchema;

/** The validated data used by the Workflow and Services */
export type LoginRequestDto = z.output<typeof LoginFormSchema>;

export const LOGIN_FIELDS_LIST: readonly (keyof LoginRequestDto & string)[] =
  toSchemaKeys(LoginFormSchema);
