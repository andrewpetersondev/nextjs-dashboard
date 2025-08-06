import "server-only";

import { isValid, parseISO } from "date-fns";
import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import { dateToPeriod } from "@/features/revenues/utils/date/period.utils";
import type { BaseInvoiceEvent } from "@/lib/events/invoice.events";
import { logger } from "@/lib/utils/logger";

/**
 * Safely extracts the period (YYYY-MM) from an invoice date.
 *
 * @param invoice - The invoice to extract the period from
 * @returns The `period` in YYYY-MM format or `null` if extraction fails
 */
export function extractPeriodFromInvoice(
  invoice: InvoiceDto | undefined,
): string | null {
  if (!invoice || !invoice.date) {
    return null;
  }

  try {
    // Handle different date formats
    if (typeof invoice.date === "string") {
      // Try to parse as ISO date
      const parsedDate = parseISO(invoice.date);

      // Check if the date is valid
      if (isValid(parsedDate)) {
        return dateToPeriod(parsedDate);
      }

      // If it's a partial date in YYYY-MM format, validate and return it
      if (invoice.date.match(/^\d{4}-\d{2}$/)) {
        // Add a day to make it a complete date for validation
        const testDate = parseISO(`${invoice.date}-01`);
        if (isValid(testDate)) {
          return invoice.date;
        }
      }
    } else if (true && isValid(invoice.date)) {
      // Handle Date object directly
      return dateToPeriod(invoice.date);
    }

    return null;
  } catch (error) {
    logger.error({
      context: "extractPeriodFromInvoice",
      error,
      invoiceDate: invoice.date,
      invoiceId: invoice.id,
    });
    return null;
  }
}

/**
 * Safely handles errors in event handlers without throwing exceptions
 * that would disrupt the event bus.
 *
 * @param context - The context where the error occurred
 * @param event - The event that triggered the error
 * @param error - The error that occurred
 */
export function handleEventError(
  context: string,
  event: BaseInvoiceEvent,
  error: unknown,
): void {
  // Don't throw - avoid blocking the event bus
  logger.error({
    context,
    error,
    eventId: event.eventId,
    invoiceId: event.invoice.id,
    message: "Error handling invoice event",
    timestamp: new Date().toISOString(),
  });
}

/**
 * Validates an invoice for revenue calculations.
 *
 * @param invoice - The invoice to validate
 * @returns An object with validation result and reason if invalid
 */
export function validateInvoiceForRevenue(invoice: InvoiceDto | undefined): {
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

  if (typeof invoice.amount !== "number") {
    return { reason: "Invoice amount is not a number", valid: false };
  }

  if (!invoice.status) {
    return { reason: "Invoice status is missing", valid: false };
  }

  const period = extractPeriodFromInvoice(invoice);
  if (!period) {
    return {
      reason: "Could not extract valid period from invoice date",
      valid: false,
    };
  }

  return { valid: true };
}
