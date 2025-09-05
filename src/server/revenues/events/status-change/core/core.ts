import "server-only";

import type { CoreArgs } from "@/server/revenues/events/common/types";
import { detectChange } from "@/server/revenues/events/status-change/core/detect-change";
import { dispatchChange } from "@/server/revenues/events/status-change/core/dispatch-change";
import { preparePeriodAndMeta } from "@/server/revenues/events/status-change/core/prepare-period-and-meta";

export async function adjustRevenueForStatusChangeCore(
  args: CoreArgs,
): Promise<void> {
  const { revenueService, previousInvoice, currentInvoice, context, baseMeta } =
    args;

  const prepared = preparePeriodAndMeta(currentInvoice, context, baseMeta);
  if (!prepared) {
    return;
  }
  const { period, meta } = prepared;

  const existingRevenue = await revenueService.findByPeriod(period);
  const change = detectChange(previousInvoice, currentInvoice);

  await dispatchChange(change, context, {
    currentInvoice,
    existingRevenue: existingRevenue
      ? {
          id: existingRevenue.id,
          invoiceCount: existingRevenue.invoiceCount,
          totalAmount: existingRevenue.totalAmount,
          totalPaidAmount: existingRevenue.totalPaidAmount,
          totalPendingAmount: existingRevenue.totalPendingAmount,
        }
      : undefined,
    meta,
    period,
    previousInvoice,
    revenueService,
  });
}
