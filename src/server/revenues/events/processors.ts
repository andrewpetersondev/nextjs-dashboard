import "server-only";

import { periodKey } from "@/features/revenues/lib/date/period";
import type { InvoiceDto } from "@/server/invoices/dto";
import { logError, logInfo } from "@/server/revenues/events/logging";
import {
  extractAndValidatePeriod,
  isStatusEligibleForRevenue,
} from "@/server/revenues/events/policy";
import type { RevenueService } from "@/server/revenues/services/revenue.service";
import {
  type Period,
  toPeriod,
  toRevenueId,
} from "@/shared/brands/domain-brands";

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
