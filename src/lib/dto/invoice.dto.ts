import type { InvoiceStatus } from "@/lib/definitions/invoices.types";

export interface InvoiceDto {
	readonly id: string;
	readonly customerId: string;
	readonly amount: number; // Amount in cents
	readonly status: InvoiceStatus;
	readonly date: string; // ISO date string
}
