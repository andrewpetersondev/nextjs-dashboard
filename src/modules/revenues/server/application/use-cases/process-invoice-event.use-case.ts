import "server-only";
import type { InvoiceDto } from "@/modules/invoices/domain/dto";
import { checkInvoiceEligibility } from "@/modules/revenues/domain/guards/invoice-eligibility.guard";
import { withIdempotency } from "@/modules/revenues/server/application/cross-cutting/idempotency";
import {
  handleEventError,
  logInfo,
} from "@/modules/revenues/server/application/cross-cutting/logging";
import { extractAndValidatePeriodWithLogging } from "@/modules/revenues/server/application/cross-cutting/period-extraction";
import type { RevenueService } from "@/modules/revenues/server/application/services/revenue.service";
import type { BaseInvoiceEvent } from "@/server-core/events/invoice/invoice-event.types";
import type { Period } from "@/shared/branding/brands";

/**
 * Use case that standardizes processing of invoice-related events.
 *
 * It wraps common cross-cutting concerns: structured logging, idempotency,
 * eligibility checking, period extraction/validation, and error handling.
 */
export class ProcessInvoiceEventUseCase {
  async execute(
    event: BaseInvoiceEvent,
    _revenueService: RevenueService, // kept for API symmetry/future evolution
    contextMethod: string,
    processor: (invoice: InvoiceDto, period: Period) => Promise<void>,
  ): Promise<void> {
    const context = `RevenueEventHandler.${contextMethod}`;

    try {
      const { executed } = await withIdempotency(event.eventId, async () => {
        await this.processOnce(event, contextMethod);
        const invoice = event.invoice;

        // Eligibility guard
        const eligibility = checkInvoiceEligibility(invoice);
        if (!eligibility.eligible) {
          logInfo(
            context,
            `Invoice not eligible for revenue calculation: ${eligibility.reason}`,
            {
              eventId: event.eventId,
              invoiceId: invoice.id,
              reason: eligibility.reason,
            },
          );
          return;
        }

        const period = extractAndValidatePeriodWithLogging(
          invoice,
          context,
          event.eventId,
        );
        if (!period) {
          return;
        }
        await processor(invoice, period);
      });

      if (!executed) {
        //        logInfo(context, "Duplicate event detected, skipping processing", {
        //          eventId: event.eventId,
        //          invoiceId: event.invoice.id,
        //        });
      }
    } catch (error) {
      handleEventError(context, event, error);
    }
  }

  private async processOnce(
    _event: BaseInvoiceEvent,
    _contextMethod: string,
  ): Promise<void> {
    // Placeholder for future cross-cutting steps; intentionally empty to keep
    // execute() within size/complexity guidelines and for extensibility.
  }
}
