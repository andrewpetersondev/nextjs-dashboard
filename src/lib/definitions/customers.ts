import { z as zod } from "zod";

// --- Types ---

/**
 * Customer entity type.
 */
export type Customer = {
	id: string;
	name: string;
	email: string;
	image_url: string;
};

/**
 * Customer field type (for select options, etc).
 */
export type CustomerField = {
	id: string;
	name: string;
};

/**
 * Customers table row type.
 */
export type CustomersTable = {
	id: string;
	name: string;
	email: string;
	image_url: string;
	total_invoices: number;
	total_pending: number;
	total_paid: number;
};

/**
 * Formatted customers table row for UI.
 */
export type FormattedCustomersTable = {
	id: string;
	name: string;
	email: string;
	image_url: string;
	total_invoices: number;
	total_paid: string;
	total_pending: string;
};

/**
 * State for customer form.
 */
export type CustomerFormState =
	| {
			errors?: Partial<Record<keyof CustomerFormFields, string[]>>;
			message?: string;
	  }
	| undefined;

/**
 * Fields for customer form.
 */
export type CustomerFormFields = {
	name: string;
	email: string;
	image_url: string;
};

// --- Validation Schemas ---

/**
 * Zod schema for customer form validation.
 */
export const CustomerFormSchema = zod.object({
	name: zod
		.string()
		.min(2, { message: "Name must be at least two characters long." })
		.trim(),
	email: zod.string().email({ message: "Please enter a valid email." }).trim(),
	image_url: zod
		.string()
		.url({ message: "Please enter a valid image URL." })
		.trim(),
});

/*
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
*/
