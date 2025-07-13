import * as z from "zod";
import type { UserEntity } from "@/db/models/user.entity";
import type { FormState } from "@/lib/definitions/form.types";

/**
 * --- Domain Types ---
 */

export const USER_ROLES = ["admin", "user", "guest"] as const;

export type UserRole = (typeof USER_ROLES)[number];

/**
 * --- Form Field Types ---
 */

/**
 * Base fields for user forms.
 * All fields are required strings.
 */
export type BaseUserFormFields = {
  username: string;
  email: string;
  password: string;
};

/**
 * Fields for creating a user (admin).
 */
export type CreateUserFormFields = BaseUserFormFields & {
  role: UserRole;
};

/**
 * Fields for a signup form (no role).
 */
export type SignupFormFields = Omit<CreateUserFormFields, "role">;

/**
 * Fields for a login form.
 */
export type LoginFormFields = Pick<BaseUserFormFields, "email" | "password">;

/**
 * Fields for editing a user (all optional for PATCH semantics).
 * All fields are optional strings, except role which is optional UserRole.
 */
export type EditUserFormFields = Partial<{
  username: string;
  email: string;
  password: string;
  role: UserRole;
}>;

// --- Patch Type for Updates ---

export type UserUpdatePatch = Partial<
  Pick<UserEntity, "username" | "email" | "role" | "password">
>;

// --- Field Name Unions ---

export type SignupFormFieldNames = keyof SignupFormFields;
export type LoginFormFieldNames = keyof LoginFormFields;
export type CreateUserFormFieldNames = keyof CreateUserFormFields;
export type EditUserFormFieldNames = keyof EditUserFormFields;

// --- Form State Aliases (use generic FormState<TFieldNames>) ---
/**
 * Use generic FormState<TFieldNames> for all form state types.
 * This ensures maintainability and DRY code.
 */
export type _SignupFormState = FormState<SignupFormFieldNames>;
export type _LoginFormState = FormState<LoginFormFieldNames>;
export type CreateUserFormState = FormState<CreateUserFormFieldNames>;
export type _EditUserFormState = FormState<EditUserFormFieldNames>;

// --- Error Types ---

export type _UserErrorMap = Partial<
  Record<keyof CreateUserFormFields, string[]>
>;
export type _UserFormErrors = Partial<
  Record<keyof CreateUserFormFields, string[]>
>;

// --- Action Result ---

export type ActionResult = {
  readonly message?: string;
  readonly success: boolean;
  readonly errors?: Record<string, string[]>;
};

// --- Zod Schemas ---

// --- Field Validation Schemas ---
export const usernameSchema = z
  .string()
  .min(3, { error: "Username must be at least three characters long." })
  .max(20, { error: "Username cannot exceed 20 characters." })
  .trim();

export const emailSchema = z
  .email({ error: "Please enter a valid email address." })
  .trim();

export const roleSchema = z.enum(USER_ROLES, {
  error: (issue) =>
    issue.input === undefined ? "Role is required." : "Invalid user role.",
});

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

// --- Form Validation Schemas ---

export const BaseUserFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema,
});

export const CreateUserFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  role: roleSchema,
  username: usernameSchema,
});

export const SignupFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema,
});

export const LoginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const EditUserFormSchema = z.object({
  email: emailSchema.optional(),
  password: passwordSchema.optional(),
  role: roleSchema.optional(),
  username: usernameSchema.optional(),
});
