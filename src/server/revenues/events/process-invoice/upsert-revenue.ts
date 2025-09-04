import "server-only";

import {
  type LogMetadata,
  logInfo,
} from "@/server/revenues/application/logging";
import type { RevenueService } from "@/server/revenues/application/services/revenue.service";
import { updateRevenueRecord } from "@/server/revenues/events/process-invoice/revenue-mutations";
import type { Period } from "@/shared/brands/domain-brands";
import { toPeriod } from "@/shared/brands/mappers";
import type { InvoiceDto } from "@/shared/invoices/dto";

/**
 * Type guard indicating whether we are updating an existing invoice amount (diff update).
 * @internal
 */
function isDiffUpdate(
  isUpdate: boolean,
  previousAmount?: number,
): previousAmount is number {
  return Boolean(isUpdate && previousAmount !== undefined);
}

/**
 * Creates metadata pointing to an existing revenue record for logging/observability.
 * @internal
 */
function buildExistingMeta(
  metadata: LogMetadata,
  revenueId: string,
): LogMetadata {
  return { ...metadata, existingRevenue: revenueId } as const;
}

/**
 * Options for updating an existing revenue record when processing an invoice.
 * @internal
 */
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

/**
 * Updates an existing revenue record either by adding a new invoice or diffing an updated one.
 * @internal
 */
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

/**
 * Options for creating a brand new revenue record for a period.
 * @internal
 */
type CreateNewOptions = Readonly<{
  revenueService: RevenueService;
  context: string;
  metadata: LogMetadata;
  period: Period;
  totalAmount: number;
}>;

/**
 * Creates a new revenue record for the given period with the invoice amount.
 * @internal
 */
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

/**
 * Arguments used when upserting a revenue record for a given period.
 * @internal
 */
export type UpsertArgs = Readonly<{
  context: string;
  invoice: InvoiceDto;
  isUpdate: boolean;
  metadata: LogMetadata;
  period: Period;
  previousAmount?: number;
  revenueService: RevenueService;
}>;

/**
 * Upserts a revenue record for the invoice's period, updating if it exists or creating otherwise.
 * @internal
 */
export async function upsertRevenue(args: UpsertArgs): Promise<void> {
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
