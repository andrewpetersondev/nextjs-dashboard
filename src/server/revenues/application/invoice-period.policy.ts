import "server-only";

import { logError } from "@/server/revenues/application/logging";
import {
  extractPeriodFromInvoice as extractPeriodFromInvoiceDomain,
  validateInvoicePeriodForRevenue as validateInvoicePeriodForRevenueDomain,
} from "@/server/revenues/domain/policies/invoice-period.policy";
import type { Period } from "@/shared/brands/domain-brands";
import type { InvoiceDto } from "@/shared/invoices/dto";

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
 * Validates an invoice for revenue calculations.
 */
export function validateInvoicePeriodForRevenue(
  invoice: InvoiceDto | undefined,
): { valid: boolean; reason?: string } {
  try {
    return validateInvoicePeriodForRevenueDomain(invoice);
  } catch {
    // Should not throw, but if it does, surface a stable invalid result
    return { reason: "Validation error", valid: false };
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
