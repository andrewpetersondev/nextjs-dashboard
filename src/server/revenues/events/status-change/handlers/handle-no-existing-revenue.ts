import "server-only";

import { isStatusEligibleForRevenue } from "@/server/revenues/events/guards";
import { logInfo } from "@/server/revenues/events/logging";
import { processInvoiceForRevenue } from "@/server/revenues/events/process-invoice-for-revenue";
import type { RevenueService } from "@/server/revenues/services/revenue.service";
import type { InvoiceDto } from "@/shared/invoices/dto";
import type { MetadataWithPeriod, PeriodArg } from "../types";

interface Args {
  readonly revenueService: RevenueService;
  readonly currentInvoice: InvoiceDto;
  readonly period: PeriodArg;
  readonly context: string;
  readonly meta: MetadataWithPeriod;
}

export async function handleNoExistingRevenue(args: Args): Promise<void> {
  const { revenueService, currentInvoice, period, context, meta } = args;
  logInfo(context, "No existing revenue record was found for a period", meta);
  if (isStatusEligibleForRevenue(currentInvoice.status)) {
    await processInvoiceForRevenue(revenueService, currentInvoice, period, {
      context,
    });
  }
}
