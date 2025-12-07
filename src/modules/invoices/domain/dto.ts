import type { InvoiceStatus } from "@/modules/invoices/domain/types";

/** Transport aliases (unambiguous formats) */
export type IsoDateString = string; // YYYY-MM-DD
export type PeriodFirstDayString = string; // YYYY-MM-01

/**
 * Data Transfer Object for an invoice.
 * Plain, serializable shape for UI/API transport.
 */
export interface InvoiceDto {
  readonly id: string;
  readonly amount: number; // integer cents
  readonly customerId: string;
  /** Transport date format: ISO date string = YYYY-MM-DD */
  readonly date: IsoDateString;
  /** Transport period format: YYYY-MM-01 (first-of-month date) */
  readonly revenuePeriod: PeriodFirstDayString;
  readonly sensitiveData: string;
  readonly status: InvoiceStatus;
}

/**
 * DTO for creating/updating an invoice from forms.
 * Excludes id and revenuePeriod which are generated/derived on server.
 */
export type InvoiceFormDto = Omit<InvoiceDto, "id" | "revenuePeriod">;

/**
 * DTO for the invoices summary card.
 */
export type InvoicesSummary = {
  totalInvoices: number;
  totalPaid: number;
  totalPending: number;
};
