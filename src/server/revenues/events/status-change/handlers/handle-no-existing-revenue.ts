import "server-only";

import { logInfo } from "@/server/revenues/application/logging";
import type { RevenueService } from "@/server/revenues/application/services/revenue.service";
import { isStatusEligibleForRevenue } from "@/server/revenues/events/common/guards";
import type {
  MetadataWithPeriod,
  PeriodArg,
} from "@/server/revenues/events/common/types";
import { processInvoiceForRevenue } from "@/server/revenues/events/process-invoice/process-invoice-for-revenue";
import type { InvoiceDto } from "@/shared/invoices/dto";

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
