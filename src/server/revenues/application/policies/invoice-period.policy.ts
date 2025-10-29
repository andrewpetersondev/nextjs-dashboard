import "server-only";
import type { InvoiceDto } from "@/features/invoices/lib/dto";
import { logError } from "@/server/revenues/application/cross-cutting/logging";
import { extractPeriodFromInvoice as extractPeriodFromInvoiceDomain } from "@/server/revenues/domain/policies/invoice-period.policy";
import type { Period } from "@/shared/domain/domain-brands";

// TODO: THIS FILE HAS A NEAR DUPLICATE AT REVENUES/DOMAIN/POLICIES

/**
 * Safely extracts the Period (first-of-month DATE) from an invoice date.
 */
export function extractPeriodFromInvoice(invoice: InvoiceDto): Period | null {
  try {
    return extractPeriodFromInvoiceDomain(invoice);
  } catch (error) {
    logError("extractPeriodFromInvoice", "Failed to extract period", error, {
      invoiceDate: invoice?.date ?? null,
      invoiceId: invoice?.id ?? null,
    });
    return null;
  }
}

/**
 * Extracts and validates the period from an invoice
 */
export function extractAndValidatePeriod(
  invoice: InvoiceDto,
  context: string,
  eventId?: string,
): Period | null {
  const period = extractPeriodFromInvoice(invoice);

  if (!period) {
    logError(
      context,
      "Failed to extract period from the invoice",
      new Error("Invalid invoice date"),
      {
        eventId: eventId ?? null,
        invoiceDate: invoice.date ?? null,
        invoiceId: invoice.id ?? null,
      },
    );
    return null;
  }

  return period;
}
