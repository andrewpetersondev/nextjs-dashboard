import type { z } from "zod";
import type {
  LoginSchema,
  SignupSchema,
} from "@/modules/auth/domain/schemas/auth-user.schema";
import type { LoginField } from "@/modules/auth/presentation/login.transport";
import type { SignupField } from "@/modules/auth/presentation/signup.transport";
import type { FormAction } from "@/shared/forms/core/types/form-action.dto";

/** The raw input from the form (before Zod parsing) */
export type LoginTransport = z.input<typeof LoginSchema>;
/** The raw input from the form (before Zod parsing) */
export type SignupTransport = z.input<typeof SignupSchema>;

/**
 * Shared props for components requiring an auth form action.
 */
export interface AuthActionProps<T extends LoginField | SignupField> {
  action: FormAction<T, never>;
}
