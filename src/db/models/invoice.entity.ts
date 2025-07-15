import type { InvoiceStatus } from "@/features/invoices/invoice.types";
import type { CustomerId, InvoiceId } from "@/lib/definitions/brands";

/**
 * Represents the canonical structure of an invoice record in the domain layer.
 *
 * - All fields are readonly to enforce immutability.
 * - Use this type for all business logic and domain operations.
 * - Do not expose this type directly to the client/UI; use `InvoiceDto` instead.
 *
 * @property id - Branded unique identifier for the invoice.
 * @property customerId - Branded unique identifier for the customer.
 * @property amount - Invoice amount in cents.
 * @property date - ISO 8601 date string.
 * @property status - Invoice status ("pending" | "paid").
 * @property sensitiveData - Internal field, not for client exposure.
 */
export interface InvoiceEntity {
  readonly amount: number;
  readonly customerId: CustomerId;
  readonly date: string; // ISO 8601
  readonly id: InvoiceId;
  readonly sensitiveData: string;
  readonly status: InvoiceStatus;
}
