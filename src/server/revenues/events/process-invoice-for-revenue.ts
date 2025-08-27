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

function isDiffUpdate(
  isUpdate: boolean,
  previousAmount?: number,
): previousAmount is number {
  return Boolean(isUpdate && previousAmount !== undefined);
}

function buildExistingMeta(
  metadata: LogMetadata,
  revenueId: string,
): LogMetadata {
  return { ...metadata, existingRevenue: revenueId } as const;
}

type UpdateExistingOptions = Readonly<{
  revenueService: RevenueService;
  context: string;
  existing: {
    readonly id: string;
    readonly invoiceCount: number;
    readonly totalAmount: number;
  };
  invoice: InvoiceDto;
  metadata: LogMetadata;
  isUpdate: boolean;
  previousAmount?: number;
}>;

async function updateExistingRevenue(
  options: UpdateExistingOptions,
): Promise<void> {
  const {
    revenueService,
    context,
    existing,
    invoice,
    metadata,
    isUpdate,
    previousAmount,
  } = options;
  const isDiff = isDiffUpdate(isUpdate, previousAmount);
  const amountDelta = isDiff
    ? invoice.amount - (previousAmount as number)
    : invoice.amount;
  const newCount = isDiff ? existing.invoiceCount : existing.invoiceCount + 1;

  const baseMeta = buildExistingMeta(metadata, existing.id);
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

  await updateRevenueRecord(revenueService, {
    context,
    invoiceCount: newCount,
    metadata: { ...metadata, ...detailMeta },
    revenueId: existing.id,
    totalAmount: existing.totalAmount + amountDelta,
  });
}

type CreateNewOptions = Readonly<{
  revenueService: RevenueService;
  context: string;
  metadata: LogMetadata;
  period: Period;
  totalAmount: number;
}>;

async function createNewRevenue(options: CreateNewOptions): Promise<void> {
  const { revenueService, context, metadata, period, totalAmount } = options;
  logInfo(context, "Creating a new revenue record", metadata);
  await revenueService.create({
    calculationSource: "invoice_event",
    createdAt: new Date(),
    invoiceCount: 1,
    period: toPeriod(period),
    totalAmount,
    updatedAt: new Date(),
  });
}

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
    await updateExistingRevenue({
      context,
      existing: {
        id: existingRevenue.id,
        invoiceCount: existingRevenue.invoiceCount,
        totalAmount: existingRevenue.totalAmount,
      },
      invoice,
      isUpdate,
      metadata,
      previousAmount,
      revenueService,
    });
    return;
  }

  await createNewRevenue({
    context,
    metadata,
    period,
    revenueService,
    totalAmount: invoice.amount,
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
