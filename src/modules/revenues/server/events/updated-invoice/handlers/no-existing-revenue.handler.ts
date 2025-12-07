import "server-only";
import { checkStatusEligibleForRevenue } from "@/modules/revenues/domain/guards/revenue-eligibility.guard";
import { logInfo } from "@/modules/revenues/server/application/cross-cutting/logging";
import { processInvoiceUpsert } from "@/modules/revenues/server/events/shared/process-invoice-upsert";
import type { HandleNoExistingRevenueArgs } from "@/modules/revenues/server/events/updated-invoice/types";

/**
 * Handles cases where no existing revenue record is found.
 */
export async function handleNoExistingRevenue(
  args: HandleNoExistingRevenueArgs,
): Promise<void> {
  const { context, currentInvoice, meta, period, revenueService } = args;

  logInfo(context, "No existing revenue record was found for a period", meta);
  if (checkStatusEligibleForRevenue(currentInvoice.status)) {
    await processInvoiceUpsert(revenueService, currentInvoice, period, {
      context,
    });
  }
}
