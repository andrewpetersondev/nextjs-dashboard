import type { InvoiceStatus } from "@/modules/invoices/domain/statuses/invoice.statuses";

/**
 * Row for invoice table queries (with customer info).
 * Used in invoice list views and table components.
 */
export type InvoiceListFilter = Readonly<{
	amount: number;
	customerId: string;
	date: Date;
	email: string;
	id: string;
	imageUrl: string;
	name: string;
	revenuePeriod: Date;
	sensitiveData: string;
	status: InvoiceStatus;
}>;
