import "server-only";
import type { InvoiceDto } from "@/modules/invoices/domain/dto";
import { periodKey } from "@/modules/revenues/domain/time/period";
import {
  logInfo,
  logMissingPrevious,
  logNoRelevantChange,
} from "@/modules/revenues/server/application/cross-cutting/logging";
import { extractAndValidatePeriodWithLogging } from "@/modules/revenues/server/application/cross-cutting/period-extraction";
import type { RevenueService } from "@/modules/revenues/server/application/services/revenue.service";
import { processInvoiceUpsert } from "@/modules/revenues/server/events/shared/process-invoice-upsert";
import { detectChange } from "@/modules/revenues/server/events/updated-invoice/change-detector";
import { dispatchChange } from "@/modules/revenues/server/events/updated-invoice/change-dispatcher";
import type {
  BaseMetadata,
  CoreArgs,
  HandleAmountChangeParams,
  HandleStatusChangeParams,
  MetadataWithPeriod,
  PeriodArg,
} from "@/modules/revenues/server/events/updated-invoice/types";
import { withErrorHandling } from "@/modules/revenues/server/infrastructure/errors/error-handling";
import type { BaseInvoiceEvent } from "@/server-core/events/invoice/invoice-event.types";
import type { Period } from "@/shared/branding/brands";

/**
 * Extracts and validates the period and builds metadata with period string.
 * Returns null when the period is not derivable (policy guard).
 */
function preparePeriodAndMeta(
  currentInvoice: InvoiceDto,
  context: string,
  baseMeta: BaseMetadata,
): { readonly period: PeriodArg; readonly meta: MetadataWithPeriod } | null {
  const period = extractAndValidatePeriodWithLogging(currentInvoice, context);
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
function buildBaseMetadata(prev: InvoiceDto, curr: InvoiceDto): BaseMetadata {
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
