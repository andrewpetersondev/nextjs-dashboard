import "server-only";

import type { UserRole } from "@/features/users/types";
import type { UserEntity } from "@/server/users/entity";
import type { FormState } from "@/shared/forms/types";

export type UserUpdatePatch = Partial<
  Pick<UserEntity, "username" | "email" | "role" | "password">
>;

export type BaseUserFormFields = {
  email: string;
  password: string;
};

export type LoginFormFields = BaseUserFormFields;

export type SignupFormFields = BaseUserFormFields & {
  username: string;
};

export type CreateUserFormFields = SignupFormFields & {
  role: UserRole;
};

export type EditUserFormFields = Partial<{
  username: string;
  email: string;
  password: string;
  role: UserRole;
}>;

export type SignupFormFieldNames = keyof SignupFormFields;
export type LoginFormFieldNames = keyof LoginFormFields;
export type CreateUserFormFieldNames = keyof CreateUserFormFields;
export type EditUserFormFieldNames = keyof EditUserFormFields;

export type CreateUserFormState = FormState<CreateUserFormFieldNames>;
