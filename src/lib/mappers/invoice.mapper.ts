import type { InvoiceEntity } from "@/lib/db/entities/invoice";
import {
  INVOICE_STATUSES,
  type InvoiceByIdDbRow,
  type InvoiceId,
  type InvoiceStatus,
} from "@/lib/definitions/invoices.types";
import type { InvoiceDto } from "@/lib/dto/invoice.dto";
import { toCustomerIdBrand } from "@/lib/mappers/customer.mapper";

/**
 * Helper to brand a string as InvoiceId.
 */
export const toInvoiceIdBrand = (id: string): InvoiceId => id as InvoiceId;

/**
 * Helper to brand a string as InvoiceStatus.
 */
export const toInvoiceStatusBrand = (status: string): InvoiceStatus =>
  status as InvoiceStatus;

/**
 * Maps a raw database row to an InvoiceEntity.
 * Ensures type safety by branding IDs and validating status.
 *
 * @param row - The raw database row representing an invoice.
 * @returns An InvoiceEntity with branded types and validated status.
 * @throws Error if status is invalid.
 */
export function toInvoiceEntity(row: InvoiceByIdDbRow): InvoiceEntity {
  if (!INVOICE_STATUSES.includes(row.status as InvoiceStatus)) {
    throw new Error(`Invalid status value: ${row.status}`);
  }

  return {
    amount: row.amount,
    customerId: toCustomerIdBrand(row.customerId),
    date: row.date,
    id: toInvoiceIdBrand(row.id),
    status: row.status as InvoiceStatus, // Cast after validation
  };
}

/**
 * Converts an InvoiceEntity to an InvoiceDto for API responses.
 * Strips branding from IDs and preserves all other fields.
 *
 * @param invoice - The InvoiceEntity instance to convert.
 * @returns An InvoiceDto instance with plain types.
 */

export function toInvoiceDto(invoice: InvoiceEntity): InvoiceDto {
  return {
    amount: invoice.amount,
    customerId: invoice.customerId as string, // strips brand
    date: invoice.date,
    id: invoice.id as string, // strips brand
    status: invoice.status,
  };
}
