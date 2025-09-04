import "server-only";

import { detectChange } from "./detect-change";
import { dispatchChange } from "./dispatch-change";
import { preparePeriodAndMeta } from "./prepare-period-and-meta";
import type { CoreArgs } from "./types";

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
        }
      : undefined,
    meta,
    period,
    previousInvoice,
    revenueService,
  });
}
