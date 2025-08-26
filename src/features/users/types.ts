import type { AuthRole } from "@/shared/auth/roles";
import type { FormState } from "@/shared/forms/types";

// Form Fields
export type BaseUserFormFields = {
  readonly email: string;
  readonly password: string;
  readonly role: AuthRole;
  readonly username: string;
};

export type CreateUserFormFields = BaseUserFormFields;
export type EditUserFormFields = Partial<CreateUserFormFields>;

// Form Field Names
export type BaseUserFormFieldNames = keyof BaseUserFormFields;
export type CreateUserFormFieldNames = keyof CreateUserFormFields;
export type EditUserFormFieldNames = keyof EditUserFormFields;

// Form State (remove because prefer to use FormState<CreateUserFormFieldNames>)
export type CreateUserFormState = FormState<CreateUserFormFieldNames>;

// UI-facing shapes (e.g., UserListItem, UserFormValues)
