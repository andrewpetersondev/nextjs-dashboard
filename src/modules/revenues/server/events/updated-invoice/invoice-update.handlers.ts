import "server-only";
import type { InvoiceDto } from "@/modules/invoices/domain/dto";
import {
  applyDeltaToBucket,
  moveBetweenBuckets,
} from "@/modules/revenues/domain/calculations/bucket-totals.calculation";
import {
  computeAggregateAfterAdd,
  computeAggregateAfterAmountChange,
  computeAggregateAfterRemoval,
} from "@/modules/revenues/domain/calculations/revenue-aggregate.calculation";
import { isStatusEligibleForRevenue } from "@/modules/revenues/domain/guards/revenue-eligibility";
import { periodKey } from "@/modules/revenues/domain/period";
import {
  logInfo,
  logMissingPrevious,
  logNoRelevantChange,
} from "@/modules/revenues/server/application/cross-cutting/logging";
import { extractAndValidatePeriod } from "@/modules/revenues/server/application/policies/invoice-period.policy";
import type { RevenueService } from "@/modules/revenues/server/application/services/revenue/revenue.service";
import { processInvoiceUpsert } from "@/modules/revenues/server/events/shared/process-invoice-upsert";
import { updateRevenueRecord } from "@/modules/revenues/server/events/shared/revenue-mutations";
import type {
  ChangeType,
  CoreArgs,
  HandleAmountChangeParams,
  HandleEligibleAmountChangeArgs,
  HandleEligibleStatusChangeArgs,
  HandleNoExistingRevenueArgs,
  HandleStatusChangeParams,
  HandleTransitionFromEligibleToIneligibleArgs,
  HandleTransitionFromIneligibleToEligibleArgs,
  MetadataBase,
  MetadataWithPeriod,
  PeriodArg,
} from "@/modules/revenues/server/events/updated-invoice/types";
import { withErrorHandling } from "@/modules/revenues/server/infrastructure/errors/error-handling";
import type { BaseInvoiceEvent } from "@/server-core/events/invoice/invoice-event.types";
import type { Period } from "@/shared/branding/brands";

/**
 * Detects how the invoice change affects revenue eligibility/amount.
 */
function detectChange(
  previousInvoice: InvoiceDto,
  currentInvoice: InvoiceDto,
): ChangeType {
  const prevEligible = isStatusEligibleForRevenue(previousInvoice.status);
  const currEligible = isStatusEligibleForRevenue(currentInvoice.status);
  if (prevEligible && !currEligible) {
    return "eligible-to-ineligible";
  }
  if (!prevEligible && currEligible) {
    return "ineligible-to-eligible";
  }
  // Status switched between eligible states (paid <-> pending)
  if (
    prevEligible &&
    currEligible &&
    previousInvoice.status !== currentInvoice.status
  ) {
    return "eligible-status-change";
  }
  // Same eligible status but amount changed
  if (
    prevEligible &&
    currEligible &&
    previousInvoice.amount !== currentInvoice.amount
  ) {
    return "eligible-amount-change";
  }
  return "none";
}

async function handleEligibleAmountChange(
  args: HandleEligibleAmountChangeArgs,
): Promise<void> {
  const {
    revenueService,
    revenueId,
    currentCount,
    currentTotal,
    currentPaidTotal,
    currentPendingTotal,
    previousAmount,
    currentAmount,
    currentStatus,
    context,
    meta,
  } = args;
  const amountDifference = currentAmount - previousAmount;
  const aggregate = computeAggregateAfterAmountChange(
    currentCount,
    currentTotal,
    previousAmount,
    currentAmount,
  );
  const nextBuckets = applyDeltaToBucket(
    {
      totalPaidAmount: currentPaidTotal,
      totalPendingAmount: currentPendingTotal,
    },
    currentStatus,
    amountDifference,
  );
  await updateRevenueRecord(revenueService, {
    context,
    invoiceCount: aggregate.invoiceCount,
    metadata: meta,
    revenueId,
    totalAmount: aggregate.totalAmount,
    totalPaidAmount: nextBuckets.totalPaidAmount,
    totalPendingAmount: nextBuckets.totalPendingAmount,
  });
}

/**
 * Handles switching between eligible statuses (paid <-> pending).
 * Keeps invoiceCount the same, adjusts totalAmount by the difference if any,
 * and moves value between paid/pending buckets accordingly.
 */
async function handleEligibleStatusChange(
  args: HandleEligibleStatusChangeArgs,
): Promise<void> {
  const {
    revenueService,
    revenueId,
    currentCount,
    currentTotal,
    currentPaidTotal,
    currentPendingTotal,
    previousAmount,
    currentAmount,
    previousStatus,
    currentStatus,
    context,
    meta,
  } = args;

  const amountDifference = currentAmount - previousAmount;

  logInfo(context, "Invoice status switched between eligible states", {
    ...meta,
    amountDifference,
    currentAmount,
    currentStatus,
    previousAmount,
    previousStatus,
  });

  const aggregate = computeAggregateAfterAmountChange(
    currentCount,
    currentTotal,
    previousAmount,
    currentAmount,
  );

  const nextBuckets = moveBetweenBuckets(
    {
      totalPaidAmount: currentPaidTotal,
      totalPendingAmount: currentPendingTotal,
    },
    {
      currentAmount,
      fromStatus: previousStatus,
      previousAmount,
      toStatus: currentStatus,
    },
  );

  await updateRevenueRecord(revenueService, {
    context,
    invoiceCount: aggregate.invoiceCount,
    metadata: meta,
    revenueId,
    totalAmount: aggregate.totalAmount,
    totalPaidAmount: nextBuckets.totalPaidAmount,
    totalPendingAmount: nextBuckets.totalPendingAmount,
  });
}

async function handleNoExistingRevenue(
  args: HandleNoExistingRevenueArgs,
): Promise<void> {
  const { revenueService, currentInvoice, period, context, meta } = args;
  logInfo(context, "No existing revenue record was found for a period", meta);
  if (isStatusEligibleForRevenue(currentInvoice.status)) {
    await processInvoiceUpsert(revenueService, currentInvoice, period, {
      context,
    });
  }
}

async function handleTransitionFromEligibleToIneligible(
  args: HandleTransitionFromEligibleToIneligibleArgs,
): Promise<void> {
  const {
    revenueService,
    revenueId,
    previousAmount,
    previousStatus,
    currentPaidTotal,
    currentPendingTotal,
    context,
    meta,
  } = args;
  logInfo(
    context,
    "Invoice no longer eligible for revenue, removing from the total",
    meta,
  );
  const aggregate = computeAggregateAfterRemoval(
    meta.existingCount,
    meta.existingTotal,
    previousAmount,
  );
  const nextBuckets = applyDeltaToBucket(
    {
      totalPaidAmount: currentPaidTotal,
      totalPendingAmount: currentPendingTotal,
    },
    previousStatus,
    -previousAmount,
  );
  await updateRevenueRecord(revenueService, {
    context,
    invoiceCount: aggregate.invoiceCount,
    metadata: meta,
    revenueId,
    totalAmount: aggregate.totalAmount,
    totalPaidAmount: nextBuckets.totalPaidAmount,
    totalPendingAmount: nextBuckets.totalPendingAmount,
  });
}

async function handleTransitionFromIneligibleToEligible(
  args: HandleTransitionFromIneligibleToEligibleArgs,
): Promise<void> {
  const {
    revenueService,
    revenueId,
    currentCount,
    currentTotal,
    currentPaidTotal,
    currentPendingTotal,
    currentAmount,
    currentStatus,
    context,
    meta,
  } = args;
  logInfo(
    context,
    "Invoice now eligible for revenue, adding to the total",
    meta,
  );
  const aggregate = computeAggregateAfterAdd(
    currentCount,
    currentTotal,
    currentAmount,
  );
  const nextBuckets = applyDeltaToBucket(
    {
      totalPaidAmount: currentPaidTotal,
      totalPendingAmount: currentPendingTotal,
    },
    currentStatus,
    currentAmount,
  );
  await updateRevenueRecord(revenueService, {
    context,
    invoiceCount: aggregate.invoiceCount,
    metadata: meta,
    revenueId,
    totalAmount: aggregate.totalAmount,
    totalPaidAmount: nextBuckets.totalPaidAmount,
    totalPendingAmount: nextBuckets.totalPendingAmount,
  });
}

function logNoAffectingChanges(
  context: string,
  meta: MetadataWithPeriod,
): void {
  logInfo(context, "No changes affecting revenue calculation", meta);
}

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <it's clean>
async function dispatchChange(
  change: ChangeType,
  context: string,
  args: {
    readonly previousInvoice: InvoiceDto;
    readonly currentInvoice: InvoiceDto;
    readonly existingRevenue?: {
      readonly id: string;
      readonly invoiceCount: number;
      readonly totalAmount: number;
      readonly totalPaidAmount: number;
      readonly totalPendingAmount: number;
    };
    readonly revenueService: RevenueService;
    readonly meta: MetadataWithPeriod;
    readonly period: PeriodArg;
  },
): Promise<void> {
  const {
    previousInvoice,
    currentInvoice,
    existingRevenue,
    revenueService,
    meta,
    period,
  } = args;

  if (!existingRevenue) {
    await handleNoExistingRevenue({
      context,
      currentInvoice,
      meta,
      period,
      revenueService,
    });
    return;
  }

  if (change === "eligible-to-ineligible") {
    await handleTransitionFromEligibleToIneligible({
      context,
      currentPaidTotal: existingRevenue.totalPaidAmount,
      currentPendingTotal: existingRevenue.totalPendingAmount,
      meta: {
        ...meta,
        existingCount: existingRevenue.invoiceCount,
        existingTotal: existingRevenue.totalAmount,
      },
      previousAmount: previousInvoice.amount,
      previousStatus: previousInvoice.status,
      revenueId: existingRevenue.id,
      revenueService,
    });
    return;
  }
  if (change === "ineligible-to-eligible") {
    await handleTransitionFromIneligibleToEligible({
      context,
      currentAmount: currentInvoice.amount,
      currentCount: existingRevenue.invoiceCount,
      currentPaidTotal: existingRevenue.totalPaidAmount,
      currentPendingTotal: existingRevenue.totalPendingAmount,
      currentStatus: currentInvoice.status,
      currentTotal: existingRevenue.totalAmount,
      meta,
      revenueId: existingRevenue.id,
      revenueService,
    });
    return;
  }
  if (change === "eligible-amount-change") {
    await handleEligibleAmountChange({
      context,
      currentAmount: currentInvoice.amount,
      currentCount: existingRevenue.invoiceCount,
      currentPaidTotal: existingRevenue.totalPaidAmount,
      currentPendingTotal: existingRevenue.totalPendingAmount,
      currentStatus: currentInvoice.status,
      currentTotal: existingRevenue.totalAmount,
      meta,
      previousAmount: previousInvoice.amount,
      revenueId: existingRevenue.id,
      revenueService,
    });
    return;
  }
  if (change === "eligible-status-change") {
    await handleEligibleStatusChange({
      context,
      currentAmount: currentInvoice.amount,
      currentCount: existingRevenue.invoiceCount,
      currentPaidTotal: existingRevenue.totalPaidAmount,
      currentPendingTotal: existingRevenue.totalPendingAmount,
      currentStatus: currentInvoice.status,
      currentTotal: existingRevenue.totalAmount,
      meta,
      previousAmount: previousInvoice.amount,
      previousStatus: previousInvoice.status,
      revenueId: existingRevenue.id,
      revenueService,
    });
    return;
  }
  logNoAffectingChanges(context, meta);
}

/**
 * Extracts and validates the period and builds metadata with period string.
 * Returns null when the period is not derivable (policy guard).
 */
function preparePeriodAndMeta(
  currentInvoice: InvoiceDto,
  context: string,
  baseMeta: MetadataBase,
): { readonly period: PeriodArg; readonly meta: MetadataWithPeriod } | null {
  const period = extractAndValidatePeriod(currentInvoice, context);
  if (!period) {
    return null;
  }
  const meta: MetadataWithPeriod = { ...baseMeta, period: periodKey(period) };
  return { meta, period } as const;
}

async function adjustRevenueForStatusChangeCore(args: CoreArgs): Promise<void> {
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

async function handleStatusChange({
  context,
  eventId,
  previousInvoice,
  currentInvoice,
  revenueService,
}: HandleStatusChangeParams): Promise<void> {
  logInfo(context, "Invoice status changed, adjusting revenue", {
    currentStatus: currentInvoice.status,
    eventId,
    invoiceId: currentInvoice.id,
    previousStatus: previousInvoice.status,
  });
  await adjustRevenueForStatusChange(
    revenueService,
    previousInvoice,
    currentInvoice,
  );
}

async function handleAmountChange({
  context,
  previousAmount,
  invoice,
  period,
  revenueService,
}: HandleAmountChangeParams): Promise<void> {
  await processInvoiceUpsert(revenueService, invoice, period, {
    context,
    isUpdate: true,
    previousAmount,
  });
}

async function adjustRevenueForStatusChange(
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

/**
 * Core logic for processing an invoice update within processInvoiceEvent callback.
 * Extracted from RevenueEventHandler to keep the class concise.
 */
export async function processInvoiceUpdated(
  event: BaseInvoiceEvent,
  invoice: InvoiceDto,
  period: Period,
  revenueService: RevenueService,
): Promise<void> {
  const context = "RevenueEventHandler.handleInvoiceUpdated";
  const previousInvoice = event.previousInvoice;

  if (!previousInvoice) {
    logMissingPrevious(context, event.eventId, invoice.id);
    return;
  }

  if (previousInvoice.status !== invoice.status) {
    await handleStatusChange({
      context,
      currentInvoice: invoice,
      eventId: event.eventId,
      previousInvoice,
      revenueService,
    });
    return;
  }

  if (previousInvoice.amount !== invoice.amount) {
    await handleAmountChange({
      context,
      invoice,
      period,
      previousAmount: previousInvoice.amount,
      revenueService,
    });
    return;
  }

  logNoRelevantChange(context, event.eventId, invoice.id);
}
