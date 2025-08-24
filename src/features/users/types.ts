import type { SignupFormFields } from "@/features/auth/types";
import type { AuthRole } from "@/shared/auth/roles";
import type { FormState } from "@/shared/forms/types";

export type CreateUserFormFields = SignupFormFields & {
  role: AuthRole;
};

export type EditUserFormFields = Partial<{
  username: string;
  email: string;
  password: string;
  role: AuthRole;
}>;

export type CreateUserFormFieldNames = keyof CreateUserFormFields;
export type EditUserFormFieldNames = keyof EditUserFormFields;

export type CreateUserFormState = FormState<CreateUserFormFieldNames>;

// UI-facing shapes (e.g., UserListItem, UserFormValues)
