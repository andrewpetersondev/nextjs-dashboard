import "server-only";
import { logInfo } from "@/modules/revenues/server/application/cross-cutting/logging";
import { handleEligibleAmountChange } from "@/modules/revenues/server/events/updated-invoice/handlers/eligible-amount-change.handler";
import { handleEligibleStatusChange } from "@/modules/revenues/server/events/updated-invoice/handlers/eligible-status-change.handler";
import { handleEligibleToIneligible } from "@/modules/revenues/server/events/updated-invoice/handlers/eligible-to-ineligible.handler";
import { handleIneligibleToEligible } from "@/modules/revenues/server/events/updated-invoice/handlers/ineligible-to-eligible.handler";
import { handleNoExistingRevenue } from "@/modules/revenues/server/events/updated-invoice/handlers/no-existing-revenue.handler";
import type {
  ChangeType,
  DispatchChangeArgs,
} from "@/modules/revenues/server/events/updated-invoice/types";

/**
 * Dispatches change processing to appropriate handler.
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <good for now>
export async function dispatchChange(
  change: ChangeType,
  context: string,
  args: DispatchChangeArgs,
): Promise<void> {
  const {
    currentInvoice,
    existingRevenue,
    meta,
    period,
    previousInvoice,
    revenueService,
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
    await handleEligibleToIneligible({
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
    await handleIneligibleToEligible({
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

  logInfo(context, "No changes affecting revenue calculation", meta);
}
