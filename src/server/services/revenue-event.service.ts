import "server-only";
import { isValid, parseISO } from "date-fns";
import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import type { InvoiceStatus } from "@/features/invoices/invoice.types";
import {
  dateToPeriod,
  periodKey,
} from "@/features/revenues/utils/date/period.utils";
import type { BaseInvoiceEvent } from "@/lib/events/event.invoice";
import { logger } from "@/lib/logging/logger";
import { type Period, toPeriod, toRevenueId } from "@/lib/types/types.brands";
import type { RevenueService } from "@/server/services/revenue.service";

// ===== Logging Functions =====

/**
 * Creates a standardized log entry
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
 * Safely handles errors in event handlers without throwing exceptions
 * that would disrupt the event bus.
 */
export function handleEventError(
  context: string,
  event: BaseInvoiceEvent,
  error: unknown,
): void {
  // Don't throw - avoid blocking the event bus
  logError(context, "Error handling invoice event", error, {
    eventId: event.eventId,
    invoiceId: event.invoice.id,
  });
}

// ===== Validation Functions =====

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
    if (invoice.date.match(/^\d{4}-\d{2}$/)) {
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
 * Checks if an invoice status is eligible for revenue
 */
export function isStatusEligibleForRevenue(status: InvoiceStatus): boolean {
  return status === "paid" || status === "pending";
}

/**
 * Validates an invoice for revenue calculations.
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
 * Checks if an invoice is eligible for revenue calculation.
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

// ===== Processing Functions =====

/**
 * Wraps a function with standardized error handling
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
        eventId,
        invoiceDate: invoice.date,
        invoiceId: invoice.id,
      },
    );
    return null;
  }

  return period;
}

/**
 * Updates a revenue record with new invoice count and revenue values
 */
export async function updateRevenueRecord(
  revenueService: RevenueService,
  revenueId: string,
  invoiceCount: number,
  totalAmount: number,
  context: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  logInfo(context, "Updating revenue record", {
    invoiceCount,
    revenueId,
    totalAmount,
    ...metadata,
  });

  await revenueService.update(toRevenueId(revenueId), {
    calculationSource: "invoice_event",
    invoiceCount,
    totalAmount,
  });
}

/**
 * Processes an invoice for revenue calculation
 */
export async function processInvoiceForRevenue(
  revenueService: RevenueService,
  invoice: InvoiceDto,
  period: Period,
  context = "RevenueEventHandler.processInvoiceForRevenue",
  isUpdate = false,
  previousAmount?: number,
): Promise<void> {
  const metadata = {
    invoice: invoice.id,
    isUpdate,
    period: periodKey(period),
  };

  await withErrorHandling(
    context,
    "Processing invoice for revenue calculation",
    async () => {
      // Get the existing revenue record for the period
      const existingRevenue = await revenueService.findByPeriod(period);

      if (existingRevenue) {
        if (isUpdate && previousAmount !== undefined) {
          // For updates, calculate the difference in amount
          const amountDifference = invoice.amount - previousAmount;

          logInfo(
            context,
            "Updating existing revenue record for updated invoice",
            {
              amountDifference,
              existingRevenue: existingRevenue.id,
              previousAmount,
              ...metadata,
            },
          );

          // Update the existing revenue record with the amount difference
          await revenueService.update(existingRevenue.id, {
            calculationSource: "invoice_event",
            // Invoice count stays the same for updates
            invoiceCount: existingRevenue.invoiceCount,
            totalAmount: existingRevenue.totalAmount + amountDifference,
          });
        } else {
          logInfo(
            context,
            "Updating the existing revenue record for a new invoice",
            {
              existingRevenue: existingRevenue.id,
              ...metadata,
            },
          );

          // Update the existing revenue record for a new invoice
          await revenueService.update(existingRevenue.id, {
            calculationSource: "invoice_event",
            invoiceCount: existingRevenue.invoiceCount + 1,
            totalAmount: existingRevenue.totalAmount + invoice.amount,
          });
        }
      } else {
        logInfo(context, "Creating a new revenue record", metadata);

        // Create a new revenue record
        await revenueService.create({
          calculationSource: "invoice_event",
          createdAt: new Date(),
          invoiceCount: 1,
          period: toPeriod(period),
          totalAmount: invoice.amount,
          updatedAt: new Date(),
        });
      }
    },
    metadata,
  );
}

/**
 * Adjusts revenue for a deleted invoice
 */
export async function adjustRevenueForDeletedInvoice(
  revenueService: RevenueService,
  invoice: InvoiceDto,
  period: Period,
): Promise<void> {
  const context = "RevenueEventHandler.adjustRevenueForDeletedInvoice";
  const metadata = {
    invoice: invoice.id,
    period: periodKey(period),
  };

  await withErrorHandling(
    context,
    "Adjusting revenue for deleted invoice",
    async () => {
      // Verify that the invoice was eligible for revenue before deletion
      if (!isStatusEligibleForRevenue(invoice.status)) {
        logInfo(
          context,
          "Deleted invoice was not eligible for revenue, no adjustment needed",
          {
            ...metadata,
            status: invoice.status,
          },
        );
        return;
      }

      if (invoice.amount <= 0) {
        logInfo(
          context,
          "Deleted invoice had an invalid amount, no adjustment needed",
          {
            ...metadata,
            amount: invoice.amount,
          },
        );
        return;
      }

      // Get the existing revenue record
      const existingRevenue = await revenueService.findByPeriod(period);

      if (!existingRevenue) {
        logInfo(
          context,
          "No existing revenue record was found for a period",
          metadata,
        );
        return;
      }

      // Calculate the new invoice count and revenue
      const newInvoiceCount = Math.max(0, existingRevenue.invoiceCount - 1);
      const newRevenue = Math.max(
        0,
        existingRevenue.totalAmount - invoice.amount,
      );

      // If there are no more invoices for this period, delete the revenue record
      if (newInvoiceCount === 0) {
        logInfo(
          context,
          "No more invoices for a period, deleting revenue record",
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
          "No existing revenue record was found for a period",
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
          "Invoice no longer eligible for revenue, removing from the total",
          metadataWithPeriod,
        );

        await updateRevenueRecord(
          revenueService,
          existingRevenue.id,
          Math.max(0, existingRevenue.invoiceCount - 1),
          Math.max(0, existingRevenue.totalAmount - previousInvoice.amount),
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
          "Invoice now eligible for revenue, adding to the total",
          metadataWithPeriod,
        );

        await updateRevenueRecord(
          revenueService,
          existingRevenue.id,
          existingRevenue.invoiceCount + 1,
          existingRevenue.totalAmount + currentInvoice.amount,
          context,
          metadataWithPeriod,
        );
      } else if (
        isStatusEligibleForRevenue(previousInvoice.status) &&
        isStatusEligibleForRevenue(currentInvoice.status) &&
        previousInvoice.amount !== currentInvoice.amount
      ) {
        // Both invoices are eligible for revenue, but the amount has changed
        logInfo(
          context,
          "Invoice amount changed while remaining eligible for revenue",
          {
            ...metadataWithPeriod,
            amountDifference: currentInvoice.amount - previousInvoice.amount,
            currentAmount: currentInvoice.amount,
            previousAmount: previousInvoice.amount,
          },
        );

        // Calculate the amount difference
        const amountDifference = currentInvoice.amount - previousInvoice.amount;

        await updateRevenueRecord(
          revenueService,
          existingRevenue.id,
          existingRevenue.invoiceCount,
          existingRevenue.totalAmount + amountDifference,
          context,
          metadataWithPeriod,
        );
      } else {
        logInfo(
          context,
          "No changes affecting revenue calculation",
          metadataWithPeriod,
        );
      }
    },
    metadata,
  );
}

/**
 * Processes an invoice event with standardized error handling
 */
export async function processInvoiceEvent(
  event: BaseInvoiceEvent,
  _revenueService: RevenueService, // TODO: Why is revenueService unused? Can I use it in a meaningful way?
  contextMethod: string,
  processor: (invoice: InvoiceDto, period: Period) => Promise<void>,
): Promise<void> {
  const context = `RevenueEventHandler.${contextMethod}`;

  try {
    logInfo(context, `Processing invoice ${contextMethod} event`, {
      eventId: event.eventId,
      invoiceId: event.invoice.id,
    });

    // Extract the invoice from the event
    const invoice = event.invoice;

    // Check if the invoice is eligible for revenue calculation
    if (!isInvoiceEligibleForRevenue(invoice, contextMethod)) {
      logInfo(
        context,
        "Invoice not eligible for revenue calculation, skipping",
        {
          eventId: event.eventId,
          invoiceId: invoice.id,
        },
      );
      return;
    }

    // Extract the period from the invoice
    const period = extractAndValidatePeriod(invoice, context, event.eventId);

    if (!period) {
      return;
    }

    // Process the invoice
    await processor(invoice, period);

    logInfo(context, `Successfully processed invoice ${contextMethod} event`, {
      eventId: event.eventId,
      invoiceId: invoice.id,
      period,
    });
  } catch (error) {
    handleEventError(context, event, error);
  }
}
