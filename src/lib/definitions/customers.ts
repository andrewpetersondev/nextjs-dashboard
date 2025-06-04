import { z as zod } from "zod";

// --- Entity Types ---

/**
 * Represents a customer entity.
 */
export type Customer = {
	id: string;
	name: string;
	email: string;
	imageUrl: string;
};

/**
 * Represents a customer field for select options.
 */
export type CustomerField = Pick<Customer, "id" | "name">;

/**
 * Represents a row in the customers table (raw).
 */
export type CustomersTableRow = {
	id: string;
	name: string;
	email: string;
	imageUrl: string;
	totalInvoices: number;
	totalPending: number;
	totalPaid: number;
};

/**
 * Represents a formatted row for the customers table in the UI.
 */
export type FormattedCustomersTableRow = {
	id: string;
	name: string;
	email: string;
	imageUrl: string;
	totalInvoices: number;
	totalPending: string;
	totalPaid: string;
};

// --- Form Types ---

/**
 * Fields for the customer form.
 */
export type CustomerFormFields = {
	name: string;
	email: string;
	imageUrl: string;
};

/**
 * Generic form state type for customer forms.
 */
export type FormState<TFields extends Record<string, unknown>> = {
	errors?: Partial<Record<keyof TFields, string[]>>;
	message?: string;
};

/**
 * State for the customer form.
 */
export type CustomerFormState = FormState<CustomerFormFields>;

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
	imageUrl: zod
		.string()
		.url({ message: "Please enter a valid image URL." })
		.trim(),
});
