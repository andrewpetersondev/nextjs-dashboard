import type { InvoiceStatus } from "@/src/lib/definitions/invoices.ts";

// biome-ignore lint/style/useNamingConvention: ignore
export interface InvoiceDTO {
	readonly id: string;
	readonly customerId: string;
	readonly amount: number; // Amount in cents
	readonly status: InvoiceStatus;
	readonly date: string; // ISO date string
}
