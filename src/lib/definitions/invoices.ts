import type { FormState } from "@/src/lib/definitions/form";
import { z as zod } from "@/src/lib/definitions/zod-alias";

/** Branded type for Invoice ID */
export type InvoiceId = string & { readonly __brand: unique symbol };
/** Branded type for Customer ID */
export type CustomerId = string & { readonly __brand: unique symbol };

/** Invoice status enum for stricter typing */
export enum PaymentStatusEnum {
	Pending = "pending",
	Paid = "paid",
}
export const INVOICE_STATUSES = [
	PaymentStatusEnum.Pending,
	PaymentStatusEnum.Paid,
] as const;
export type PaymentStatus = (typeof INVOICE_STATUSES)[number];

/** Invoice entity type. */
export interface Invoice {
	readonly id: InvoiceId;
	readonly customerId: CustomerId;
	readonly amount: number;
	readonly date: string; // ISO 8601
	readonly status: PaymentStatus;
}

/** Invoice form fields. */
export type InvoiceFormFields = {
	id: InvoiceId | "";
	customerId: CustomerId | "";
	amount: number | "";
	status: PaymentStatus | null;
	date?: string;
};

/** State for the invoice form. */
export type InvoiceFormState = FormState<InvoiceFormFields>;

/** Row type for invoices table. */
export interface InvoicesTableRow {
	readonly id: InvoiceId;
	readonly customerId: CustomerId;
	readonly name: string;
	readonly email: string;
	readonly imageUrl: string;
	readonly date: string;
	readonly amount: number;
	readonly status: PaymentStatus;
}

/** Filtered invoice data for API responses. */
export interface FilteredInvoiceData {
	readonly id: InvoiceId;
	readonly amount: number;
	readonly date: string;
	readonly name: string;
	readonly email: string;
	readonly imageUrl: string;
	readonly paymentStatus: PaymentStatus;
}

/** Data shape for fetching latest invoices. */
export interface FetchLatestInvoicesData {
	readonly id: InvoiceId;
	readonly amount: number;
	readonly email: string;
	readonly imageUrl: string;
	readonly name: string;
	readonly paymentStatus: PaymentStatus;
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
	readonly paymentStatus: PaymentStatus;
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

// -- File 1 --

// import type { FormState } from "@/src/lib/definitions/form";
// import { z as zod } from "@/src/lib/definitions/zod-alias";
//
// // --- Invoice Status ---
//
// export const INVOICE_STATUSES = ["pending", "paid"] as const;
// export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];
//
// // --- Entity Types ---
//
// /** Invoice entity type. */
// export interface Invoice {
// 	id: string;
// 	customerId: string;
// 	amount: number;
// 	date: string;
// 	status: InvoiceStatus;
// }
//
// // --- Form Types ---
//
// /** Invoice form fields. Use `type` and ensure all keys are string. */
// export type InvoiceFormFields = {
// 	id: string;
// 	customerId: string;
// 	amount: number;
// 	status: InvoiceStatus | null;
// 	date?: string;
// };
//
// /** State for the invoice form. */
// export type InvoiceFormState = FormState<InvoiceFormFields>;
//
// // --- Table and Data Types ---
//
// export interface InvoicesTableRow {
// 	id: string;
// 	customerId: string;
// 	name: string;
// 	email: string;
// 	imageUrl: string;
// 	date: string;
// 	amount: number;
// 	status: InvoiceStatus;
// }
//
// export interface FilteredInvoiceData {
// 	id: string;
// 	amount: number;
// 	date: string;
// 	name: string;
// 	email: string;
// 	imageUrl: string;
// 	paymentStatus: InvoiceStatus;
// }
//
// export interface FetchLatestInvoicesData {
// 	id: string;
// 	amount: number;
// 	email: string;
// 	imageUrl: string;
// 	name: string;
// 	paymentStatus: string;
// }
//
// export type ModifiedLatestInvoicesData = Omit<
// 	FetchLatestInvoicesData,
// 	"amount"
// > & {
// 	amount: string;
// };
//
// export interface LatestInvoice {
// 	id: string;
// 	name: string;
// 	imageUrl: string;
// 	email: string;
// 	amount: string;
// }
//
// export type LatestInvoiceRaw = Omit<LatestInvoice, "amount"> & {
// 	amount: number;
// };
//
// export interface FetchFilteredInvoicesData {
// 	id: string;
// 	amount: number;
// 	date: string;
// 	name: string;
// 	email: string;
// 	imageUrl: string;
// 	paymentStatus: InvoiceStatus;
// }
//
// /**
//  * Result type for createInvoice server action.
//  * Always includes errors/message for form state compatibility.
//  */
// export type CreateInvoiceResult = {
// 	errors?: Partial<Record<keyof InvoiceFormFields, string[]>>;
// 	message: string;
// 	success: boolean;
// };
//
// // --- Validation Schemas ---
//
// /** Zod schema for invoice form validation. */
// export const InvoiceFormSchema = zod.object({
// 	id: zod.string(),
// 	customerId: zod.string({ invalid_type_error: "Invalid customer id" }),
// 	amount: zod.coerce
// 		.number()
// 		.gt(0, { message: "Amount must be greater than $0." }),
// 	status: zod.enum(INVOICE_STATUSES, {
// 		invalid_type_error: "Please select a status",
// 	}),
// 	date: zod.string().optional(),
// });
//
// /** Zod schema for creating an invoice (omit id and date). */
// export const CreateInvoiceSchema = InvoiceFormSchema.omit({
// 	id: true,
// 	date: true,
// });
//
// /** Zod schema for updating an invoice (omit id and date). */
// export const UpdateInvoiceSchema = InvoiceFormSchema.omit({
// 	id: true,
// 	date: true,
// });
