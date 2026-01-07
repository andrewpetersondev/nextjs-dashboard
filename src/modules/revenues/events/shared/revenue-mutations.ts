import "server-only";
import { logInfo } from "@/modules/revenues/application/cross-cutting/logging";
import type { RevenueApplicationService } from "@/modules/revenues/application/services/revenue-application.service";
import type { UpdateRevenueRecordArgs } from "@/modules/revenues/events/shared/types";
import { toRevenueId } from "@/shared/branding/converters/id-converters";

/**
 * Updates a revenue record with new values.
 */
export async function updateRevenueRecord(
  revenueService: RevenueApplicationService,
  args: UpdateRevenueRecordArgs,
): Promise<void> {
  const {
    context,
    invoiceCount,
    metadata,
    revenueId,
    totalAmount,
    totalPaidAmount,
    totalPendingAmount,
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
