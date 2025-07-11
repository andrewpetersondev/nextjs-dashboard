import type { InvoiceStatus } from "@/features/invoices/invoice.types";

export interface InvoiceDto {
  readonly id: string;
  readonly customerId: string;
  readonly amount: number; // Amount in cents
  readonly status: InvoiceStatus;
  readonly date: string; // ISO date string
}
