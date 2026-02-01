import type { LoginRequestDto } from "@/modules/auth/application/auth-user/schemas/login-request.schema";

/**
 * Field names of the login request, used for type-safe error mapping and form state management.
 */
export type LoginField = keyof LoginRequestDto;
