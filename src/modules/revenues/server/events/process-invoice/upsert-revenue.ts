import "server-only";
import type { InvoiceDto } from "@/modules/invoices/domain/dto";
import {
  applyDeltaToBucket,
  type BucketTotals,
} from "@/modules/revenues/domain/calculations/bucket-totals.calculation";
import { isStatusEligibleForRevenue } from "@/modules/revenues/domain/guards/revenue-eligibility";
import {
  type LogMetadata,
  logInfo,
} from "@/modules/revenues/server/application/cross-cutting/logging";
import type { RevenueService } from "@/modules/revenues/server/application/services/revenue/revenue.service";
import { updateRevenueRecord } from "@/modules/revenues/server/events/process-invoice/revenue-mutations";
import type { Period } from "@/shared/branding/brands";
import { toPeriod } from "@/shared/branding/converters/id-converters";

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
    readonly totalPaidAmount: number;
    readonly totalPendingAmount: number;
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
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <it's clean>
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
  const eligible = isStatusEligibleForRevenue(invoice.status);

  let amountDelta: number;
  switch (true) {
    case eligible && isDiff:
      amountDelta = invoice.amount - (previousAmount as number);
      break;
    case eligible && !isDiff:
      amountDelta = invoice.amount;
      break;
    default:
      amountDelta = 0;
  }

  let newCount: number;
  switch (true) {
    case isDiff:
      newCount = existing.invoiceCount;
      break;
    case !isDiff && eligible:
      newCount = existing.invoiceCount + 1;
      break;
    default:
      newCount = existing.invoiceCount;
  }

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

  const currentBuckets: BucketTotals = {
    totalPaidAmount: existing.totalPaidAmount,
    totalPendingAmount: existing.totalPendingAmount,
  };

  const nextBuckets = isStatusEligibleForRevenue(invoice.status)
    ? applyDeltaToBucket(currentBuckets, invoice.status, amountDelta)
    : currentBuckets;

  await updateRevenueRecord(revenueService, {
    context,
    invoiceCount: newCount,
    metadata: { ...metadata, ...detailMeta },
    revenueId: existing.id,
    totalAmount: existing.totalAmount + amountDelta,
    totalPaidAmount: nextBuckets.totalPaidAmount,
    totalPendingAmount: nextBuckets.totalPendingAmount,
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
  invoiceCount: number;
  totalAmount: number;
  totalPaidAmount: number;
  totalPendingAmount: number;
}>;

/**
 * Creates a new revenue record for the given period with the invoice amount.
 * @internal
 */
async function createNewRevenue(options: CreateNewOptions): Promise<void> {
  const {
    revenueService,
    context,
    metadata,
    period,
    invoiceCount,
    totalAmount,
    totalPaidAmount,
    totalPendingAmount,
  } = options;
  logInfo(context, "Creating a new revenue record", metadata);
  await revenueService.create({
    calculationSource: "invoice_event",
    createdAt: new Date(),
    invoiceCount,
    period: toPeriod(period),
    totalAmount,
    totalPaidAmount,
    totalPendingAmount,
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
        totalPaidAmount: existingRevenue.totalPaidAmount,
        totalPendingAmount: existingRevenue.totalPendingAmount,
      },
      invoice,
      isUpdate,
      metadata,
      previousAmount,
      revenueService,
    });
    return;
  }

  // No existing revenue record for the period. Only create if invoice is eligible.
  if (!isStatusEligibleForRevenue(invoice.status)) {
    logInfo(
      context,
      "Invoice status not eligible for revenue; skipping create",
      metadata,
    );
    return;
  }

  const initialBuckets: BucketTotals = applyDeltaToBucket(
    { totalPaidAmount: 0, totalPendingAmount: 0 },
    invoice.status,
    invoice.amount,
  );
  await createNewRevenue({
    context,
    invoiceCount: 1,
    metadata,
    period,
    revenueService,
    totalAmount: invoice.amount,
    totalPaidAmount: initialBuckets.totalPaidAmount,
    totalPendingAmount: initialBuckets.totalPendingAmount,
  });
}
