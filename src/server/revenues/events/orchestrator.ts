import "server-only";

import type { BaseInvoiceEvent } from "@/server/events/invoice/invoice-event.types";
import type { InvoiceDto } from "@/server/invoices/dto";
import { handleEventError, logInfo } from "@/server/revenues/events/logging";
import {
  extractAndValidatePeriod,
  isInvoiceEligibleForRevenue,
} from "@/server/revenues/events/policy";
import type { RevenueService } from "@/server/revenues/services/revenue.service";
import type { Period } from "@/shared/brands/domain-brands";

/**
 * Processes an invoice event with standardized error handling
 */
export async function processInvoiceEvent(
  event: BaseInvoiceEvent,
  _revenueService: RevenueService, // TODO: Why is revenueService unused? Can I use it in a meaningful way?
  contextMethod: string,
  processor: (invoice: InvoiceDto, period: Period) => Promise<void>,
): Promise<void> {
  const context = `RevenueEventHandler.${contextMethod}`;

  try {
    logInfo(context, `Processing invoice ${contextMethod} event`, {
      eventId: event.eventId,
      invoiceId: event.invoice.id,
    });

    // Extract the invoice from the event
    const invoice = event.invoice;

    // Check if the invoice is eligible for revenue calculation
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

    // Extract the period from the invoice
    const period = extractAndValidatePeriod(invoice, context, event.eventId);

    if (!period) {
      return;
    }

    // Process the invoice
    await processor(invoice, period);

    logInfo(context, `Successfully processed invoice ${contextMethod} event`, {
      eventId: event.eventId,
      invoiceId: invoice.id,
      period,
    });
  } catch (error) {
    handleEventError(context, event, error);
  }
}
