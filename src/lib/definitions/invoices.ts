import { z as zod } from "zod";
import type { FormState } from "@/src/lib/definitions/form.ts";
import type { InvoiceDTO } from "@/src/lib/dto/invoice.dto.ts";

// ids and statuses: domain types
/**
 * Branded type for Invoice IDs.
 */
export type InvoiceId = string & { readonly __brand: unique symbol };
/**
 * Branded type for Customer IDs.
 */
export type CustomerId = string & { readonly __brand: unique symbol };
/**
 * Invoice statuses as a constant tuple for type safety.
 */
export const INVOICE_STATUSES = ["pending", "paid"] as const;
/**
 * Type for invoice statuses.
 */
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];
/**
 * Error map for invoice actions.
 */
export type InvoiceErrorMap = Partial<
	Record<keyof InvoiceFormFields, string[]>
>;

// --- UI and Server Actions: Form Types

/**
 * Fields for invoice form state.
 * Allows additional dynamic fields for extensibility.
 */
/** Fields allowed in invoice form (for new/edit). */
export interface InvoiceFormFields {
	id: InvoiceId | "";
	customerId: CustomerId | "";
	amount: number | "";
	status: InvoiceStatus;
	date?: string;
	[key: string]: unknown;
}

export type InvoiceFormState = Readonly<FormState<InvoiceFormFields>>;

/**
 * Unified state/result type for creating an invoice.
 * Used by both server actions and UI state.
 */
export type InvoiceCreateState = Readonly<{
	errors?: InvoiceErrorMap;
	message?: string;
	success?: boolean;
}>;
/**
 * Unified state/result type for editing an invoice.
 * Used by both server actions and UI state.
 */
export type InvoiceEditState = Readonly<{
	/**
	 * The latest invoice data (always present for UI rendering).
	 */
	invoice: InvoiceDTO;
	/**
	 * Field-level validation errors, if any.
	 */
	errors?: InvoiceErrorMap;
	/**
	 * User-facing message (success or error).
	 */
	message?: string;
	/**
	 * Indicates if the operation was successful.
	 */
	success?: boolean;
}>;

export type UpdateInvoiceFormState = Readonly<
	FormState<InvoiceFormFields> & {
		invoice: InvoiceDTO;
		success?: boolean;
	}
>;

/**
 * State shape for EditInvoiceForm.
 * Used as the state for useActionState in the edit invoice form.
 */
export type EditInvoiceFormState = Readonly<{
	invoice: InvoiceDTO;
	errors?: InvoiceErrorMap;
	message?: string;
	success?: boolean;
}>;

// --- Result/State types for create/edit actions

/**
 * Generic action result type for server actions.
 * @template T - The data payload type.
 */
export type InvoiceActionResult<T = undefined, E = Record<string, string[]>> = {
	readonly data?: T;
	readonly errors?: E;
	readonly message: string;
	readonly success: boolean;
};

/**
 * Result type for create invoice action.
 */
export type CreateInvoiceResult = InvoiceActionResult<
	undefined,
	InvoiceErrorMap
>;

export type UpdateInvoiceResult = InvoiceActionResult<
	InvoiceDTO,
	InvoiceErrorMap
>;

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

/* --- Validation Schemas (zod) --- */

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
