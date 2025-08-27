"use server";

import { revalidatePath } from "next/cache";
import {
  INVOICE_ERROR_MESSAGES,
  INVOICE_SUCCESS_MESSAGES,
} from "@/features/invoices/messages";
import { getDB } from "@/server/db/connection";
import { DatabaseError_New } from "@/server/errors/infrastructure";
import {
  type BaseInvoiceEvent,
  INVOICE_EVENTS,
} from "@/server/events/invoice/invoice-event.types";
import { InvoiceRepository } from "@/server/invoices/repo";
import { InvoiceService } from "@/server/invoices/service";
import type { InvoiceActionResult } from "@/server/invoices/types";
import { logger } from "@/server/logging/logger";
import { ValidationError } from "@/shared/errors/domain";

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
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_ID, { id });
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
    revalidatePath("/dashboard");

    // Success result
    result = {
      data: invoice,
      errors: {},
      message: INVOICE_SUCCESS_MESSAGES.DELETE_SUCCESS,
      success: true,
    };
  } catch (error) {
    logger.error({
      context: "deleteInvoiceAction",
      error,
      id,
      message: INVOICE_ERROR_MESSAGES.SERVICE_ERROR,
    });

    // Error result
    result = {
      errors: {},
      message:
        error instanceof ValidationError
          ? INVOICE_ERROR_MESSAGES.INVALID_INPUT
          : error instanceof DatabaseError_New
            ? INVOICE_ERROR_MESSAGES.DB_ERROR
            : INVOICE_ERROR_MESSAGES.SERVICE_ERROR,
      success: false,
    };
  }

  return result;
}
