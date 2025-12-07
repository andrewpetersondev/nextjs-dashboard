import "server-only";
import type { InvoiceDto } from "@/modules/invoices/domain/dto";
import type { RevenueService } from "@/modules/revenues/server/application/services/revenue/revenue.service";
import { detectChange } from "@/modules/revenues/server/events/updated-invoice/detect-change";
import { dispatchChange } from "@/modules/revenues/server/events/updated-invoice/dispatch-change";
import { preparePeriodAndMeta } from "@/modules/revenues/server/events/updated-invoice/prepare-period-and-meta";
import type { MetadataBase } from "@/modules/revenues/server/events/updated-invoice/types";

export interface CoreArgs {
  readonly baseMeta: MetadataBase;
  readonly context: string;
  readonly currentInvoice: InvoiceDto;
  readonly previousInvoice: InvoiceDto;
  readonly revenueService: RevenueService;
}

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
