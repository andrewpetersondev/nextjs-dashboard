import type { z } from "zod";
import { AuthCredentialsSchema } from "@/modules/auth/presentation/authn/transports/login.form.schema";
import { toSchemaKeys } from "@/shared/forms/logic/inspectors/zod-schema.inspector";
import { UsernameSchema } from "@/shared/validation/username/username.schema";

/**
 * Object schema for signup form.
 *
 * Extends credentials with normalized username.
 */
// biome-ignore lint/nursery/useExplicitType: fix later
export const SignupFormSchema = AuthCredentialsSchema.safeExtend({
  username: UsernameSchema,
});

/** The validated data used by the Workflow and Services */
export type SignupRequestDto = z.output<typeof SignupFormSchema>;

// biome-ignore lint/nursery/useExplicitType: fix later
export const SIGNUP_FIELDS_LIST = toSchemaKeys(SignupFormSchema);
