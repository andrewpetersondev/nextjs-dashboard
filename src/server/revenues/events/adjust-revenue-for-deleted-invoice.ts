import "server-only";

import { periodKey } from "@/features/revenues/lib/date/period";
import { withErrorHandling } from "@/server/revenues/events/error-handling";
import { type LogMetadata, logInfo } from "@/server/revenues/events/logging";
import { isStatusEligibleForRevenue } from "@/server/revenues/events/policy";
import { updateRevenueRecord } from "@/server/revenues/events/revenue-mutations";
import type { RevenueService } from "@/server/revenues/services/revenue.service";
import type { Period } from "@/shared/brands/domain-brands";
import type { InvoiceDto } from "@/shared/invoices/dto";

/**
 * Immutable metadata bag passed to logging and error handlers.
 */
type Metadata = LogMetadata;

/**
 * Options required to apply deletion effects to revenue records.
 */
type ApplyDeletionOptions = Readonly<{
  revenueService: RevenueService;
  invoice: InvoiceDto;
  period: Period;
  context: string;
  metadata: Metadata;
}>;

function isEligibleDeletion(
  invoice: InvoiceDto,
  context: string,
  metadata: Metadata,
): boolean {
  if (!isStatusEligibleForRevenue(invoice.status)) {
    logInfo(
      context,
      "Deleted invoice was not eligible for revenue, no adjustment needed",
      { ...metadata, status: invoice.status },
    );
    return false;
  }
  if (invoice.amount <= 0) {
    logInfo(
      context,
      "Deleted invoice had an invalid amount, no adjustment needed",
      { ...metadata, amount: invoice.amount },
    );
    return false;
  }
  return true;
}

async function applyDeletionEffects(
  options: ApplyDeletionOptions,
): Promise<void> {
  const { revenueService, invoice, period, context, metadata } = options;
  const existingRevenue = await revenueService.findByPeriod(period);
  if (!existingRevenue) {
    logInfo(
      context,
      "No existing revenue record was found for a period",
      metadata,
    );
    return;
  }
  const newInvoiceCount = Math.max(0, existingRevenue.invoiceCount - 1);
  const newRevenue = Math.max(0, existingRevenue.totalAmount - invoice.amount);
  if (newInvoiceCount === 0) {
    logInfo(context, "No more invoices for a period, deleting revenue record", {
      ...metadata,
      revenueId: existingRevenue.id,
    });
    await revenueService.delete(existingRevenue.id);
    return;
  }
  await updateRevenueRecord(revenueService, {
    context,
    invoiceCount: newInvoiceCount,
    metadata,
    revenueId: existingRevenue.id,
    totalAmount: newRevenue,
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
      if (!isEligibleDeletion(invoice, context, metadata)) return;
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
