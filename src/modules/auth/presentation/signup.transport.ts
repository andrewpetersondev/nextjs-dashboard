import type { SignupRequestDto } from "@/modules/auth/application/schemas/login-request.schema";

/** Field names for type-safe error handling in UI */
export type SignupField = keyof SignupRequestDto;
