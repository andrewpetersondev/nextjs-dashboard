"use server";
import { revalidatePath } from "next/cache";
import { INVOICE_MSG } from "@/modules/invoices/domain/i18n/invoice-messages";
import type { InvoiceDto } from "@/modules/invoices/domain/invoice.dto";
import {
  type UpdateInvoiceFieldNames,
  type UpdateInvoiceOutput,
  UpdateInvoiceSchema,
} from "@/modules/invoices/domain/schema/invoice.schema";
import { InvoiceService } from "@/modules/invoices/server/application/services/invoice.service";
import { InvoiceRepository } from "@/modules/invoices/server/infrastructure/repository/repository";
import { getAppDb } from "@/server-core/db/db.connection";
import {
  type BaseInvoiceEvent,
  INVOICE_EVENTS,
} from "@/server-core/events/invoice/invoice-event.types";
import { AppError } from "@/shared/errors/core/app-error.class";
import type { FormResult } from "@/shared/forms/types/form-result.types";
import {
  selectSparseFieldErrors,
  toDenseFieldErrorMap,
} from "@/shared/forms/utilities/factories/create-error-map.factory";
import {
  formError,
  formOk,
} from "@/shared/forms/utilities/factories/create-form-result.factory";
import { logger } from "@/shared/logging/infrastructure/logging.client";
import { ROUTES } from "@/shared/routes/routes";

// Publish "invoice updated" domain event
async function publishUpdatedEvent(
  previousInvoice: InvoiceDto,
  updatedInvoice: InvoiceDto,
): Promise<void> {
  const { EventBus } = await import("@/server-core/events/event-bus");
  await EventBus.publish<BaseInvoiceEvent>(INVOICE_EVENTS.updated, {
    eventId: crypto.randomUUID(),
    eventTimestamp: new Date().toISOString(),
    invoice: updatedInvoice,
    operation: "invoice_updated",
    previousInvoice,
  });
}

function handleActionError(id: string, error: unknown): FormResult<never> {
  logger.error(INVOICE_MSG.serviceError, {
    context: "updateInvoiceAction",
    error,
    id,
    message: INVOICE_MSG.serviceError,
  });

  const schemaFields = Object.keys(
    UpdateInvoiceSchema.shape,
  ) as readonly UpdateInvoiceFieldNames[];

  return formError<UpdateInvoiceFieldNames>({
    fieldErrors: toDenseFieldErrorMap({}, schemaFields),
    message:
      error instanceof AppError
        ? INVOICE_MSG.invalidInput
        : INVOICE_MSG.serviceError,
  });
}

/**
 * Server action for updating an invoice.
 * Extracts and validates form data, then calls the service layer.
 * @param _prevState - Previous form state (unused but required by useActionState)
 * @param id - Invoice ID as a string
 * @param formData - FormData from the client
 * @returns FormResult with data, errors, message, and success
 */

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <ignore for now>
export async function updateInvoiceAction(
  _prevState: FormResult<UpdateInvoiceOutput>,
  id: string,
  formData: FormData,
): Promise<FormResult<UpdateInvoiceOutput>> {
  try {
    const input = {
      amount: formData.get("amount"),
      customerId: formData.get("customerId"),
      date: formData.get("date"),
      sensitiveData: formData.get("sensitiveData"),
      status: formData.get("status"),
    };
    const parsed = UpdateInvoiceSchema.safeParse(input);

    if (!parsed.success) {
      // Build dense error map aligned with the schema's fields
      const schemaFields = Object.keys(
        UpdateInvoiceSchema.shape,
      ) as readonly UpdateInvoiceFieldNames[];

      const zFieldErrors = parsed.error.flatten().fieldErrors as Record<
        string,
        readonly string[] | undefined
      >;

      const sparse = selectSparseFieldErrors<UpdateInvoiceFieldNames, string>(
        zFieldErrors,
        schemaFields,
      );
      const dense = toDenseFieldErrorMap<UpdateInvoiceFieldNames, string>(
        sparse,
        schemaFields,
      );

      return formError<UpdateInvoiceFieldNames>({
        fieldErrors: dense,
        message: INVOICE_MSG.validationFailed,
        values: input as Partial<Record<UpdateInvoiceFieldNames, string>>,
      });
    }

    const service = new InvoiceService(new InvoiceRepository(getAppDb()));

    const previousResult = await service.readInvoice(id);
    if (!previousResult.ok) {
      return handleActionError(id, previousResult.error);
    }
    const previousInvoice = previousResult.value;

    const updateResult = await service.updateInvoice(id, parsed.data);
    if (!updateResult.ok) {
      return handleActionError(id, updateResult.error);
    }
    const updatedInvoice = updateResult.value;

    await publishUpdatedEvent(previousInvoice, updatedInvoice);
    revalidatePath(ROUTES.dashboard.root);

    return formOk(
      {
        amount: updatedInvoice.amount,
        customerId: updatedInvoice.customerId,
        date: updatedInvoice.date,
        sensitiveData: updatedInvoice.sensitiveData,
        status: updatedInvoice.status,
      },
      INVOICE_MSG.updateSuccess,
    );
  } catch (error) {
    return handleActionError(id, error);
  }
}
