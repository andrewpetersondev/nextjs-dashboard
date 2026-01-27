import type { SignupRequestDto } from "@/modules/auth/application/schemas/login-request.schema";

/**
 * Field names of the signup request, used for type-safe error mapping and form state management.
 */
export type SignupField = keyof SignupRequestDto;
