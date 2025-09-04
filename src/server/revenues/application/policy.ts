import "server-only";

import { isValid, parseISO } from "date-fns";
import { logError } from "@/server/revenues/application/logging";
import type { Period } from "@/shared/brands/domain-brands";
import { toPeriod } from "@/shared/brands/mappers";
import { ISO_YEAR_MONTH_REGEX } from "@/shared/invoices/constants";
import type { InvoiceDto } from "@/shared/invoices/dto";
import { dateToPeriod } from "@/shared/revenues/period";

/**
 * Safely extracts the Period (first-of-month DATE) from an invoice date.
 */
export function extractPeriodFromInvoice(invoice: InvoiceDto): Period | null {
  if (!invoice || !invoice.date) {
    return null;
  }

  try {
    // Handle different date formats
    // Try to parse as ISO date
    const parsedDate = parseISO(invoice.date);
    if (isValid(parsedDate)) {
      return dateToPeriod(parsedDate);
    }
    if (invoice.date.match(ISO_YEAR_MONTH_REGEX)) {
      // Add a day to make it a complete date for validation
      const testDate = parseISO(`${invoice.date}-01`);
      if (isValid(testDate)) {
        return toPeriod(invoice.date);
      }
    }

    return null;
  } catch (error) {
    logError("extractPeriodFromInvoice", "Failed to extract period", error, {
      invoiceDate: invoice.date,
      invoiceId: invoice.id,
    });
    return null;
  }
}

/**
 * Validates an invoice for revenue calculations.
 */
export function validateInvoicePeriodForRevenue(
  invoice: InvoiceDto | undefined,
): {
  valid: boolean;
  reason?: string;
} {
  if (!invoice) {
    return { reason: "Invoice is undefined", valid: false };
  }

  if (!invoice.id) {
    return { reason: "Invoice ID is missing", valid: false };
  }

  if (!invoice.date) {
    return { reason: "Invoice date is missing", valid: false };
  }

  if (!invoice.status) {
    return { reason: "Invoice status is missing", valid: false };
  }

  const period = extractPeriodFromInvoice(invoice);
  if (!period) {
    return {
      reason: "Could not extract a valid period from the invoice date",
      valid: false,
    };
  }

  return { valid: true };
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
