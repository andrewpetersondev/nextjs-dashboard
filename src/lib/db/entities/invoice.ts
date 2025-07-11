import type { CustomerId, InvoiceId } from "@/lib/definitions/brands";
import type { InvoiceStatus } from "@/lib/definitions/invoices.types";

/**
 * This file defines the `InvoiceEntity` TypeScript interface, which represents the structure of an invoice record as stored in the database. It ensures type safety and consistency when working with invoice data throughout the application.
 *
 * - **Best Practices:**
 *   - Do not mutate properties, as all fields are marked `readonly`.
 *   - Import related types using project import aliases for maintainability.
 *
 * - **Location: **
 *   `src/db/entities/invoice.ts`
 */
export interface InvoiceEntity {
  readonly id: InvoiceId;
  readonly customerId: CustomerId;
  readonly amount: number;
  readonly date: string; // ISO 8601
  readonly status: InvoiceStatus;
}
