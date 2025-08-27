import "server-only";

import { periodKey } from "@/features/revenues/lib/date/period";
import { withErrorHandling } from "@/server/revenues/events/error-handling";
import { logInfo } from "@/server/revenues/events/logging";
import type { RevenueService } from "@/server/revenues/services/revenue.service";
import { type Period, toPeriod } from "@/shared/brands/domain-brands";
import type { InvoiceDto } from "@/shared/invoices/dto";

/**
 * Processes an invoice for revenue calculation
 */
// biome-ignore lint/nursery/useMaxParams: <fix later>
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <fix later>
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
