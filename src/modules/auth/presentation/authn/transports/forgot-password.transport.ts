import type { ForgotPasswordRequestDto } from "@/modules/auth/presentation/authn/transports/forgot-password.form.schema";

/**
 * Field names of the password-reset request, used for type-safe error mapping
 * and form state management.
 */
export type ForgotPasswordField = keyof ForgotPasswordRequestDto;
