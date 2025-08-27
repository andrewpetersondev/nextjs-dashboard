import "server-only";

import { logInfo } from "@/server/revenues/events/logging";
import type { RevenueService } from "@/server/revenues/services/revenue.service";
import { toRevenueId } from "@/shared/brands/domain-brands";

/**
 * Updates a revenue record with new invoice count and revenue values
 */
// biome-ignore lint/nursery/useMaxParams: <fix later>
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
