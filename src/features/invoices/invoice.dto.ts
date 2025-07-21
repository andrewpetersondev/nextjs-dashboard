import type { InvoiceStatus } from "@/features/invoices/invoice.types";

/**
 * Data Transfer Object (DTO) for invoice data.
 *
 * - Uses only plain types (string, number, etc.) for safe serialization.
 * - Intended for API/UI transport; never expose branded or internal types.
 * - Do not include sensitive or internal-only fields.
 *
 * @property id - Invoice ID as a string (UUID).
 * @property customerId - Customer ID as a string (UUID).
 * @property amount - Invoice amount in cents.
 * @property status - Invoice status ("pending" | "paid").
 * @property date - ISO 8601 date string (YYYY-MM-DD).
 *
 * @remarks
 * - This DTO is used for transferring invoice data between layers (API, services, etc.).
 * - All properties are immutable and strictly typed.
 *
 * @example
 * const invoice: InvoiceDto = {
 *   id: "123e4567-e89b-12d3-a456-426614174000",
 *   customerId: "456e7890-e12b-34d5-a678-426614174001",
 *   amount: 1500, // $15.00
 *   status: "pending",
 *   date: "2023-10-01"
 * };
 *
 * @see InvoiceStatus for possible status values.
 */
export interface InvoiceDto {
  /** Invoice amount in cents */
  readonly amount: number;
  /** Customer ID as a string (UUID) */
  readonly customerId: string;
  /** Invoice date as ISO 8601 string (YYYY-MM-DD) */
  readonly date: string;
  /** Invoice ID as a string (UUID) */
  readonly id?: string; // Keep optional for creation
  /** Sensitive data can be in the UI for now */
  readonly sensitiveData: string;
  /** Invoice status ("pending" | "paid") */
  readonly status: InvoiceStatus;
}

// Interface for editing
export interface InvoiceDtoWithId extends Omit<InvoiceDto, "id"> {
  /** Invoice ID as a string (UUID) */
  readonly id: string; // Required for editing
}
