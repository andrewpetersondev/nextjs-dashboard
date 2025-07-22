import type { InvoiceDto } from "@/features/invoices/invoice.dto";

/**
 * Type guard to ensure an InvoiceDto has a defined `id`.
 * @param invoice - The InvoiceDto object to check.
 * @returns `true` if `id` is defined, otherwise `false`.
 */
export function hasInvoiceId(invoice: InvoiceDto): invoice is InvoiceDto {
  return invoice.id.trim().length > 0;
}
