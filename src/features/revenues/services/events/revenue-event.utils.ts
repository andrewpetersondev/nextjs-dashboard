import "server-only";

import { isValid, parseISO } from "date-fns";
import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import type { InvoiceStatus } from "@/features/invoices/invoice.types";
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

/**
 * Wraps a function with standardized error handling
 *
 * @param context - The logging context
 * @param operation - The operation description for logging
 * @param fn - The function to execute
 * @param metadata - Additional metadata for logging
 * @returns The result of the function execution
 */
export async function withErrorHandling<T>(
  context: string,
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>,
): Promise<T> {
  try {
    logInfo(context, `${operation} - started`, metadata);

    const result = await fn();

    logInfo(context, `${operation} - completed successfully`, metadata);
    return result;
  } catch (error) {
    logError(context, `Error ${operation.toLowerCase()}`, error, metadata);
    throw error;
  }
}

/**
 * Creates a standardized log entry
 *
 * @param context - The logging context
 * @param message - The log message
 * @param metadata - Additional metadata for the log
 */
export function logInfo(
  context: string,
  message: string,
  metadata?: Record<string, unknown>,
): void {
  logger.info({
    context,
    message,
    ...metadata,
  });
}

/**
 * Creates a standardized error log entry
 *
 * @param context - The logging context
 * @param message - The error message
 * @param error - The error object
 * @param metadata - Additional metadata for the log
 */
export function logError(
  context: string,
  message: string,
  error?: unknown,
  metadata?: Record<string, unknown>,
): void {
  logger.error({
    context,
    error,
    message,
    ...metadata,
  });
}

/**
 * Checks if an invoice status is eligible for revenue
 *
 * @param status - The invoice status
 * @returns True if the status is eligible for revenue
 */
export function isStatusEligibleForRevenue(status: InvoiceStatus): boolean {
  return status === "paid" || status === "pending";
}

/**
 * Checks if an invoice is eligible for revenue calculation.
 *
 * @param invoice - The invoice to check
 * @param contextMethod - The method context for logging
 * @returns True if the invoice is eligible, false otherwise
 */
export function isInvoiceEligibleForRevenue(
  invoice: InvoiceDto,
  contextMethod: string,
): boolean {
  const context = `RevenueEventHandler.${contextMethod}`;

  try {
    // Validate the invoice
    const validationResult = validateInvoiceForRevenue(invoice);

    if (!validationResult.valid) {
      logInfo(
        context,
        `Invoice not eligible for revenue: ${validationResult.reason}`,
        {
          invoice: invoice.id,
          reason: validationResult.reason,
        },
      );
      return false;
    }

    // Check if the invoice has a valid amount
    if (!invoice.amount || invoice.amount <= 0) {
      logInfo(context, "Invoice has zero or negative amount, skipping", {
        invoice: invoice.id,
      });
      return false;
    }

    // Check if the invoice has a valid status
    if (!isStatusEligibleForRevenue(invoice.status)) {
      logInfo(
        context,
        `Invoice status ${invoice.status} not eligible for revenue`,
        {
          invoice: invoice.id,
          status: invoice.status,
        },
      );
      return false;
    }

    return true;
  } catch (error) {
    logError(context, "Error checking invoice eligibility for revenue", error, {
      invoice: invoice.id,
    });
    return false;
  }
}

/**
 * Extracts and validates the period from an invoice
 *
 * @param invoice - The invoice to extract the period from
 * @param context - The context for logging
 * @param eventId - Optional event ID for logging
 * @returns The extracted period or null if extraction failed
 */
export function extractAndValidatePeriod(
  invoice: InvoiceDto,
  context: string,
  eventId?: string,
): string | null {
  const period = extractPeriodFromInvoice(invoice);

  if (!period) {
    logError(context, "Failed to extract period from invoice", undefined, {
      eventId,
      invoiceId: invoice.id,
    });
    return null;
  }

  return period;
}
