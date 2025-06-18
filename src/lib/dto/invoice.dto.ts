import type { Status } from "@/src/lib/definitions/invoices";

export interface InvoiceDTO {
	id: string;
	customerId: string;
	amount: number; // Amount in cents
	status: Status;
	date: string; // ISO date string
}
