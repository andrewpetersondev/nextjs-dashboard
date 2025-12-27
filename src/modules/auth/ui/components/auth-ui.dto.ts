import type {
  LoginField,
  SignupField,
} from "@/modules/auth/shared/domain/user/auth-user.schema";
import type { FormAction } from "@/shared/forms/core/types/form-action.dto";

/**
 * Shared props for components requiring an auth form action.
 */
export interface AuthActionProps<T extends LoginField | SignupField> {
  action: FormAction<T, never>;
}
