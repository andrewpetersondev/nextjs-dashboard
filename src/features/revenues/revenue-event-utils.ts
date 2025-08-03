import "server-only";

import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import { logger } from "@/lib/utils/logger";

/**
 * Utility functions for revenue event handling
 */

/**
 * Safely extracts the period (YYYY-MM) from an invoice date
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
    // Try to parse as ISO date first
    const date = new Date(invoice.date);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString().substring(0, 7); // "YYYY-MM"
    }

    // Fallback to direct substring if the date is already in YYYY-MM-DD format
    if (
      typeof invoice.date === "string" &&
      invoice.date.match(/^\d{4}-\d{2}/)
    ) {
      return invoice.date.substring(0, 7);
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
 * that would disrupt the event bus
 *
 * @param context - The context where the error occurred
 * @param error - The error that occurred
 * @param metadata - Additional metadata to log with the error
 */
export function handleEventError(
  context: string,
  error: unknown,
  metadata: Record<string, unknown> = {},
): void {
  // Don't throw - avoid blocking the event bus
  logger.error({
    context,
    error,
    ...metadata,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Validates an invoice for revenue calculations
 *
 * @param invoice - The invoice to validate
 * @returns An object with validation result and error message if invalid
 */
export function validateInvoiceForRevenue(invoice: InvoiceDto): {
  isValid: boolean;
  errorMessage?: string;
} {

  if (!invoice.id) {
    return { errorMessage: "Invoice ID is missing", isValid: false };
  }

  if (!invoice.date) {
    return { errorMessage: "Invoice date is missing", isValid: false };
  }

  if (typeof invoice.amount !== "number") {
    return { errorMessage: "Invoice amount is not a number", isValid: false };
  }

  if (!invoice.status) {
    return { errorMessage: "Invoice status is missing", isValid: false };
  }

  const period = extractPeriodFromInvoice(invoice);
  if (!period) {
    return {
      errorMessage: "Could not extract valid period from invoice date",
      isValid: false,
    };
  }

  return { isValid: true };
}
