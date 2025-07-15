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
 *
 * @remarks
 * - This DTO is used for transferring invoice data between layers (API, services, etc.).
 * - All properties are immutable and strictly typed.
 *
 * @example
 * const invoice: InvoiceDto = {
 *  id: "123e4567-e89b-12d3-a456-426614174000",
 *  customerId: "456e7890-e12b-34d5-a678-426614174001",
 *  amount: 1500, // $15.00
 *  status: "pending",
 *  date: "2023-10-01T12:00:00Z"
 *  };
 *
 * @see InvoiceStatus for possible status values.
 *
 */
export interface InvoiceDto {
  readonly amount: number; // Amount in cents
  readonly customerId: string;
  readonly date: string; // ISO date string
  readonly id: string;
  readonly status: InvoiceStatus;
}
