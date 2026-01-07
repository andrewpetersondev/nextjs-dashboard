import "server-only";
import type { InvoiceDto } from "@/modules/invoices/application/dto/invoice.dto";
import type { RevenueService } from "@/modules/revenues/application/services/revenue.service";
import { applyDeltaToBucket } from "@/modules/revenues/domain/calculations/bucket-totals";
import { computeAggregateAfterRemoval } from "@/modules/revenues/domain/calculations/revenue-aggregate";
import { checkDeletionEligibility } from "@/modules/revenues/domain/guards/invoice-eligibility.guard";
import { periodKey } from "@/modules/revenues/domain/time/period";
import type { ApplyDeletionEffectsArgs } from "@/modules/revenues/events/deleted-invoice/types";
import { updateRevenueRecord } from "@/modules/revenues/events/shared/revenue-mutations";
import { withErrorHandling } from "@/modules/revenues/infrastructure/errors/error-handling";
import type { Period } from "@/shared/branding/brands";

/**
 * Applies deletion effects to revenue records.
 */
async function applyDeletionEffects(
  args: ApplyDeletionEffectsArgs,
): Promise<void> {
  const { context, invoice, metadata, period, revenueService } = args;

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
 * Adjusts revenue for a deleted invoice.
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
