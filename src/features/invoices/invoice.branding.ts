import "server-only";

import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import {
  toCustomerId,
  toInvoiceId,
  toInvoiceStatusBrand,
} from "@/lib/definitions/brands";

/**
 * Brands invoice fields for safe DAL/database operations.
 *
 * ## Overview
 * - Converts plain invoice DTO fields to branded domain types for type safety.
 * - Accepts a partial set of fields and only brands those present.
 * - Prevents accidental misuse of IDs and status values in database logic.
 *
 * ## Parameters
 * @param fields - Partial invoice DTO object. Only present fields are branded.
 *
 * ## Returns
 * @returns Partial object with branded types for DAL/database use:
 * - `amount`: number (unchanged)
 * - `customerId`: branded CustomerId
 * - `date`: string (unchanged)
 * - `id`: branded InvoiceId
 * - `status`: branded InvoiceStatus
 *
 * ## Error Handling
 * - No runtime errors are thrown; branding is compile-time only.
 * - Defensive: Only brands fields that are present and defined.
 *
 * ## Security
 * - Never expose branded types to the UI or external consumers.
 * - Use this utility only for server/database logic.
 *
 * ## Example
 * ```typescript
 * const branded = brandInvoiceFields({
 *   amount: 1500,
 *   customerId: "456e7890-e12b-34d5-a678-426614174001",
 *   status: "pending",
 * });
 * // branded.customerId is now a CustomerId type
 */
export function brandInvoiceFields(fields: Partial<InvoiceDto>): Partial<{
  amount: number;
  customerId: ReturnType<typeof toCustomerId>;
  date: string;
  id: ReturnType<typeof toInvoiceId>;
  sensitiveData: string;
  status: ReturnType<typeof toInvoiceStatusBrand>;
}> {
  return {
    ...(fields.amount !== undefined && { amount: fields.amount }),
    ...(fields.customerId !== undefined && {
      customerId: toCustomerId(fields.customerId),
    }),
    ...(fields.sensitiveData !== undefined && {
      sensitiveData: fields.sensitiveData,
    }),
    ...(fields.status !== undefined && {
      status: toInvoiceStatusBrand(fields.status),
    }),
    ...(fields.id !== undefined && { id: toInvoiceId(fields.id) }),
    ...(fields.date !== undefined && { date: fields.date }),
  };
}
