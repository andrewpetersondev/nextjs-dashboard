import { z as zod } from "zod"; // Use import alias for cleaner imports

// --- Types ---

/**
 * User entity type.
 */
export type User = {
	id: string;
	username: string;
	email: string;
	role: UserRole;
	password: string;
};

/**
 * Allowed user roles.
 */
export type UserRole = "admin" | "user" | "guest";

/**
 * State for create user form.
 */
export type CreateUserFormState =
	| {
			errors?: Partial<Record<keyof CreateUserFormFields, string[]>>;
			message?: string;
	  }
	| undefined;

/**
 * State for signup form.
 */
export type SignupFormState =
	| {
			errors?: Partial<Record<keyof SignupFormFields, string[]>>;
			message?: string;
	  }
	| undefined;

/**
 * State for login form.
 */
export type LoginFormState =
	| {
			errors?: Partial<Record<keyof LoginFormFields, string[]>>;
			message?: string;
	  }
	| undefined;

// --- Form Field Types ---

/**
 * Fields for create user form.
 */
export type CreateUserFormFields = {
	username: string;
	email: string;
	password: string;
	role: Exclude<UserRole, "guest">; // Only "admin" or "user"
};

/**
 * Fields for signup form.
 */
export type SignupFormFields = {
	username: string;
	email: string;
	password: string;
};

/**
 * Fields for login form.
 */
export type LoginFormFields = {
	email: string;
	password: string;
};

// --- Validation Schemas ---

/**
 * Zod schema for create user form validation.
 */
export const CreateUserFormSchema = zod.object({
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
		// .regex(/[^a-zA-Z0-9]/, { message: "Contain at least one special character." })
		.trim(),
	role: zod.enum(["admin", "user"], {
		invalid_type_error: "Please select a role",
	}),
});

/**
 * Zod schema for signup form validation.
 */
export const SignupFormSchema = zod.object({
	username: zod
		.string()
		.min(2, { message: "Username must be at least two characters long." })
		.trim(),
	email: zod.string().email({ message: "Please enter a valid email." }).trim(),
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
 * Zod schema for login form validation.
 */
export const LoginFormSchema = zod.object({
	email: zod.string().email({ message: "Please enter a valid email." }).trim(),
	password: zod.string().min(8, { message: "Password is required." }).trim(),
});
