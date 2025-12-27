import type {
  AuthLoginSchemaDto,
  AuthSignupSchemaDto,
} from "@/modules/auth/shared/domain/user/auth-user.schema";
import type { FormAction } from "@/shared/forms/core/types/form-action.dto";

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
