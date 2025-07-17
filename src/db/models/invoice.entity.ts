import "server-only";

import type { InvoiceStatus } from "@/features/invoices/invoice.types";
import type { CustomerId, InvoiceId } from "@/lib/definitions/brands";

/**
 * Domain model for Invoice.
 * Used for database and server logic.
 * All fields are strictly typed and immutable.
 */
export interface InvoiceEntity {
  /** Invoice amount in cents */
  readonly amount: number;
  /** Customer ID (branded) */
  readonly customerId: CustomerId;
  /** Invoice date as ISO 8601 string (YYYY-MM-DD) */
  readonly date: string;
  /** Invoice ID (branded) */
  readonly id: InvoiceId;
  /** Sensitive data (internal use only) */
  readonly sensitiveData: string;
  /** Invoice status (branded) */
  readonly status: InvoiceStatus;
}
