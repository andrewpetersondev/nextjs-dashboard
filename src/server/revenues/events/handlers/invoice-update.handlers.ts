import "server-only";

import type { BaseInvoiceEvent } from "@/server/events/invoice/invoice-event.types";
import { adjustRevenueForStatusChange } from "@/server/revenues/events/adjust-revenue-for-status-change";
import {
  logInfo,
  logMissingPrevious,
  logNoRelevantChange,
} from "@/server/revenues/events/logging";
import { processInvoiceForRevenue } from "@/server/revenues/events/process-invoice-for-revenue";
import type { RevenueService } from "@/server/revenues/services/revenue.service";
import type { Period } from "@/shared/brands/domain-brands";
import type { InvoiceDto } from "@/shared/invoices/dto";

type HandleStatusChangeParams = Readonly<{
  context: string;
  eventId: string;
  previousInvoice: InvoiceDto;
  currentInvoice: InvoiceDto;
  revenueService: RevenueService;
}>;

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

type HandleAmountChangeParams = Readonly<{
  context: string;
  previousAmount: number;
  invoice: InvoiceDto;
  period: Period;
  revenueService: RevenueService;
}>;

async function handleAmountChange({
  context,
  previousAmount,
  invoice,
  period,
  revenueService,
}: HandleAmountChangeParams): Promise<void> {
  await processInvoiceForRevenue(revenueService, invoice, period, {
    context,
    isUpdate: true,
    previousAmount,
  });
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
