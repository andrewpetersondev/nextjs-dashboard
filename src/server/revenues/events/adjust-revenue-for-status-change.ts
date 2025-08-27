import "server-only";

import type { InvoiceDto } from "@/server/invoices/dto";
import { withErrorHandling } from "@/server/revenues/events/error-handling";
import { logInfo } from "@/server/revenues/events/logging";
import {
  extractAndValidatePeriod,
  isStatusEligibleForRevenue,
} from "@/server/revenues/events/policy";
import { processInvoiceForRevenue } from "@/server/revenues/events/process-invoice-for-revenue";
import { updateRevenueRecord } from "@/server/revenues/events/revenue-mutations";
import type { RevenueService } from "@/server/revenues/services/revenue.service";

/**
 * Adjusts revenue based on invoice status changes
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <fix later>
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
    // biome-ignore lint/complexity/noExcessiveLinesPerFunction: <fix later>
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <fix later>
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
