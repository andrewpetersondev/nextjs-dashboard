import type { InvoiceStatus } from "@/src/lib/definitions/enums.ts";

// biome-ignore lint/style/useNamingConvention: ignore
export interface InvoiceDTO {
	id: string;
	customerId: string;
	amount: number; // Amount in cents
	status: InvoiceStatus;
	date: string; // ISO date string
}
