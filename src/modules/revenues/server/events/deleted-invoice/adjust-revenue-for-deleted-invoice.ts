import "server-only";
import type { InvoiceDto } from "@/modules/invoices/domain/dto";
import { applyDeltaToBucket } from "@/modules/revenues/domain/calculations/bucket-totals";
import { computeAggregateAfterRemoval } from "@/modules/revenues/domain/calculations/revenue-aggregate";
import { checkDeletionEligibility } from "@/modules/revenues/domain/guards/invoice-eligibility.guard";
import { periodKey } from "@/modules/revenues/domain/time/period";
import type { RevenueService } from "@/modules/revenues/server/application/services/revenue.service";
import type { ApplyDeletionOptions } from "@/modules/revenues/server/events/deleted-invoice/types";
import { updateRevenueRecord } from "@/modules/revenues/server/events/shared/revenue-mutations";
import { withErrorHandling } from "@/modules/revenues/server/infrastructure/errors/error-handling";
import type { Period } from "@/shared/branding/brands";

/**
 * Applies deletion effects to revenue records.
 * - If there is no existing revenue record for the period, it logs a message and returns.
 * - If there is an existing revenue record, it updates the invoice count and revenue amount accordingly.
 */
async function applyDeletionEffects(
  options: ApplyDeletionOptions,
): Promise<void> {
  const { revenueService, invoice, period, context, metadata } = options;
  const existingRevenue = await revenueService.findByPeriod(period);
  if (!existingRevenue) {
    return;
  }
  const aggregate = computeAggregateAfterRemoval(
    existingRevenue.invoiceCount,
    existingRevenue.totalAmount,
    invoice.amount,
  );
  if (aggregate.invoiceCount === 0) {
    await revenueService.delete(existingRevenue.id);
    return;
  }
  const nextBuckets = applyDeltaToBucket(
    {
      totalPaidAmount: existingRevenue.totalPaidAmount,
      totalPendingAmount: existingRevenue.totalPendingAmount,
    },
    invoice.status,
    -invoice.amount,
  );
  await updateRevenueRecord(revenueService, {
    context,
    invoiceCount: aggregate.invoiceCount,
    metadata,
    revenueId: existingRevenue.id,
    totalAmount: aggregate.totalAmount,
    totalPaidAmount: nextBuckets.totalPaidAmount,
    totalPendingAmount: nextBuckets.totalPendingAmount,
  });
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
  const metadata = { invoice: invoice.id, period: periodKey(period) } as const;
  await withErrorHandling(
    context,
    "Adjusting revenue for deleted invoice",
    async () => {
      const eligibility = checkDeletionEligibility(invoice);
      if (!eligibility.eligible) {
        // Log the reason why it was skipped, preserving original logging intent
        /* logInfo(context, eligibility.reason, { ...metadata }); */
        return;
      }
      await applyDeletionEffects({
        context,
        invoice,
        metadata,
        period,
        revenueService,
      });
    },
    metadata,
  );
}
