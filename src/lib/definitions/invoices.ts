import {
	INVOICE_STATUSES,
	type InvoiceStatus,
} from "@/src/lib/definitions/enums.ts";
import type { FormState } from "@/src/lib/definitions/form.ts";
import { z as zod } from "@/src/lib/definitions/zod-alias.ts";

/* ============================================================================
 * Branded Types
 * ========================================================================== */

/** Unique branded type for Invoice IDs. */
export type InvoiceId = string & { readonly __brand: unique symbol };

/** Unique branded type for Customer IDs. */
export type CustomerId = string & { readonly __brand: unique symbol };

/* ============================================================================
 * Form Field Types
 * ========================================================================== */

/**
 * Fields for invoice form state.
 * Allows additional dynamic fields for extensibility.
 */
export interface InvoiceFormFields {
	id: InvoiceId | "";
	customerId: CustomerId | "";
	amount: number | "";
	status: InvoiceStatus;
	date?: string;
	[key: string]: unknown; // <-- Fix: allow index signature for FormState compatibility
}

/* ============================================================================
 * Form State Aliases
 * ========================================================================== */

export type InvoiceFormState = FormState<InvoiceFormFields>;

/* ============================================================================
 * Database Row Types
 * ========================================================================== */

export interface DbRowBase<
	Id extends string = string,
	StatusType extends string = string,
> {
	id: Id;
	amount: number;
	status: StatusType;
}

export interface LatestInvoiceDbRow extends DbRowBase {
	name: string;
	imageUrl: string;
	email: string;
}

export interface FilteredInvoiceDbRow extends DbRowBase {
	date: string;
	name: string;
	email: string;
	imageUrl: string;
}

export interface InvoiceByIdDbRow extends DbRowBase {
	customerId: string;
	date: string;
}

/* ============================================================================
 * UI Table Row Types
 * ========================================================================== */

export interface FetchLatestInvoicesData {
	readonly id: InvoiceId;
	readonly amount: number;
	readonly email: string;
	readonly imageUrl: string;
	readonly name: string;
	readonly status: InvoiceStatus;
}

export type ModifiedLatestInvoicesData = Omit<
	FetchLatestInvoicesData,
	"amount"
> & {
	amount: string;
};

export interface FetchFilteredInvoicesData {
	readonly id: InvoiceId;
	readonly amount: number;
	readonly date: string;
	readonly name: string;
	readonly email: string;
	readonly imageUrl: string;
	readonly status: InvoiceStatus;
}

/* ============================================================================
 * Action Result Types
 * ========================================================================== */

export type CreateInvoiceResult = {
	readonly errors?: Record<string, string[]>;
	readonly message?: string;
	readonly success: boolean;
};

/* ============================================================================
 * Validation Schemas (zod)
 * ========================================================================== */

/**
 * Zod schema for invoice form validation.
 * Branding is applied in mappers/DAL, not in the schema.
 */
export const InvoiceFormSchema = zod.object({
	amount: zod.coerce
		.number()
		.gt(0, { message: "Amount must be greater than $0." }), // Accepts string, branding applied elsewhere
	// biome-ignore lint/style/useNamingConvention: ignore
	customerId: zod.string({ invalid_type_error: "Invalid customer id" }),
	date: zod.string().optional(),
	id: zod.string(),
	status: zod.enum(INVOICE_STATUSES, {
		// biome-ignore lint/style/useNamingConvention: ignore
		invalid_type_error: "Please select a status",
	}),
});

/**
 * Zod schema for creating an invoice (omit id and date).
 */
export const CreateInvoiceSchema = InvoiceFormSchema.omit({
	date: true,
	id: true,
});

/**
 * Zod schema for updating an invoice (omit id and date).
 */
export const UpdateInvoiceSchema = InvoiceFormSchema.omit({
	date: true,
	id: true,
});
