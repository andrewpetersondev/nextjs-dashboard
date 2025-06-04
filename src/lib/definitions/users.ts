import { z as zod } from "zod";

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

// --- Form State Types ---

/**
 * Generic form state type for forms with fields of type TFields.
 */
type FormState<TFields> =
	| {
			errors?: Partial<Record<keyof TFields, string[]>>;
			message?: string;
	  }
	| undefined;

/**
 * State for create user form.
 */
export type CreateUserFormState = FormState<CreateUserFormFields>;

/**
 * State for signup form.
 */
export type SignupFormState = FormState<SignupFormFields>;
/**
 * State for login form.
 */
export type LoginFormState = FormState<LoginFormFields>;

/**
 * State for edit form.
 */
export type EditUserFormState = FormState<EditUserFormFields>;

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

/**
 * Fields for edit user form.
 */
export type EditUserFormFields = {
	username?: string;
	email?: string;
	password?: string;
	role?: UserRole;
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

/**
 * Zod schema for edit user form validation.
 */
export const EditUserFormSchema = zod.object({
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
	role: zod.enum(["admin", "user", "guest"], {
		invalid_type_error: "Please select a role",
	}),
});
