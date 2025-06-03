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

export type Customer = {
	id: string;
	name: string;
	email: string;
	image_url: string;
};

export type CustomerField = {
	id: string;
	name: string;
};

export type Invoice = {
	id: string;
	customer_id: string;
	amount: number;
	date: string;
	status: "pending" | "paid";
};

export type CustomersTableType = {
	id: string;
	name: string;
	email: string;
	image_url: string;
	total_invoices: number;
	total_pending: number;
	total_paid: number;
};

export type FormattedCustomersTable = {
	email: string;
	id: string;
	image_url: string;
	name: string;
	total_invoices: number;
	total_paid: string;
	total_pending: string;
};

export type InvoiceForm = {
	id: string;
	customerId: string;
	amount: number;
	status: "pending" | "paid" | null;
};

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

export type InvoiceState = {
	errors?: {
		customerId?: string[];
		amount?: string[];
		status?: string[];
	};
	message?: string | null;
};

export const InvoiceFormSchema = z.object({
	id: z.string(),
	customerId: z.string({
		invalid_type_error: "Invalid customer id",
	}),
	amount: z.coerce
		.number()
		.gt(0, { message: "Amount must be greater than $0." }),
	status: z.enum(["pending", "paid"], {
		invalid_type_error: "Please select a status",
	}),
	date: z.string(),
});
