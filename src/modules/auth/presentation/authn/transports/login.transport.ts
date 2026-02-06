import type { LoginRequestDto } from "@/modules/auth/presentation/authn/transports/login.form.schema";

/**
 * Field names of the login request, used for type-safe error mapping and form state management.
 */
export type LoginField = keyof LoginRequestDto;
