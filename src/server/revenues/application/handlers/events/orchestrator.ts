import "server-only";

import type { InvoiceDto } from "@/features/invoices/lib/dto";
import type { BaseInvoiceEvent } from "@/server/events/invoice/invoice-event.types";
import type { RevenueService } from "@/server/revenues/application/services/revenue/revenue.service";
import { ProcessInvoiceEventUseCase } from "@/server/revenues/application/use-cases/events/process-invoice-event.use-case";
import type { Period } from "@/shared/domain/domain-brands";

/**
 * Processes an invoice event by delegating to the ProcessInvoiceEventUseCase.
 * Kept as a thin wrapper to preserve the existing API and avoid breaking changes.
 */
export async function processInvoiceEvent(
  event: BaseInvoiceEvent,
  _revenueService: RevenueService,
  contextMethod: string,
  processor: (invoice: InvoiceDto, period: Period) => Promise<void>,
): Promise<void> {
  const useCase = new ProcessInvoiceEventUseCase();
  await useCase.execute(event, _revenueService, contextMethod, processor);
}
