import { z as zod } from "zod";
import type { FormState } from "@/lib/definitions/form";

// --- Entity Types ---

/**
 * Branded type for Customer IDs.
 */
export type CustomerId = string & { readonly __brand: unique symbol };

/**
 * Represents a customer entity with a branded CustomerId.
 */
export type Customer = {
	readonly id: CustomerId;
	readonly name: string;
	readonly email: string;
	readonly imageUrl: string;
};

/**
 * Represents a customer row fetched from the DB.
 * Always use branded CustomerId internally.
 */
export interface CustomerByIdDbRow {
	readonly id: CustomerId; // <-- changed from string to CustomerId
	readonly name: string;
	readonly email: string;
	readonly imageUrl: string;
}

/**
 * Represents a customer field for select options.
 */
export type CustomerField = Pick<Customer, "id" | "name">;

/**
 * Represents a row in the customers table (raw).
 */
export type CustomersTableRow = {
	id: CustomerId; // <-- changed from string to CustomerId
	name: string;
	email: string;
	imageUrl: string;
	totalInvoices: number;
	totalPending: number;
	totalPaid: number;
};

/**
 * Represents a formatted row for the customer's table in the UI.
 */
export type FormattedCustomersTableRow = {
	id: CustomerId; // <-- changed from string to CustomerId
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
 * State for the customer form.
 */
export type CustomerFormState = FormState<CustomerFormFields>;

// --- Validation Schemas ---

/**
 * Zod schema for customer form validation.
 */
export const CustomerFormSchema = zod.object({
	email: zod.string().email({ message: "Please enter a valid email." }).trim(),
	imageUrl: zod
		.string()
		.url({ message: "Please enter a valid image URL." })
		.trim(),
	name: zod
		.string()
		.min(2, { message: "Name must be at least two characters long." })
		.trim(),
});
