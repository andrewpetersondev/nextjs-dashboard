import type { SignupRequestDto } from "@/modules/auth/application/auth-user/schemas/signup-request.schema";

/**
 * Field names of the signup request, used for type-safe error mapping and form state management.
 */
export type SignupField = keyof SignupRequestDto;
