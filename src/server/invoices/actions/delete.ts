"use server";

import { revalidatePath } from "next/cache";
import { getAppDb } from "@/server/db/db.connection";
import {
  type BaseInvoiceEvent,
  INVOICE_EVENTS,
} from "@/server/events/invoice/invoice-event.types";
import { InvoiceRepository } from "@/server/invoices/repo";
import { InvoiceService } from "@/server/invoices/service";
import { toInvoiceErrorMessage } from "@/server/invoices/to-invoice-error-message";
import type { InvoiceActionResult } from "@/server/invoices/types";
import { BaseError } from "@/shared/errors/base-error";
import { INVOICE_MSG } from "@/shared/i18n/messages/invoice-messages";
import { logger } from "@/shared/logging/logger.shared";
import { ROUTES } from "@/shared/routes/routes";

/**
 * Server action to delete an invoice by string ID.
 * @param id - The invoice ID as a string
 * @returns InvoiceActionResultGeneric with data, errors, message, and success
 */
export async function deleteInvoiceAction(
  id: string,
): Promise<InvoiceActionResult> {
  let result: InvoiceActionResult;

  try {
    // Basic validation of input. Throw to catch block.
    if (!id) {
      throw new BaseError("validation", {
        context: { id },
        message: INVOICE_MSG.invalidId,
      });
    }

    // Dependency injection: pass repository to service
    const repo = new InvoiceRepository(getAppDb());
    // Create service instance with injected repository
    const service = new InvoiceService(repo);
    // Call service with validated ID to delete the invoice
    const invoice = await service.deleteInvoice(id);

    // Emit base event with all context.
    const { EventBus } = await import("@/server/events/event-bus");
    await EventBus.publish<BaseInvoiceEvent>(INVOICE_EVENTS.deleted, {
      eventId: crypto.randomUUID(),
      eventTimestamp: new Date().toISOString(),
      invoice,
      operation: "invoice_deleted",
    });

    // Invalidate dashboard cache so revenue chart updates
    revalidatePath(ROUTES.dashboard.root);

    // Success result
    result = {
      data: invoice,
      errors: {},
      message: INVOICE_MSG.deleteSuccess,
      success: true,
    };
  } catch (error) {
    logger.error(INVOICE_MSG.serviceError, {
      context: "deleteInvoiceAction",
      error,
      id,
    });

    const message = toInvoiceErrorMessage(error);

    result = {
      errors: {},
      message,
      success: false,
    };
  }

  return result;
}
