import "server-only";

import type { RevenueService } from "@/server/revenues/application/services/revenue.service";
import type {
  ChangeType,
  MetadataWithPeriod,
  PeriodArg,
} from "@/server/revenues/events/common/types";
import { handleEligibleAmountChange } from "@/server/revenues/events/status-change/handlers/handle-eligible-amount-change";
import { handleNoExistingRevenue } from "@/server/revenues/events/status-change/handlers/handle-no-existing-revenue";
import { handleTransitionFromEligibleToIneligible } from "@/server/revenues/events/status-change/handlers/handle-transition-from-eligible-to-ineligible";
import { handleTransitionFromIneligibleToEligible } from "@/server/revenues/events/status-change/handlers/handle-transition-from-ineligible-to-eligible";
import { logNoAffectingChanges } from "@/server/revenues/events/status-change/handlers/log-no-affecting-changes";
import type { InvoiceDto } from "@/shared/invoices/dto";

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
