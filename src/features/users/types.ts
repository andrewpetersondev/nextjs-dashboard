import type { AuthRole } from "@/shared/auth/roles";

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
