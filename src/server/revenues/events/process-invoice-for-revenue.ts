import "server-only";

import { periodKey } from "@/features/revenues/lib/date/period";
import { withErrorHandling } from "@/server/revenues/events/error-handling";
import { type LogMetadata, logInfo } from "@/server/revenues/events/logging";
import { updateRevenueRecord } from "@/server/revenues/events/revenue-mutations";
import type { RevenueService } from "@/server/revenues/services/revenue.service";
import { type Period, toPeriod } from "@/shared/brands/domain-brands";
import type { InvoiceDto } from "@/shared/invoices/dto";

type ProcessOptions = Readonly<{
  context?: string;
  isUpdate?: boolean;
  previousAmount?: number;
}>;

type UpsertArgs = Readonly<{
  revenueService: RevenueService;
  invoice: InvoiceDto;
  period: Period;
  context: string;
  metadata: LogMetadata;
  isUpdate: boolean;
  previousAmount?: number;
}>;

async function upsertRevenue(args: UpsertArgs): Promise<void> {
  const {
    revenueService,
    invoice,
    period,
    context,
    metadata,
    isUpdate,
    previousAmount,
  } = args;
  const existingRevenue = await revenueService.findByPeriod(period);
  if (existingRevenue) {
    const isDiff = isUpdate && previousAmount !== undefined;
    const amountDelta = isDiff
      ? invoice.amount - (previousAmount as number)
      : invoice.amount;
    const newCount = isDiff
      ? existingRevenue.invoiceCount
      : existingRevenue.invoiceCount + 1;
    const baseMeta: LogMetadata = {
      ...metadata,
      existingRevenue: existingRevenue.id,
    };
    const detailMeta: LogMetadata = isDiff
      ? {
          amountDifference: amountDelta,
          previousAmount: previousAmount as number,
        }
      : {};
    logInfo(
      context,
      isDiff
        ? "Updating existing revenue record for updated invoice"
        : "Updating the existing revenue record for a new invoice",
      { ...baseMeta, ...detailMeta },
    );
    await updateRevenueRecord(
      revenueService,
      existingRevenue.id,
      newCount,
      existingRevenue.totalAmount + amountDelta,
      context,
      metadata,
    );
    return;
  }
  logInfo(context, "Creating a new revenue record", metadata);
  await revenueService.create({
    calculationSource: "invoice_event",
    createdAt: new Date(),
    invoiceCount: 1,
    period: toPeriod(period),
    totalAmount: invoice.amount,
    updatedAt: new Date(),
  });
}

/**
 * Processes an invoice for revenue calculation
 */
export async function processInvoiceForRevenue(
  revenueService: RevenueService,
  invoice: InvoiceDto,
  period: Period,
  options?: ProcessOptions,
): Promise<void> {
  const context =
    options?.context ?? "RevenueEventHandler.processInvoiceForRevenue";
  const isUpdate = options?.isUpdate ?? false;
  const previousAmount = options?.previousAmount;
  const metadata: LogMetadata = {
    invoice: invoice.id,
    isUpdate,
    period: periodKey(period),
  };
  await withErrorHandling(
    context,
    "Processing invoice for revenue calculation",
    () =>
      upsertRevenue({
        context,
        invoice,
        isUpdate,
        metadata,
        period,
        previousAmount,
        revenueService,
      }),
    metadata,
  );
}
