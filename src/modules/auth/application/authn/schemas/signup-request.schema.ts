import type { z } from "zod";
import { AuthCredentialsSchema } from "@/modules/auth/application/authn/schemas/login-request.schema";
import { toSchemaKeys } from "@/shared/forms/logic/inspectors/zod-schema.inspector";
import { UsernameSchema } from "@/shared/validation/zod/username.schema";

/**
 * Object schema for signup form.
 *
 * Extends credentials with normalized username.
 */
export const SignupRequestSchema = AuthCredentialsSchema.safeExtend({
  username: UsernameSchema,
});

/** The validated data used by the Workflow and Services */
export type SignupRequestDto = z.output<typeof SignupRequestSchema>;

export const SIGNUP_FIELDS_LIST = toSchemaKeys(SignupRequestSchema);
