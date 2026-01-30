import type { LoginField } from "@/modules/auth/presentation/authn/transports/login.transport";
import type { SignupField } from "@/modules/auth/presentation/authn/transports/signup.transport";
import type { FormAction } from "@/shared/forms/core/types/form-action.dto";

/**
 * Shared properties for UI components that require an authentication-related form action.
 *
 * @template T - The type of form fields, either {@link LoginField} or {@link SignupField}.
 */
export interface AuthActionProps<T extends LoginField | SignupField> {
  /**
   * The server action to be executed upon form submission.
   */
  action: FormAction<T, never>;
}
