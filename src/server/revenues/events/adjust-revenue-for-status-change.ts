import "server-only";

import { withErrorHandling } from "@/server/revenues/events/error-handling";
import { isStatusEligibleForRevenue } from "@/server/revenues/events/guards";
import { type LogMetadata, logInfo } from "@/server/revenues/events/logging";
import { extractAndValidatePeriod } from "@/server/revenues/events/policy";
import { processInvoiceForRevenue } from "@/server/revenues/events/process-invoice-for-revenue";
import { updateRevenueRecord } from "@/server/revenues/events/revenue-mutations";
import type { RevenueService } from "@/server/revenues/services/revenue.service";
import type { InvoiceDto } from "@/shared/invoices/dto";
import { periodKey } from "@/shared/revenues/period";

/**
 * Adjusts revenue based on invoice status changes.
 * Keeps orchestration under 50 lines by delegating to small helpers.
 */

/**
 * Arguments for the core adjustRevenueForStatusChange workflow.
 * @internal
 */
// Core logic extracted to keep exported function concise
interface CoreArgs {
  readonly baseMeta: MetadataBase;
  readonly context: string;
  readonly currentInvoice: InvoiceDto;
  readonly previousInvoice: InvoiceDto;
  readonly revenueService: RevenueService;
}

type ChangeType =
  | "eligible-to-ineligible"
  | "ineligible-to-eligible"
  | "eligible-amount-change"
  | "none";

/**
 * Detects how the invoice change affects revenue eligibility/amount.
 * @internal
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
  if (
    prevEligible &&
    currEligible &&
    previousInvoice.amount !== currentInvoice.amount
  ) {
    return "eligible-amount-change";
  }
  return "none";
}

/**
 * Extracts and validates the period and builds metadata with period string.
 * Returns null when the period is not derivable (policy guard).
 * @internal
 */
function preparePeriodAndMeta(
  currentInvoice: InvoiceDto,
  context: string,
  baseMeta: MetadataBase,
): {
  readonly period: Parameters<typeof processInvoiceForRevenue>[2];
  readonly meta: MetadataWithPeriod;
} | null {
  const period = extractAndValidatePeriod(currentInvoice, context);
  if (!period) {
    return null;
  }
  const meta: MetadataWithPeriod = { ...baseMeta, period: periodKey(period) };
  return { meta, period } as const;
}

/**
 * Dispatches handling based on the detected change type.
 * @internal
 */
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
    };
    readonly revenueService: RevenueService;
    readonly meta: MetadataWithPeriod;
    readonly period: Parameters<typeof processInvoiceForRevenue>[2];
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
      meta: {
        ...meta,
        existingCount: existingRevenue.invoiceCount,
        existingTotal: existingRevenue.totalAmount,
      },
      previousAmount: previousInvoice.amount,
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
      currentTotal: existingRevenue.totalAmount,
      meta,
      previousAmount: previousInvoice.amount,
      revenueId: existingRevenue.id,
      revenueService,
    });
    return;
  }
  logNoAffectingChanges(context, meta);
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
        }
      : undefined,
    meta,
    period,
    previousInvoice,
    revenueService,
  });
}

// ===== Internal helpers (file-local) =====

interface MetadataBase extends LogMetadata {
  readonly currentStatus: InvoiceDto["status"];
  readonly invoice: InvoiceDto["id"];
  readonly previousStatus: InvoiceDto["status"];
}

interface MetadataWithPeriod extends MetadataBase {
  readonly period: string; // periodKey string
}

function buildBaseMetadata(prev: InvoiceDto, curr: InvoiceDto): MetadataBase {
  return {
    currentStatus: curr.status,
    invoice: curr.id,
    previousStatus: prev.status,
  };
}

interface NoExistingArgs {
  readonly revenueService: RevenueService;
  readonly currentInvoice: InvoiceDto;
  readonly period: Parameters<typeof processInvoiceForRevenue>[2];
  readonly context: string;
  readonly meta: MetadataWithPeriod;
}

async function handleNoExistingRevenue(args: NoExistingArgs): Promise<void> {
  const { revenueService, currentInvoice, period, context, meta } = args;
  logInfo(context, "No existing revenue record was found for a period", meta);
  if (isStatusEligibleForRevenue(currentInvoice.status)) {
    await processInvoiceForRevenue(revenueService, currentInvoice, period, {
      context,
    });
  }
}

interface ToIneligibleArgs {
  readonly revenueService: RevenueService;
  readonly revenueId: string;
  readonly previousAmount: number;
  readonly context: string;
  readonly meta: MetadataWithPeriod & {
    readonly existingCount: number;
    readonly existingTotal: number;
  };
}

async function handleTransitionFromEligibleToIneligible(
  args: ToIneligibleArgs,
): Promise<void> {
  const { revenueService, revenueId, previousAmount, context, meta } = args;
  logInfo(
    context,
    "Invoice no longer eligible for revenue, removing from the total",
    meta,
  );
  await updateRevenueRecord(revenueService, {
    context,
    invoiceCount: Math.max(0, meta.existingCount - 1),
    metadata: meta,
    revenueId,
    totalAmount: Math.max(0, meta.existingTotal - previousAmount),
  });
}

interface ToEligibleArgs {
  readonly revenueService: RevenueService;
  readonly revenueId: string;
  readonly currentCount: number;
  readonly currentTotal: number;
  readonly currentAmount: number;
  readonly context: string;
  readonly meta: MetadataWithPeriod;
}

async function handleTransitionFromIneligibleToEligible(
  args: ToEligibleArgs,
): Promise<void> {
  const {
    revenueService,
    revenueId,
    currentCount,
    currentTotal,
    currentAmount,
    context,
    meta,
  } = args;
  logInfo(
    context,
    "Invoice now eligible for revenue, adding to the total",
    meta,
  );
  await updateRevenueRecord(revenueService, {
    context,
    invoiceCount: currentCount + 1,
    metadata: meta,
    revenueId,
    totalAmount: currentTotal + currentAmount,
  });
}

interface EligibleAmountChangeArgs {
  readonly revenueService: RevenueService;
  readonly revenueId: string;
  readonly currentCount: number;
  readonly currentTotal: number;
  readonly previousAmount: number;
  readonly currentAmount: number;
  readonly context: string;
  readonly meta: MetadataWithPeriod;
}

async function handleEligibleAmountChange(
  args: EligibleAmountChangeArgs,
): Promise<void> {
  const {
    revenueService,
    revenueId,
    currentCount,
    currentTotal,
    previousAmount,
    currentAmount,
    context,
    meta,
  } = args;
  const amountDifference = currentAmount - previousAmount;
  logInfo(
    context,
    "Invoice amount changed while remaining eligible for revenue",
    { ...meta, amountDifference, currentAmount, previousAmount },
  );
  await updateRevenueRecord(revenueService, {
    context,
    invoiceCount: currentCount,
    metadata: meta,
    revenueId,
    totalAmount: currentTotal + amountDifference,
  });
}

function logNoAffectingChanges(
  context: string,
  meta: MetadataWithPeriod,
): void {
  logInfo(context, "No changes affecting revenue calculation", meta);
}

/**
 * Adjusts revenue when an invoice's status or amount changes between two states.
 * Does not modify behavior; orchestrates calls to revenue mutations based on change detection.
 */
export async function adjustRevenueForStatusChange(
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
