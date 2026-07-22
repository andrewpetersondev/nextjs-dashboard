import { z } from "zod";
import { toSchemaKeys } from "@/shared/forms/logic/inspectors/zod-schema.inspector";
import { EmailSchema } from "@/shared/policies/email/email.schema";

/**
 * Object schema for a password-reset request.
 *
 * Email only: the flow deliberately collects nothing else (ADR 006).
 */
type ForgotPasswordSchemaShape = Readonly<{
	email: typeof EmailSchema;
}>;

export const ForgotPasswordFormSchema: z.ZodObject<ForgotPasswordSchemaShape> =
	z.strictObject({
		email: EmailSchema,
	});

/** The validated data used by the request-reset action. */
export type ForgotPasswordRequestDto = z.output<
	typeof ForgotPasswordFormSchema
>;

export const FORGOT_PASSWORD_FIELDS_LIST: readonly (keyof ForgotPasswordRequestDto &
	string)[] = toSchemaKeys(ForgotPasswordFormSchema);

/**
 * Fields safe to echo back in error metadata for repopulation after a
 * failed submit.
 */
export const FORGOT_PASSWORD_ECHO_FIELDS_LIST: readonly (keyof ForgotPasswordRequestDto &
	string)[] = ["email"];
