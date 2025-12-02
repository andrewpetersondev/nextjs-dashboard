import "server-only";
import type { InvoiceDto } from "@/modules/invoices/domain/dto";
import { logInfo } from "@/modules/revenues/server/application/cross-cutting/logging";
import type { RevenueService } from "@/modules/revenues/server/application/services/revenue/revenue.service";
import { isStatusEligibleForRevenue } from "@/modules/revenues/server/domain/guards/revenue-eligibility";
import type {
  MetadataWithPeriod,
  PeriodArg,
} from "@/modules/revenues/server/events/handlers/core/types";
import { processInvoiceForRevenue } from "@/modules/revenues/server/events/process-invoice/process-invoice-for-revenue";

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
