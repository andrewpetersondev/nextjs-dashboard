import type { InvoiceStatus } from "@/shared/invoices/invoices";

/**
 * Data Transfer Object for an invoice.
 * Plain, serializable shape for UI/API transport.
 */
export interface InvoiceDto {
  readonly id: string;
  readonly amount: number;
  readonly customerId: string;
  readonly date: string; // ISO date string
  readonly revenuePeriod: string; // derived yyyy-MM or yyyy-MM-dd
  readonly sensitiveData: string;
  readonly status: InvoiceStatus;
}

/**
 * DTO for creating/updating an invoice from forms.
 * Excludes id and revenuePeriod which are generated/derived on server.
 */
export type InvoiceFormDto = Omit<InvoiceDto, "id" | "revenuePeriod">;
