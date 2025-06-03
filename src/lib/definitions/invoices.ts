import { z } from "zod";

export type Invoice = {
	id: string;
	customer_id: string;
	amount: number;
	date: string;
	status: "pending" | "paid";
};

export type InvoiceForm = {
	id: string;
	customerId: string;
	amount: number;
	status: "pending" | "paid" | null;
};

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

export type InvoicesTable = {
	id: string;
	customer_id: string;
	name: string;
	email: string;
	image_url: string;
	date: string;
	amount: number;
	status: "pending" | "paid";
};

export type FilteredInvoiceData = {
	id: string;
	amount: number;
	date: string;
	name: string;
	email: string;
	image_url: string;
	paymentStatus: "pending" | "paid";
};

export type FetchLatestInvoicesData = {
	amount: number;
	email: string;
	id: string;
	image_url: string;
	name: string;
	paymentStatus: string;
};

export type ModifiedLatestInvoicesData = Omit<
	FetchLatestInvoicesData,
	"amount"
> & {
	amount: string;
};

export type LatestInvoice = {
	id: string;
	name: string;
	image_url: string;
	email: string;
	amount: string;
};

export type LatestInvoiceRaw = Omit<LatestInvoice, "amount"> & {
	amount: number;
};

export type FetchFilteredInvoicesData = {
	id: string;
	amount: number;
	date: string;
	name: string;
	email: string;
	image_url: string;
	paymentStatus: "pending" | "paid";
};
