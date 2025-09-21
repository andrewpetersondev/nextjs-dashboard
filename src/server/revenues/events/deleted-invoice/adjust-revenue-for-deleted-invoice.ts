import "server-only";

import type { InvoiceDto } from "@/features/invoices/lib/dto";
import { periodKey } from "@/features/revenues/domain/period";
import { isEligibleDeletion } from "@/server/revenues/application/guards/invoice-eligibility.guard";
import type { RevenueService } from "@/server/revenues/application/services/revenue/revenue.service";
import { applyDeletionEffects } from "@/server/revenues/events/deleted-invoice/apply-deletion-effects";
import { withErrorHandling } from "@/server/revenues/shared/errors/error-handling";
import type { Period } from "@/shared/domain/domain-brands";

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
