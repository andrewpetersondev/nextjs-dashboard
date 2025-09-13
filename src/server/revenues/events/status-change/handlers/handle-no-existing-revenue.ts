import "server-only";

import type { InvoiceDto } from "@/features/invoices/dto/dto";
import { logInfo } from "@/server/revenues/application/cross-cutting/logging";
import type { RevenueService } from "@/server/revenues/application/services/revenue/revenue.service";
import { isStatusEligibleForRevenue } from "@/server/revenues/domain/guards/revenue-eligibility";
import type {
  MetadataWithPeriod,
  PeriodArg,
} from "@/server/revenues/events/common/types";
import { processInvoiceForRevenue } from "@/server/revenues/events/process-invoice/process-invoice-for-revenue";

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
