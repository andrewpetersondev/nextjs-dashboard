import "server-only";

import { periodKey } from "@/features/revenues/lib/date/period";
import { withErrorHandling } from "@/server/revenues/events/error-handling";
import { logInfo } from "@/server/revenues/events/logging";
import { isStatusEligibleForRevenue } from "@/server/revenues/events/policy";
import { updateRevenueRecord } from "@/server/revenues/events/revenue-mutations";
import type { RevenueService } from "@/server/revenues/services/revenue.service";
import type { Period } from "@/shared/brands/domain-brands";
import type { InvoiceDto } from "@/shared/invoices/dto";

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
