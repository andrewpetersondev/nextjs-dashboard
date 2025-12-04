"use server";

import { revalidatePath } from "next/cache";
import type { InvoiceActionResult } from "@/modules/invoices/domain/types";
import { INVOICE_MSG } from "@/modules/invoices/lib/i18n/invoice-messages";
import { InvoiceService } from "@/modules/invoices/server/application/services/invoice.service";
import { toInvoiceErrorMessage } from "@/modules/invoices/server/application/utils/error-messages";
import { InvoiceRepository } from "@/modules/invoices/server/infrastructure/repository/repository";
import { getAppDb } from "@/server-core/db/db.connection";
import {
  type BaseInvoiceEvent,
  INVOICE_EVENTS,
} from "@/server-core/events/invoice/invoice-event.types";
import { AppError } from "@/shared/errors/core/app-error.class";
import { logger } from "@/shared/logging/infrastructure/logging.client";
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
      throw new AppError("validation", {
        message: INVOICE_MSG.invalidId,
        metadata: { id },
      });
    }

    // Dependency injection: pass repository to service
    const repo = new InvoiceRepository(getAppDb());
    // Create service instance with injected repository
    const service = new InvoiceService(repo);
    // Call service with validated ID to delete the invoice
    const deleteResult = await service.deleteInvoice(id);
    if (!deleteResult.ok) {
      throw deleteResult.error;
    }
    const invoice = deleteResult.value;

    // Emit base event with all context.
    const { EventBus } = await import("@/server-core/events/event-bus");
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
