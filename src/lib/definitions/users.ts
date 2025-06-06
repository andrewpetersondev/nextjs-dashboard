import type { FormState } from "@/src/lib/definitions/form";
import { type ZodType, z as zod } from "@/src/lib/definitions/zod-alias";

// --- User Roles ---
export const USER_ROLES = ["admin", "user", "guest"] as const;
export type UserRole = (typeof USER_ROLES)[number];

// --- User Entity ---
export interface User {
	id: string;
	username: string;
	email: string;
	role: UserRole;
	password: string;
}

// --- Action Result Type ---
export type ActionResult = {
	message?: string;
	success: boolean;
};

// --- User Form Fields ---
export interface BaseUserFormFields {
	username: string;
	email: string;
	password: string;
	[key: string]: unknown; // Allow additional fields for flexibility
}

export interface CreateUserFormFields extends BaseUserFormFields {
	role: UserRole;
}

export type SignupFormFields = Omit<CreateUserFormFields, "role">;
export type LoginFormFields = Pick<BaseUserFormFields, "email" | "password">;
export type EditUserFormFields = Partial<CreateUserFormFields>;

// --- Form State Aliases (for clarity, but all use FormState<T>) ---
export type CreateUserFormState = FormState<CreateUserFormFields>;
export type SignupFormState = FormState<SignupFormFields>;
export type LoginFormState = FormState<LoginFormFields>;
export type EditUserFormState = FormState<EditUserFormFields>;

// --- Zod Schemas ---
export const BaseUserFormSchema = zod.object({
	username: zod
		.string()
		.min(2, { message: "Username must be at least two characters long." })
		.trim(),
	email: zod.string().email({ message: "Please enter a valid email." }).trim(),
	password: zod
		.string()
		.min(5, { message: "Be at least five characters long" })
		.regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
		.regex(/[0-9]/, { message: "Contain at least one number." })
		.trim(),
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

export const EditUserFormSchema: ZodType<EditUserFormFields> =
	BaseUserFormSchema.partial().extend({
		role: zod
			.enum(USER_ROLES, { invalid_type_error: "Please select a role" })
			.optional(),
	});
