import "server-only";

import type { BaseInvoiceEvent } from "@/server/events/invoice/invoice-event.types";
import { withIdempotency } from "@/server/revenues/application/idempotency";
import { extractAndValidatePeriod } from "@/server/revenues/application/invoice-period.policy";
import {
  handleEventError,
  logInfo,
} from "@/server/revenues/application/logging";
import type { RevenueService } from "@/server/revenues/application/services/revenue.service";
import { isInvoiceEligibleForRevenue } from "@/server/revenues/events/common/guards";
import type { Period } from "@/shared/brands/domain-brands";
import type { InvoiceDto } from "@/shared/invoices/dto";
import { periodKey } from "@/shared/revenues/period";

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
      logInfo(context, `Processing invoice ${contextMethod} event`, {
        eventId: event.eventId,
        invoiceId: event.invoice.id,
      });

      const { executed } = await withIdempotency(event.eventId, async () => {
        await this.processOnce(event, contextMethod);
        const invoice = event.invoice;

        // Eligibility guard
        if (!isInvoiceEligibleForRevenue(invoice, contextMethod)) {
          logInfo(
            context,
            "Invoice not eligible for revenue calculation, skipping",
            {
              eventId: event.eventId,
              invoiceId: invoice.id,
            },
          );
          return;
        }

        const period = extractAndValidatePeriod(
          invoice,
          context,
          event.eventId,
        );
        if (!period) {
          return;
        }
        await processor(invoice, period);
        logInfo(
          context,
          `Successfully processed invoice ${contextMethod} event`,
          {
            eventId: event.eventId,
            invoiceId: invoice.id,
            period: periodKey(period),
          },
        );
      });

      if (!executed) {
        logInfo(context, "Duplicate event detected, skipping processing", {
          eventId: event.eventId,
          invoiceId: event.invoice.id,
        });
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
