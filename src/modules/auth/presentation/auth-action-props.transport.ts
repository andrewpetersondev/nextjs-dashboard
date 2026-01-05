import type { LoginField } from "@/modules/auth/presentation/login.transport";
import type { SignupField } from "@/modules/auth/presentation/signup.transport";
import type { FormAction } from "@/shared/forms/core/types/form-action.dto";

/**
 * Shared props for components requiring an auth form action.
 */
export interface AuthActionProps<T extends LoginField | SignupField> {
  action: FormAction<T, never>;
}
