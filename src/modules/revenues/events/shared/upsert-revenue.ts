import "server-only";
import {
  type LogMetadata,
  logInfo,
} from "@/modules/revenues/application/cross-cutting/logging";
import {
  applyDeltaToBucket,
  type BucketTotals,
} from "@/modules/revenues/domain/calculations/bucket-totals";
import { checkStatusEligibleForRevenue } from "@/modules/revenues/domain/guards/revenue-eligibility.guard";
import { updateRevenueRecord } from "@/modules/revenues/events/shared/revenue-mutations";
import type {
  CreateRevenueArgs,
  UpdateExistingRevenueArgs,
  UpsertRevenueArgs,
} from "@/modules/revenues/events/shared/types";
import { toPeriod } from "@/shared/branding/converters/id-converters";

/**
 * Checks if this is a diff update operation.
 */
function isDiffUpdate(
  isUpdate: boolean,
  previousAmount?: number,
): previousAmount is number {
  return Boolean(isUpdate && previousAmount !== undefined);
}

/**
 * Builds metadata including existing revenue ID.
 */
function buildExistingMetadata(
  metadata: LogMetadata,
  revenueId: string,
): LogMetadata {
  return { ...metadata, existingRevenue: revenueId } as const;
}

/**
 * Computes the amount delta for the update.
 */
function computeAmountDelta(
  eligible: boolean,
  isDiff: boolean,
  currentAmount: number,
  previousAmount?: number,
): number {
  if (!eligible) {
    return 0;
  }
  if (isDiff && previousAmount !== undefined) {
    return currentAmount - previousAmount;
  }
  return isDiff ? 0 : currentAmount;
}

/**
 * Computes the new invoice count.
 */
function computeInvoiceCount(
  existingCount: number,
  isDiff: boolean,
  eligible: boolean,
): number {
  if (isDiff) {
    return existingCount;
  }
  return eligible ? existingCount + 1 : existingCount;
}

/**
 * Creates a new revenue record.
 */
async function createNewRevenue(args: CreateRevenueArgs): Promise<void> {
  const {
    context,
    invoiceCount,
    metadata,
    period,
    revenueService,
    totalAmount,
    totalPaidAmount,
    totalPendingAmount,
  } = args;

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
 * Updates an existing revenue record.
 */
async function updateExistingRevenue(
  args: UpdateExistingRevenueArgs,
): Promise<void> {
  const {
    context,
    existing,
    invoice,
    isUpdate,
    metadata,
    previousAmount,
    revenueService,
  } = args;

  const isDiff = isDiffUpdate(isUpdate, previousAmount);
  const eligible = checkStatusEligibleForRevenue(invoice.status);
  const amountDelta = computeAmountDelta(
    eligible,
    isDiff,
    invoice.amount,
    previousAmount,
  );
  const newCount = computeInvoiceCount(existing.invoiceCount, isDiff, eligible);

  const baseMeta = buildExistingMetadata(metadata, existing.id);
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
      : "Updating existing revenue record for new invoice",
    { ...baseMeta, ...detailMeta },
  );

  const currentBuckets: BucketTotals = {
    totalPaidAmount: existing.totalPaidAmount,
    totalPendingAmount: existing.totalPendingAmount,
  };

  const nextBuckets = eligible
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
 * Upserts a revenue record for the invoice's period.
 */
export async function upsertRevenue(args: UpsertRevenueArgs): Promise<void> {
  const {
    context,
    invoice,
    isUpdate,
    metadata,
    period,
    previousAmount,
    revenueService,
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

  if (!checkStatusEligibleForRevenue(invoice.status)) {
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
