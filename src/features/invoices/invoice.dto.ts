import type { InvoiceStatus } from "@/features/invoices/invoice.types";

/**
 * Data Transfer Object (DTO) for invoice data.
 *
 * - Uses only plain types (string, number, etc.) for safe serialization.
 * - Intended for API/UI transport; never expose branded or internal types.
 * - Do not include sensitive or internal-only fields.
 *
 * @property id - Invoice ID as a string.
 * @property customerId - Customer ID as a string.
 * @property amount - Invoice amount in cents.
 * @property status - Invoice status ("pending" | "paid").
 * @property date - ISO 8601 date string.
 */
export interface InvoiceDto {
  readonly id: string;
  readonly customerId: string;
  readonly amount: number; // Amount in cents
  readonly status: InvoiceStatus;
  readonly date: string; // ISO date string
}
