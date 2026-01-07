import "server-only";
import type { InvoiceDto } from "@/modules/invoices/application/dto/invoice.dto";
import { logError } from "@/modules/revenues/application/cross-cutting/logging";
import { extractPeriodFromInvoice } from "@/modules/revenues/domain/policies/invoice-period.policy";
import type { Period } from "@/shared/branding/brands";

/**
 * Extracts and validates the period from an invoice with structured error logging.
 * Catches extraction failures and logs them with invoice context before returning null.
 *
 * @param invoice - The invoice to extract the period from
 * @param context - Logging context string for error reporting
 * @param eventId - Optional event ID for tracing
 * @returns The extracted period or null if extraction fails
 */
export function extractAndValidatePeriodWithLogging(
  invoice: InvoiceDto,
  context: string,
  eventId?: string,
): Period | null {
  try {
    return extractPeriodFromInvoice(invoice);
  } catch (error) {
    logError(context, "Failed to extract period from the invoice", error, {
      eventId: eventId ?? null,
      invoiceDate: invoice.date ?? null,
      invoiceId: invoice.id ?? null,
    });
    return null;
  }
}
