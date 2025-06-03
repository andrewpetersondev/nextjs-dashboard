import { z } from "zod";

export type User = {
	id: string;
	username: string;
	email: string;
	password: string;
};

export type CreateUserFormState =
	| {
			errors?: {
				username?: string[];
				email?: string[];
				password?: string[];
				role?: string[];
			};
			message?: string;
	  }
	| undefined;

export const CreateUserFormSchema = z.object({
	username: z
		.string()
		.min(2, { message: "Username must be at least two characters long." })
		.trim(),
	email: z.string().email({ message: "Please enter a valid email." }).trim(),
	password: z
		.string()
		.min(5, { message: "Be at least five characters long" })
		.regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
		.regex(/[0-9]/, { message: "Contain at least one number." })
		// .regex(/[^a-zA-Z0-9]/, {
		//   message: "Contain at least one special character.",
		// })
		.trim(),
	role: z.enum(["admin", "user"], {
		invalid_type_error: "Please select a role",
	}),
});

export const SignupFormSchema = z.object({
	username: z
		.string()
		.min(2, { message: "Username must be at least two characters long." })
		.trim(),
	email: z.string().email({ message: "Please enter a valid email." }).trim(),
	password: z
		.string()
		.min(8, { message: "Be at least eight characters long" })
		.regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
		.regex(/[0-9]/, { message: "Contain at least one number." })
		.regex(/[^a-zA-Z0-9]/, {
			message: "Contain at least one special character.",
		})
		.trim(),
});

export type SignupFormState =
	| {
			errors?: {
				username?: string[];
				email?: string[];
				password?: string[];
			};
			message?: string;
	  }
	| undefined;

export const LoginFormSchema = z.object({
	email: z.string().email({ message: "Please enter a valid email." }).trim(),
	password: z.string().min(8, { message: "Password is required." }).trim(),
});

export type LoginFormState =
	| {
			errors?: {
				email?: string[];
				password?: string[];
			};
			message?: string;
	  }
	| undefined;
