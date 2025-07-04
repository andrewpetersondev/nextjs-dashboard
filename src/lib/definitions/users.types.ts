import { type ZodType, z as zod } from "zod";
import type { UserEntity } from "@/src/lib/db/entities/user";
import type { FormState } from "@/src/lib/definitions/form";

// ---ids and roles: domain types---
/**
 * Branded type for User IDs.
 */
export type UserId = string & { readonly __brand: unique symbol };
/**
 * User roles as a constant tuple for type safety.
 */
export const USER_ROLES = ["admin", "user", "guest"] as const;
/**
 * Type for user roles.
 */
export type UserRole = (typeof USER_ROLES)[number];
/**
 * Error map for user actions.
 * @remarks Confirm if CreateUserFormFields is the correct type for user errors.
 */
export type UserErrorMap = Partial<
	Record<keyof CreateUserFormFields, string[]>
>;

// --- UI and Server Actions: Form Types ---
/**
 * Standardized result for server actions.
 */
export type ActionResult = {
	readonly message?: string;
	readonly success: boolean;
	readonly errors?: Record<string, string[]>;
};
/**
 * Base fields for user forms.
 * Allows additional dynamic fields for extensibility.
 */
export interface BaseUserFormFields {
	username: string;
	email: string;
	password: string;
	[key: string]: unknown; // Allow additional fields for flexibility
}
/**
 * Fields for creating a user (admin).
 */
export interface CreateUserFormFields extends BaseUserFormFields {
	role: UserRole;
}
/**
 *Error type for all user forms
 */
export type UserFormErrors = Partial<
	Record<keyof CreateUserFormFields, string[]>
>;
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
 */
export type EditUserFormFields = Partial<CreateUserFormFields>;
/**
 * Generic form state
 */
export type UserFormState<T> = {
	errors?: UserFormErrors;
	message?: string;
	success?: boolean;
	data?: T;
};
/**
 * Patch type for updates to a user.
 */
export type UserUpdatePatch = Partial<
	Pick<UserEntity, "username" | "email" | "role" | "password">
>;
// --- Form State Aliases (for clarity, but all use FormState<T>) ---
export type SignupFormState = FormState<SignupFormFields>;
export type LoginFormState = FormState<LoginFormFields>;
export type CreateUserFormState = FormState<CreateUserFormFields>;
export type EditUserFormState = FormState<EditUserFormFields>;

/* ============================================================================
 * Database Row Types
 * ========================================================================== */
export interface UserRowBase<
	Id extends string = string,
	RoleType extends string = string,
> {
	id: Id;
	username: string;
	email: string;
	role: RoleType;
	password: string; // Hashed password
	sensitiveData?: string; // Optional sensitive data field
}

/* ============================================================================
 * Field Schemas (zod)
 * ========================================================================== */
/**
 * Username: 3-32 chars, trimmed, required.
 */
export const usernameSchema = zod
	.string()
	.min(3, { message: "Username must be at least three characters long." })
	.max(32, { message: "Username cannot exceed 32 characters." })
	.trim();
/**
 * Email: valid RFC 5322 address, trimmed, required.
 */
export const emailSchema = zod
	.string()
	.email({ message: "Please enter a valid email address." })
	.trim();
/**
 * Password: 5-32 chars, at least one letter, number, and special character.
 */
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

/* ============================================================================
 * Composite Form Schemas
 * ========================================================================== */
/**
 * Shared base object for forms accepting username/email/password.
 */
export const BaseUserFormSchema = zod.object({
	email: emailSchema,
	password: passwordSchema,
	username: usernameSchema,
});
/**
 * Role: enum of allowed roles (required).
 */
export const roleSchema = zod.enum(USER_ROLES, {
	invalid_type_error: "Invalid user role.",
	required_error: "Role is required.",
});
/**
 * Used for an admin panel create-user form.
 */
export const CreateUserFormSchema: ZodType<CreateUserFormFields> =
	BaseUserFormSchema.extend({
		role: zod.enum(USER_ROLES, { invalid_type_error: "Please select a role" }),
	});
/**
 * Used for end-user sign-up registration.
 */
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
/**
 * Used for login forms (credentials only).
 */
export const LoginFormSchema: ZodType<LoginFormFields> = zod.object({
	email: BaseUserFormSchema.shape.email,
	password: zod.string().min(8, { message: "Password is required." }).trim(),
});
/**
 * Used for profile and user admin edit forms.
 * All fields are optional for PATCH semantics.
 */
export const EditUserFormSchema: ZodType<EditUserFormFields> = zod.object({
	email: emailSchema.optional(),
	password: passwordSchema.optional(),
	role: roleSchema.optional(),
	username: usernameSchema.optional(),
});
