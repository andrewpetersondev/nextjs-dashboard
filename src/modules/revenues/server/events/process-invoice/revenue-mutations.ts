import "server-only";
import { logInfo } from "@/modules/revenues/server/application/cross-cutting/logging";
import type { RevenueService } from "@/modules/revenues/server/application/services/revenue/revenue.service";
import type { UpdateRevenueArgs } from "@/modules/revenues/server/events/process-invoice/types";
import { toRevenueId } from "@/shared/branding/converters/id-converters";

/**
 * Updates a revenue record with new invoice count and revenue values
 */
export async function updateRevenueRecord(
  revenueService: RevenueService,
  args: UpdateRevenueArgs,
): Promise<void> {
  const {
    revenueId,
    invoiceCount,
    totalAmount,
    totalPaidAmount,
    totalPendingAmount,
    context,
    metadata,
  } = args;

  logInfo(context, "Updating revenue record", {
    invoiceCount,
    revenueId,
    totalAmount,
    totalPaidAmount,
    totalPendingAmount,
    ...metadata,
  });

  await revenueService.update(toRevenueId(revenueId), {
    calculationSource: "invoice_event",
    invoiceCount,
    totalAmount,
    totalPaidAmount,
    totalPendingAmount,
  });
}
