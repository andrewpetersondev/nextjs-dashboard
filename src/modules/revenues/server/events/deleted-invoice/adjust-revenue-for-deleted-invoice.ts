import "server-only";
import type { InvoiceDto } from "@/modules/invoices/domain/dto";
import { isEligibleDeletion } from "@/modules/revenues/domain/guards/invoice-eligibility.guard";
import { periodKey } from "@/modules/revenues/domain/period";
import type { RevenueService } from "@/modules/revenues/server/application/services/revenue/revenue.service";
import { applyDeletionEffects } from "@/modules/revenues/server/events/deleted-invoice/apply-deletion-effects";
import { withErrorHandling } from "@/modules/revenues/server/infrastructure/errors/error-handling";
import type { Period } from "@/shared/branding/brands";

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
      if (!isEligibleDeletion(invoice, context, metadata)) {
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
