import "server-only";
import type { InvoiceDto } from "@/features/invoices/lib/dto";
import type { RevenueService } from "@/server/revenues/application/services/revenue/revenue.service";
import type {
  ChangeType,
  MetadataWithPeriod,
  PeriodArg,
} from "@/server/revenues/events/handlers/core/types";
import { handleEligibleAmountChange } from "@/server/revenues/events/handlers/handle-eligible-amount-change";
import { handleEligibleStatusChange } from "@/server/revenues/events/handlers/handle-eligible-status-change";
import { handleNoExistingRevenue } from "@/server/revenues/events/handlers/handle-no-existing-revenue";
import { handleTransitionFromEligibleToIneligible } from "@/server/revenues/events/handlers/handle-transition-from-eligible-to-ineligible";
import { handleTransitionFromIneligibleToEligible } from "@/server/revenues/events/handlers/handle-transition-from-ineligible-to-eligible";
import { logNoAffectingChanges } from "@/server/revenues/events/handlers/log-no-affecting-changes";

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <it's clean>
export async function dispatchChange(
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
