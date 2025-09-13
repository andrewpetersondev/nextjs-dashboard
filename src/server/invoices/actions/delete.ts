"use server";

import { revalidatePath } from "next/cache";
import { getDB } from "@/server/db/connection";
import { toInvoiceErrorMessage } from "@/server/errors/to-invoice-error-message";
import {
  type BaseInvoiceEvent,
  INVOICE_EVENTS,
} from "@/server/events/invoice/invoice-event.types";
import { InvoiceRepository } from "@/server/invoices/repo";
import { InvoiceService } from "@/server/invoices/service";
import type { InvoiceActionResult } from "@/server/invoices/types";
import { serverLogger } from "@/server/logging/serverLogger";
import { ROUTES } from "@/shared/constants/routes";
import { ValidationError } from "@/shared/core/errors/domain";
import { INVOICE_MSG } from "@/shared/messages";

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
      throw new ValidationError(INVOICE_MSG.INVALID_ID, { id });
    }

    // Dependency injection: pass repository to service
    const repo = new InvoiceRepository(getDB());
    // Create service instance with injected repository
    const service = new InvoiceService(repo);
    // Call service with validated ID to delete the invoice
    const invoice = await service.deleteInvoice(id);

    // Emit base event with all context.
    const { EventBus } = await import("@/server/events/event-bus");
    await EventBus.publish<BaseInvoiceEvent>(INVOICE_EVENTS.DELETED, {
      eventId: crypto.randomUUID(),
      eventTimestamp: new Date().toISOString(),
      invoice,
      operation: "invoice_deleted",
    });

    // Invalidate dashboard cache so revenue chart updates
    revalidatePath(ROUTES.DASHBOARD.ROOT);

    // Success result
    result = {
      data: invoice,
      errors: {},
      message: INVOICE_MSG.DELETE_SUCCESS,
      success: true,
    };
  } catch (error) {
    serverLogger.error({
      context: "deleteInvoiceAction",
      error,
      id,
      message: INVOICE_MSG.SERVICE_ERROR,
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
