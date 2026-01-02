import type { z } from "zod";
import type {
  AuthLoginSchemaDto,
  AuthSignupSchemaDto,
  LoginSchema,
  SignupSchema,
} from "@/modules/auth/domain/schemas/auth-user.schema";
import type { FormAction } from "@/shared/forms/core/types/form-action.dto";

/** The raw input from the form (before Zod parsing) */
export type LoginTransport = z.input<typeof LoginSchema>;

/** The raw input from the form (before Zod parsing) */
export type SignupTransport = z.input<typeof SignupSchema>;

/** Field names for type-safe error handling in UI */
export type LoginField = keyof AuthLoginSchemaDto;
/** Field names for type-safe error handling in UI */
export type SignupField = keyof AuthSignupSchemaDto;

/**
 * Shared props for components requiring an auth form action.
 */
export interface AuthActionProps<T extends LoginField | SignupField> {
  action: FormAction<T, never>;
}
