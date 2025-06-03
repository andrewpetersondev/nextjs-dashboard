import { z as zod } from "zod";

// --- Types ---

/**
 * Invoice entity type.
 */
export type Invoice = {
	id: string;
	customer_id: string;
	amount: number;
	date: string;
	status: InvoiceStatus;
};

/**
 * Allowed invoice statuses.
 */
export type InvoiceStatus = "pending" | "paid";

/**
 * Invoice form fields.
 */
export type InvoiceFormFields = {
	id: string;
	customerId: string;
	amount: number;
	status: InvoiceStatus | null;
};

/**
 * State for invoice form.
 */
export type InvoiceFormState =
	| {
			errors?: Partial<Record<keyof InvoiceFormFields, string[]>>;
			message?: string | null;
	  }
	| undefined;

/**
 * Invoices table row type.
 */
export type InvoicesTable = {
	id: string;
	customer_id: string;
	name: string;
	email: string;
	image_url: string;
	date: string;
	amount: number;
	status: InvoiceStatus;
};

/**
 * Filtered invoice data for UI.
 */
export type FilteredInvoiceData = {
	id: string;
	amount: number;
	date: string;
	name: string;
	email: string;
	image_url: string;
	paymentStatus: InvoiceStatus;
};

/**
 * Data shape for fetching latest invoices.
 */
export type FetchLatestInvoicesData = {
	amount: number;
	email: string;
	id: string;
	image_url: string;
	name: string;
	paymentStatus: string;
};

/**
 * Modified latest invoices data with string amount.
 */
export type ModifiedLatestInvoicesData = Omit<
	FetchLatestInvoicesData,
	"amount"
> & {
	amount: string;
};

/**
 * Latest invoice for dashboard.
 */
export type LatestInvoice = {
	id: string;
	name: string;
	image_url: string;
	email: string;
	amount: string;
};

/**
 * Raw latest invoice with numeric amount.
 */
export type LatestInvoiceRaw = Omit<LatestInvoice, "amount"> & {
	amount: number;
};

/**
 * Data shape for fetching filtered invoices.
 */
export type FetchFilteredInvoicesData = {
	id: string;
	amount: number;
	date: string;
	name: string;
	email: string;
	image_url: string;
	paymentStatus: InvoiceStatus;
};

// --- Validation Schemas ---

/**
 * Zod schema for invoice form validation.
 */
export const InvoiceFormSchema = zod.object({
	id: zod.string(),
	customerId: zod.string({
		invalid_type_error: "Invalid customer id",
	}),
	amount: zod.coerce
		.number()
		.gt(0, { message: "Amount must be greater than $0." }),
	status: zod.enum(["pending", "paid"], {
		invalid_type_error: "Please select a status",
	}),
	date: zod.string(),
});

/**
 * Zod schema for creating an invoice (omit id and date).
 */
export const CreateInvoiceSchema = InvoiceFormSchema.omit({
	id: true,
	date: true,
});

/**
 * Zod schema for updating an invoice (omit id and date).
 */
export const UpdateInvoiceSchema = InvoiceFormSchema.omit({
	id: true,
	date: true,
});

/* * Invoice management types and schemas.
// import { z } from "zod";
//
// export type Invoice = {
// 	id: string;
// 	customer_id: string;
// 	amount: number;
// 	date: string;
// 	status: "pending" | "paid";
// };
//
// export type InvoiceForm = {
// 	id: string;
// 	customerId: string;
// 	amount: number;
// 	status: "pending" | "paid" | null;
// };
//
// export type InvoiceState = {
// 	errors?: {
// 		customerId?: string[];
// 		amount?: string[];
// 		status?: string[];
// 	};
// 	message?: string | null;
// };
//
// export const InvoiceFormSchema = z.object({
// 	id: z.string(),
// 	customerId: z.string({
// 		invalid_type_error: "Invalid customer id",
// 	}),
// 	amount: z.coerce
// 		.number()
// 		.gt(0, { message: "Amount must be greater than $0." }),
// 	status: z.enum(["pending", "paid"], {
// 		invalid_type_error: "Please select a status",
// 	}),
// 	date: z.string(),
// });
//
// export type InvoicesTable = {
// 	id: string;
// 	customer_id: string;
// 	name: string;
// 	email: string;
// 	image_url: string;
// 	date: string;
// 	amount: number;
// 	status: "pending" | "paid";
// };
//
// export type FilteredInvoiceData = {
// 	id: string;
// 	amount: number;
// 	date: string;
// 	name: string;
// 	email: string;
// 	image_url: string;
// 	paymentStatus: "pending" | "paid";
// };
//
// export type FetchLatestInvoicesData = {
// 	amount: number;
// 	email: string;
// 	id: string;
// 	image_url: string;
// 	name: string;
// 	paymentStatus: string;
// };
//
// export type ModifiedLatestInvoicesData = Omit<
// 	FetchLatestInvoicesData,
// 	"amount"
// > & {
// 	amount: string;
// };
//
// export type LatestInvoice = {
// 	id: string;
// 	name: string;
// 	image_url: string;
// 	email: string;
// 	amount: string;
// };
//
// export type LatestInvoiceRaw = Omit<LatestInvoice, "amount"> & {
// 	amount: number;
// };
//
// export type FetchFilteredInvoicesData = {
// 	id: string;
// 	amount: number;
// 	date: string;
// 	name: string;
// 	email: string;
// 	image_url: string;
// 	paymentStatus: "pending" | "paid";
// };
//
// export const CreateInvoice = InvoiceFormSchema.omit({ id: true, date: true });
//
// export const UpdateInvoice = InvoiceFormSchema.omit({ id: true, date: true });

 */
