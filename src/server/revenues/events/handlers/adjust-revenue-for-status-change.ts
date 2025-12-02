import "server-only";
import type { InvoiceDto } from "@/features/invoices/domain/dto";
import type { RevenueService } from "@/server/revenues/application/services/revenue/revenue.service";
import { adjustRevenueForStatusChangeCore } from "@/server/revenues/events/handlers/core/core";
import type { MetadataBase } from "@/server/revenues/events/handlers/core/types";
import { withErrorHandling } from "@/server/revenues/infrastructure/errors/error-handling";

/**
 * Adjusts revenue when an invoice's status or amount changes between two states.
 * Thin orchestrator that delegates to status-change/core. No behavior changes.
 */

function buildBaseMetadata(prev: InvoiceDto, curr: InvoiceDto): MetadataBase {
  return {
    currentStatus: curr.status,
    invoice: curr.id,
    previousStatus: prev.status,
  };
}

export async function adjustRevenueForStatusChange(
  revenueService: RevenueService,
  previousInvoice: InvoiceDto,
  currentInvoice: InvoiceDto,
): Promise<void> {
  const context = "RevenueEventHandler.adjustRevenueForStatusChange";
  const baseMeta = buildBaseMetadata(previousInvoice, currentInvoice);

  await withErrorHandling(
    context,
    "Adjusting revenue for status change",
    async () => {
      await adjustRevenueForStatusChangeCore({
        baseMeta,
        context,
        currentInvoice,
        previousInvoice,
        revenueService,
      });
    },
    baseMeta,
  );
}
