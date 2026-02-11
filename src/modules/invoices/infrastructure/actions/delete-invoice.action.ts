"use server";

import { revalidatePath } from "next/cache";
import type { InvoiceDto } from "@/modules/invoices/application/dto/invoice.dto";
import { InvoiceService } from "@/modules/invoices/application/services/invoice.service";
import { INVOICE_MSG } from "@/modules/invoices/domain/i18n/invoice-messages";
import { InvoiceRepository } from "@/modules/invoices/infrastructure/repository/invoice.repository";
import { getAppDb } from "@/server/db/db.connection";
import {
  type BaseInvoiceEvent,
  INVOICE_EVENTS,
} from "@/server/events/invoice/invoice-event.types";
import { APP_ERROR_KEYS } from "@/shared/core/errors/catalog/app-error.registry";
import { AppError } from "@/shared/core/errors/core/app-error.entity";
import { makeAppError } from "@/shared/core/errors/factories/app-error.factory";
import { Err, Ok } from "@/shared/core/results/result";
import type { Result } from "@/shared/core/results/result.types";
import { logger } from "@/shared/logging/infrastructure/logging.client";
import { ROUTES } from "@/shared/routes/routes";

/**
 * Server action to delete an invoice by string ID.
 *
 * Returns a Result\<InvoiceDto, AppError\> using the shared Result pattern.
 *
 * @param id - The invoice ID as a string
 */
export async function deleteInvoiceAction(
  id: string,
): Promise<Result<InvoiceDto, AppError>> {
  try {
    // Input validation -> return Err instead of throwing
    if (!id) {
      return Err(
        makeAppError(APP_ERROR_KEYS.validation, {
          cause: "",
          message: INVOICE_MSG.invalidId,
          metadata: {},
        }),
      );
    }
    // Dependency injection: repository -> service
    const repo: InvoiceRepository = new InvoiceRepository(getAppDb());
    const service: InvoiceService = new InvoiceService(repo);

    // Service returns a Result; forward Err or continue on Ok
    const deleteResult: Result<InvoiceDto, AppError> =
      await service.deleteInvoice(id);
    if (!deleteResult.ok) {
      logger.error(INVOICE_MSG.serviceError, {
        context: "deleteInvoiceAction",
        error: deleteResult.error,
        id,
      });
      return Err(deleteResult.error);
    }

    const invoice: InvoiceDto = deleteResult.value;

    // Publish event (may throw) and revalidate cache
    const { EventBus } = await import("@/server/events/event-bus");
    await EventBus.publish<BaseInvoiceEvent>(INVOICE_EVENTS.deleted, {
      eventId: crypto.randomUUID(),
      eventTimestamp: new Date().toISOString(),
      invoice,
      operation: "invoice_deleted",
    });

    revalidatePath(ROUTES.dashboard.root);

    return Ok(invoice);
  } catch (error: unknown) {
    logger.error(INVOICE_MSG.serviceError, {
      context: "deleteInvoiceAction",
      error,
      id,
    });

    const appError: AppError =
      error instanceof AppError
        ? error
        : makeAppError("unknown", {
            cause: "",
            message: INVOICE_MSG.serviceError,
            metadata: { error, id },
          });

    return Err(appError);
  }
}
