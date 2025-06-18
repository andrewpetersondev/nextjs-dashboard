import type { InvoiceStatus } from "@/src/lib/definitions/enums";
import type { CustomerId, InvoiceId } from "@/src/lib/definitions/invoices";

/**
 * This file defines the `InvoiceEntity` TypeScript interface, which represents the structure of an invoice record as stored in the database. It ensures type safety and consistency when working with invoice data throughout the application.
 *
 * - **Purpose:**
 *   Provides a strongly-typed contract for invoice entities, mapping directly to the columns in the `invoices` table.
 *
 * - **Fields:**
 *   - `id`: Unique identifier for the invoice (`InvoiceId`).
 *   - `customerId`: References the customer associated with the invoice (`CustomerId`).
 *   - `amount`: The total amount for the invoice (`number`).
 *   - `date`: The invoice date in ISO 8601 format (`string`).
 *   - `status`: The current status of the invoice (`InvoiceStatus`).
 *
 * - **Usage:**
 *   Used in database access layers, API responses, and business logic to ensure that invoice data adheres to the expected schema.
 *
 * - **Best Practices:**
 *   - Do not mutate properties, as all fields are marked `readonly`.
 *   - Import related types using project import aliases for maintainability.
 *
 * - **Location:**
 *   `src/db/entities/invoice.ts`
 */
export interface InvoiceEntity {
	readonly id: InvoiceId;
	readonly customerId: CustomerId;
	readonly amount: number;
	readonly date: string; // ISO 8601
	readonly status: InvoiceStatus;
}
