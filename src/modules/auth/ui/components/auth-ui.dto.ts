import type { LoginField } from "@/modules/auth/shared/domain/user/auth.schema";
import type { FormAction } from "@/shared/forms/types/form-action.dto";

/**
 * Shared props for components requiring a login form action.
 */
export interface AuthActionProps {
  action: FormAction<LoginField>;
}
