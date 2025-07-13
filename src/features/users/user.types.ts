import * as z from "zod";
import type { UserEntity } from "@/db/models/user.entity";
import type { FormState } from "@/lib/forms/form.types";

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
export type SignupFormState = FormState<SignupFormFieldNames>;
export type _LoginFormState = FormState<LoginFormFieldNames>; // Internal use
export type CreateUserFormState = FormState<CreateUserFormFieldNames>;
export type _EditUserFormState = FormState<EditUserFormFieldNames>; // Internal use

/**
 * --- Error Types ---
 * Internal error map types for user forms.
 */
export type _UserErrorMap = Partial<
  Record<keyof CreateUserFormFields, string[]>
>;
export type _UserFormErrors = Partial<
  Record<keyof CreateUserFormFields, string[]>
>;

/**
 * --- Action Result Type ---
 * Standardized result for server actions.
 */
export type ActionResult<TData = unknown> = {
  readonly message: string;
  readonly success: boolean;
  readonly errors: Record<string, string[]>;
  readonly data?: TData;
};

/**
 * --- Zod Schemas for User Forms ---
 * Used for validation and type inference.
 */

/**
 * Username validation schema.
 */
export const usernameSchema = z
  .string()
  .min(3, { error: "Username must be at least three characters long." })
  .max(20, { error: "Username cannot exceed 20 characters." })
  .trim();

/**
 * Email validation schema.
 */
export const emailSchema = z
  .email({ error: "Please enter a valid email address." })
  .trim();

/**
 * User role validation schema.
 */
export const roleSchema = z.enum(USER_ROLES, {
  error: (issue) =>
    issue.input === undefined ? "Role is required." : "Invalid user role.",
});

/**
 * Password validation schema.
 */
export const passwordSchema = z
  .string()
  .min(5, { error: "Password must be at least 5 characters long." })
  .max(32, { error: "Password cannot exceed 32 characters." })
  .regex(/[a-zA-Z]/, { error: "Password must contain a letter." })
  .regex(/[0-9]/, { error: "Password must contain a number." })
  .regex(/[^a-zA-Z0-9]/, {
    error: "Password must contain a special character.",
  })
  .trim();

/**
 * Validation schema for creating a user (admin).
 */
export const CreateUserFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  role: roleSchema,
  username: usernameSchema,
});

/**
 * Validation schema for user signup.
 */
export const SignupFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema,
});

/**
 * Validation schema for user login.
 */
export const LoginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/**
 * Validation schema for editing a user.
 */
export const EditUserFormSchema = z.object({
  email: emailSchema.optional(),
  password: passwordSchema.optional(),
  role: roleSchema.optional(),
  username: usernameSchema.optional(),
});
