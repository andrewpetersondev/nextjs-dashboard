import type { UserEntity } from "@/features/users/user.entity";
import type { FormState } from "@/shared/forms/types";

/** --- User Domain Types --- */

/**
 * List of allowed user roles.
 * @readonly
 */
export const USER_ROLES = ["admin", "user", "guest"] as const;

/**
 * Union type for user roles.
 * @example
 * const role: UserRole = "admin";
 */
export type UserRole = (typeof USER_ROLES)[number];

// Define allowed user field names as a union
export const USER_FIELD_NAMES = [
  "username",
  "email",
  "password",
  "role",
] as const;

export type UserFieldName = (typeof USER_FIELD_NAMES)[number];

// Map field names to error arrays
export type UserErrorMap = Partial<Record<UserFieldName, string[]>>;

// Define the state returned by user actions
export type UserCreateState = Readonly<{
  errors?: UserErrorMap;
  message: string;
  success: boolean;
}>;

/**
 * Patch type for updating user entities.
 * All fields are optional for PATCH semantics.
 */
export type UserUpdatePatch = Partial<
  Pick<UserEntity, "username" | "email" | "role" | "password">
>;

/**
 * --- Form Field Types ---
 * These are kept here for user-specific forms.
 */

/**
 * Fields required for user login and signup forms.
 */
export type BaseUserFormFields = {
  email: string;
  password: string;
};

/**
 * Fields for login form.
 */
export type LoginFormFields = BaseUserFormFields;

/**
 * Fields for signup form (username required).
 */
export type SignupFormFields = BaseUserFormFields & {
  username: string;
};

/**
 * Fields for admin user creation.
 */
export type CreateUserFormFields = SignupFormFields & {
  role: UserRole;
};

/**
 * Fields for editing a user (all optional).
 */
export type EditUserFormFields = Partial<{
  username: string;
  email: string;
  password: string;
  role: UserRole;
}>;

/**
 * --- Form Field Name Unions ---
 * Used for type-safe access to form fields and errors.
 */
export type SignupFormFieldNames = keyof SignupFormFields;
export type LoginFormFieldNames = keyof LoginFormFields;
export type CreateUserFormFieldNames = keyof CreateUserFormFields;
export type EditUserFormFieldNames = keyof EditUserFormFields;

/**
 * --- Form State Aliases ---
 * Use generic FormState<TFieldNames> for all form state types.
 */
// export type SignupFormState = FormState<SignupFormFieldNames>;
// export type _LoginFormState = FormState<LoginFormFieldNames>; // Internal use
export type CreateUserFormState = FormState<CreateUserFormFieldNames>;
// export type _EditUserFormState = FormState<EditUserFormFieldNames>; // Internal use
