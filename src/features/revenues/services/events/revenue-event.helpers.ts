import "server-only";

import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import { extractPeriodFromInvoice } from "@/features/revenues/services/events/revenue-event.utils";
import type { RevenueService } from "@/features/revenues/services/revenue.service";
import { toPeriod } from "@/features/revenues/utils/date/period.utils";
import { toRevenueId } from "@/lib/definitions/brands";
import type { BaseInvoiceEvent } from "@/lib/events/invoice.events";
import { logger } from "@/lib/utils/logger";

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
export function isStatusEligibleForRevenue(status: string): boolean {
  return status === "paid" || status === "pending";
}

/**
 * Processes an invoice for revenue calculation
 *
 * @param revenueService - The revenue service
 * @param invoice - The invoice to process
 * @param period - The period to update
 * @param context - The context for logging
 */
export async function processInvoiceForRevenue(
  revenueService: RevenueService,
  invoice: InvoiceDto,
  period: string,
  context = "RevenueEventHandler.processInvoiceForRevenue",
): Promise<void> {
  const metadata = {
    invoice: invoice.id,
    period,
  };

  await withErrorHandling(
    context,
    "Processing invoice for revenue calculation",
    async () => {
      // Get the existing revenue record for the period
      const existingRevenue = await revenueService.findByPeriod(period);

      if (existingRevenue) {
        logInfo(context, "Updating existing revenue record", {
          existingRevenue: existingRevenue.id,
          ...metadata,
        });

        // Update the existing revenue record
        await revenueService.update(existingRevenue.id, {
          invoiceCount: existingRevenue.invoiceCount + 1,
          revenue: existingRevenue.revenue + invoice.amount,
        });
      } else {
        logInfo(context, "Creating new revenue record", metadata);

        // Create a new revenue record
        await revenueService.create({
          calculationSource: "invoice_event",
          createdAt: new Date(),
          invoiceCount: 1,
          period: toPeriod(period),
          revenue: invoice.amount,
          updatedAt: new Date(),
        });
      }
    },
    metadata,
  );
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

/**
 * Updates a revenue record with new invoice count and revenue values
 *
 * @param revenueService - The revenue service
 * @param revenueId - The ID of the revenue record to update
 * @param invoiceCount - The new invoice count
 * @param revenue - The new revenue amount
 * @param context - The context for logging
 * @param metadata - Additional metadata for logging
 */
export async function updateRevenueRecord(
  revenueService: RevenueService,
  revenueId: string,
  invoiceCount: number,
  revenue: number,
  context: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  logInfo(context, "Updating revenue record", {
    invoiceCount,
    revenue,
    revenueId,
    ...metadata,
  });

  await revenueService.update(toRevenueId(revenueId), {
    invoiceCount,
    revenue,
  });
}

/**
 * Handles the common logic for processing invoice events
 *
 * @param event - The invoice event
 * @param revenueService - The revenue service
 * @param contextMethod - The method context for logging
 * @param isEligible - Function to check if the invoice is eligible
 * @param processInvoice - Function to process the eligible invoice
 */
export async function handleInvoiceEvent<T extends BaseInvoiceEvent>(
  event: T,
  revenueService: RevenueService,
  contextMethod: string,
  isEligible: (invoice: InvoiceDto, context: string) => boolean,
  processInvoice: (invoice: InvoiceDto, period: string) => Promise<void>,
): Promise<void> {
  try {
    logInfo(
      `RevenueEventHandler.${contextMethod}`,
      `Processing invoice ${contextMethod} event`,
      {
        eventId: event.eventId,
        invoiceId: event.invoice.id,
      },
    );

    // Extract the invoice from the event
    const invoice = event.invoice;

    // Check if the invoice is eligible for revenue calculation
    if (!isEligible(invoice, contextMethod)) {
      logInfo(
        `RevenueEventHandler.${contextMethod}`,
        "Invoice not eligible for revenue calculation, skipping",
        {
          eventId: event.eventId,
          invoiceId: event.invoice.id,
        },
      );
      return;
    }

    // Extract the period from the invoice
    const period = extractAndValidatePeriod(
      invoice,
      `RevenueEventHandler.${contextMethod}`,
      event.eventId,
    );

    if (!period) {
      return;
    }

    // Process the invoice
    await processInvoice(invoice, period);

    logInfo(
      `RevenueEventHandler.${contextMethod}`,
      `Successfully processed invoice ${contextMethod} event`,
      {
        eventId: event.eventId,
        invoiceId: event.invoice.id,
        period,
      },
    );
  } catch (error) {
    logError(
      `RevenueEventHandler.${contextMethod}`,
      `Error processing invoice ${contextMethod} event`,
      error,
      {
        eventId: event.eventId,
        invoiceId: event.invoice.id,
      },
    );
    throw error;
  }
}

/**
 * Adjusts revenue for a deleted invoice
 *
 * @param revenueService - The revenue service
 * @param invoice - The deleted invoice
 * @param period - The period to update
 */
export async function adjustRevenueForDeletedInvoice(
  revenueService: RevenueService,
  invoice: InvoiceDto,
  period: string,
): Promise<void> {
  const context = "RevenueEventHandler.adjustRevenueForDeletedInvoice";
  const metadata = {
    invoice: invoice.id,
    period,
  };

  await withErrorHandling(
    context,
    "Adjusting revenue for deleted invoice",
    async () => {
      // Get the existing revenue record
      const existingRevenue = await revenueService.findByPeriod(period);

      if (!existingRevenue) {
        logInfo(
          context,
          "No existing revenue record found for period",
          metadata,
        );
        return;
      }

      // Calculate the new invoice count and revenue
      const newInvoiceCount = Math.max(0, existingRevenue.invoiceCount - 1);
      const newRevenue = Math.max(0, existingRevenue.revenue - invoice.amount);

      logInfo(context, "Calculated new revenue values", {
        ...metadata,
        newInvoiceCount,
        newRevenue,
        previousInvoiceCount: existingRevenue.invoiceCount,
        previousRevenue: existingRevenue.revenue,
      });

      // If there are no more invoices for this period, delete the revenue record
      if (newInvoiceCount === 0) {
        logInfo(
          context,
          "No more invoices for period, deleting revenue record",
          {
            ...metadata,
            revenueId: existingRevenue.id,
          },
        );

        await revenueService.delete(existingRevenue.id);
      } else {
        // Otherwise, update the revenue record
        await updateRevenueRecord(
          revenueService,
          existingRevenue.id,
          newInvoiceCount,
          newRevenue,
          context,
          metadata,
        );
      }
    },
    metadata,
  );
}

/**
 * Adjusts revenue based on invoice status changes
 *
 * @param revenueService - The revenue service
 * @param previousInvoice - The previous invoice state
 * @param currentInvoice - The current invoice state
 */
export async function adjustRevenueForStatusChange(
  revenueService: RevenueService,
  previousInvoice: InvoiceDto,
  currentInvoice: InvoiceDto,
): Promise<void> {
  const context = "RevenueEventHandler.adjustRevenueForStatusChange";
  const metadata = {
    currentStatus: currentInvoice.status,
    invoice: currentInvoice.id,
    previousStatus: previousInvoice.status,
  };

  await withErrorHandling(
    context,
    "Adjusting revenue for status change",
    async () => {
      // Extract the period from the invoice
      const period = extractAndValidatePeriod(currentInvoice, context);

      if (!period) {
        return;
      }

      // Add period to metadata for subsequent operations
      const metadataWithPeriod = { ...metadata, period };

      // Get the existing revenue record
      const existingRevenue = await revenueService.findByPeriod(period);

      if (!existingRevenue) {
        logInfo(
          context,
          "No existing revenue record found for period",
          metadataWithPeriod,
        );

        // If the current status is eligible for revenue, create a new record
        if (isStatusEligibleForRevenue(currentInvoice.status)) {
          await processInvoiceForRevenue(
            revenueService,
            currentInvoice,
            period,
            context,
          );
        }

        return;
      }

      // Handle status changes
      if (
        isStatusEligibleForRevenue(previousInvoice.status) &&
        !isStatusEligibleForRevenue(currentInvoice.status)
      ) {
        // Invoice is no longer eligible for revenue, remove it
        logInfo(
          context,
          "Invoice no longer eligible for revenue, removing from total",
          metadataWithPeriod,
        );

        await updateRevenueRecord(
          revenueService,
          existingRevenue.id,
          Math.max(0, existingRevenue.invoiceCount - 1),
          Math.max(0, existingRevenue.revenue - previousInvoice.amount),
          context,
          metadataWithPeriod,
        );
      } else if (
        !isStatusEligibleForRevenue(previousInvoice.status) &&
        isStatusEligibleForRevenue(currentInvoice.status)
      ) {
        // Invoice is now eligible for revenue, add it
        logInfo(
          context,
          "Invoice now eligible for revenue, adding to total",
          metadataWithPeriod,
        );

        await updateRevenueRecord(
          revenueService,
          existingRevenue.id,
          existingRevenue.invoiceCount + 1,
          existingRevenue.revenue + currentInvoice.amount,
          context,
          metadataWithPeriod,
        );
      } else {
        logInfo(
          context,
          "Status change does not affect revenue eligibility",
          metadataWithPeriod,
        );
      }
    },
    metadata,
  );
}
