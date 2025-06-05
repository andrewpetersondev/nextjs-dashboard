import { z as zod } from "@/src/lib/definitions/zod-alias";

// --- Invoice Status ---

export const INVOICE_STATUSES = ["pending", "paid"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

// --- Entity Types ---

/** Invoice entity type. */
export interface Invoice {
	id: string;
	customerId: string;
	amount: number;
	date: string;
	status: InvoiceStatus;
}

// --- Form Types ---

/** Invoice form fields. Use `type` and ensure all keys are string. */
export type InvoiceFormFields = {
	id: string;
	customerId: string;
	amount: number;
	status: InvoiceStatus | null;
	date?: string;
};

/** Generic form state type for invoice forms. */
export type FormState<TFields extends Record<string, unknown>> = {
	errors?: Partial<Record<keyof TFields, string[]>>;
	message: string;
};

/** State for the invoice form. */
export type InvoiceFormState = FormState<InvoiceFormFields>;

// --- Table and Data Types ---

export interface InvoicesTableRow {
	id: string;
	customerId: string;
	name: string;
	email: string;
	imageUrl: string;
	date: string;
	amount: number;
	status: InvoiceStatus;
}

export interface FilteredInvoiceData {
	id: string;
	amount: number;
	date: string;
	name: string;
	email: string;
	imageUrl: string;
	paymentStatus: InvoiceStatus;
}

export interface FetchLatestInvoicesData {
	id: string;
	amount: number;
	email: string;
	imageUrl: string;
	name: string;
	paymentStatus: string;
}

export type ModifiedLatestInvoicesData = Omit<
	FetchLatestInvoicesData,
	"amount"
> & {
	amount: string;
};

export interface LatestInvoice {
	id: string;
	name: string;
	imageUrl: string;
	email: string;
	amount: string;
}

export type LatestInvoiceRaw = Omit<LatestInvoice, "amount"> & {
	amount: number;
};

export interface FetchFilteredInvoicesData {
	id: string;
	amount: number;
	date: string;
	name: string;
	email: string;
	imageUrl: string;
	paymentStatus: InvoiceStatus;
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
	id: zod.string(),
	customerId: zod.string({ invalid_type_error: "Invalid customer id" }),
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
