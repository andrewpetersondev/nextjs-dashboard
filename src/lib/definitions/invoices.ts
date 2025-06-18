import type { FormState } from "@/src/lib/definitions/form";
import { z as zod } from "@/src/lib/definitions/zod-alias";

/** Branded type for InvoiceEntity ID */
export type InvoiceId = string & { readonly __brand: unique symbol };
/** Branded type for Customer ID */
export type CustomerId = string & { readonly __brand: unique symbol };

/** InvoiceEntity status enum for stricter typing */
export enum StatusEnum {
	Pending = "pending",
	Paid = "paid",
}
export const INVOICE_STATUSES = [StatusEnum.Pending, StatusEnum.Paid] as const;
export type Status = (typeof INVOICE_STATUSES)[number];

/** InvoiceEntity form fields. */
export type InvoiceFormFields = {
	id: InvoiceId | "";
	customerId: CustomerId | "";
	amount: number | "";
	status: Status;
	date?: string;
};

/** State for the invoice form. */
export type InvoiceFormState = FormState<InvoiceFormFields>;

// --- Table Row Types (RAW) ---

// Base interface for raw DB rows
export interface DbRowBase<Id = string, Status = string> {
	id: Id;
	amount: number;
	status: Status;
}

// Latest invoices DB row (extends base)
export interface LatestInvoiceDbRow extends DbRowBase {
	name: string;
	imageUrl: string;
	email: string;
}

// Filtered invoices DB row (extends base)
export interface FilteredInvoiceDbRow extends DbRowBase {
	date: string;
	name: string;
	email: string;
	imageUrl: string;
}

// InvoiceEntity by ID DB row (extends base)
export interface InvoiceByIdDbRow extends DbRowBase {
	customerId: string;
	date: string;
}

// --- Table Row Types (UI) ---

/** Row type for invoices table. */
export interface InvoicesTableRow {
	readonly id: InvoiceId;
	readonly customerId: CustomerId;
	readonly name: string;
	readonly email: string;
	readonly imageUrl: string;
	readonly date: string;
	readonly amount: number;
	readonly status: Status;
}

/** Filtered invoice data for API responses. */
export interface FilteredInvoiceData {
	readonly id: InvoiceId;
	readonly amount: number;
	readonly date: string;
	readonly name: string;
	readonly email: string;
	readonly imageUrl: string;
	readonly status: Status;
}

/** Data shape for fetching latest invoices. */
export interface FetchLatestInvoicesData {
	readonly id: InvoiceId;
	readonly amount: number;
	readonly email: string;
	readonly imageUrl: string;
	readonly name: string;
	readonly status: Status;
}

/** Modified latest invoices data with string amount. */
export type ModifiedLatestInvoicesData = Omit<
	FetchLatestInvoicesData,
	"amount"
> & {
	amount: string;
};

/** Latest invoice summary. */
export interface LatestInvoice {
	readonly id: InvoiceId;
	readonly name: string;
	readonly imageUrl: string;
	readonly email: string;
	readonly amount: string;
}

/** Raw latest invoice with numeric amount. */
export type LatestInvoiceRaw = Omit<LatestInvoice, "amount"> & {
	amount: number;
};

/** Data shape for filtered invoices fetch. */
export interface FetchFilteredInvoicesData {
	readonly id: InvoiceId;
	readonly amount: number;
	readonly date: string;
	readonly name: string;
	readonly email: string;
	readonly imageUrl: string;
	readonly status: Status;
}

/**
 * Result type for createInvoice server action.
 * Always includes errors/message for form state compatibility.
 */
export type CreateInvoiceResult = {
	errors?: Partial<Record<keyof InvoiceFormFields, string[]>>;
	message: string;
	success: boolean;
};

// --- Validation Schemas ---

/** Zod schema for invoice form validation. */
export const InvoiceFormSchema = zod.object({
	id: zod.string().brand<InvoiceId>(),
	customerId: zod
		.string({ invalid_type_error: "Invalid customer id" })
		.brand<CustomerId>(),
	amount: zod.coerce
		.number()
		.gt(0, { message: "Amount must be greater than $0." }),
	status: zod.enum(INVOICE_STATUSES, {
		invalid_type_error: "Please select a status",
	}),
	date: zod.string().optional(),
});

/** Zod schema for creating an invoice (omit id and date). */
export const CreateInvoiceSchema = InvoiceFormSchema.omit({
	id: true,
	date: true,
});

/** Zod schema for updating an invoice (omit id and date). */
export const UpdateInvoiceSchema = InvoiceFormSchema.omit({
	id: true,
	date: true,
});

/** Type inferred from InvoiceFormSchema */
export type InvoiceFormSchemaType = zod.infer<typeof InvoiceFormSchema>;
