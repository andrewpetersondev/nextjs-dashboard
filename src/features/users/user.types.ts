import { type ZodType, z as zod } from "zod";
import type { UserEntity } from "@/db/entities/user.entity";
import type { FormState } from "@/lib/definitions/form.types";

// --- Domain Types ---

export const USER_ROLES = ["admin", "user", "guest"] as const;
export type UserRole = (typeof USER_ROLES)[number];

// --- Form Field Types ---

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
export type SignupFormState = FormState<SignupFormFieldNames>;
export type LoginFormState = FormState<LoginFormFieldNames>;
export type CreateUserFormState = FormState<CreateUserFormFieldNames>;
export type EditUserFormState = FormState<EditUserFormFieldNames>;

// --- Error Types ---

export type UserErrorMap = Partial<
  Record<keyof CreateUserFormFields, string[]>
>;
export type UserFormErrors = Partial<
  Record<keyof CreateUserFormFields, string[]>
>;

// --- Action Result ---

export type ActionResult = {
  readonly message?: string;
  readonly success: boolean;
  readonly errors?: Record<string, string[]>;
};

// --- Zod Schemas (unchanged, but ensure types match above) ---

export const usernameSchema = zod
  .string()
  .min(3, { message: "Username must be at least three characters long." })
  .max(32, { message: "Username cannot exceed 32 characters." })
  .trim();

export const emailSchema = zod
  .string()
  .email({ message: "Please enter a valid email address." })
  .trim();

export const passwordSchema = zod
  .string()
  .min(5, { message: "Password must be at least 5 characters long." })
  .max(32, { message: "Password cannot exceed 32 characters." })
  .regex(/[a-zA-Z]/, { message: "Password must contain a letter." })
  .regex(/[0-9]/, { message: "Password must contain a number." })
  .regex(/[^a-zA-Z0-9]/, {
    message: "Password must contain a special character.",
  })
  .trim();

export const BaseUserFormSchema = zod.object({
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema,
});

export const roleSchema = zod.enum(USER_ROLES, {
  invalid_type_error: "Invalid user role.",
  required_error: "Role is required.",
});

export const CreateUserFormSchema: ZodType<CreateUserFormFields> =
  BaseUserFormSchema.extend({
    role: zod.enum(USER_ROLES, { invalid_type_error: "Please select a role" }),
  });

export const SignupFormSchema: ZodType<SignupFormFields> =
  BaseUserFormSchema.extend({
    password: zod
      .string()
      .min(8, { message: "Be at least eight characters long" })
      .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
      .regex(/[0-9]/, { message: "Contain at least one number." })
      .regex(/[^a-zA-Z0-9]/, {
        message: "Contain at least one special character.",
      })
      .trim(),
  });

export const LoginFormSchema: ZodType<LoginFormFields> = zod.object({
  email: BaseUserFormSchema.shape.email,
  password: zod.string().min(8, { message: "Password is required." }).trim(),
});

export const EditUserFormSchema = zod.object({
  email: emailSchema.optional(),
  password: passwordSchema.optional(),
  role: roleSchema.optional(),
  username: usernameSchema.optional(),
});
