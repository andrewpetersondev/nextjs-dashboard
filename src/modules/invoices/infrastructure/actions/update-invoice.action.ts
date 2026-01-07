"use server";

import { revalidatePath } from "next/cache";
import type { InvoiceDto } from "@/modules/invoices/application/dto/invoice.dto";
import { InvoiceService } from "@/modules/invoices/application/services/invoice.service";
import { INVOICE_MSG } from "@/modules/invoices/domain/i18n/invoice-messages";
import {
  type UpdateInvoiceFieldNames,
  type UpdateInvoicePayload,
  UpdateInvoiceSchema,
} from "@/modules/invoices/domain/schema/invoice.schema";
import { InvoiceRepository } from "@/modules/invoices/infrastructure/repository/invoice.repository";
import { getAppDb } from "@/server/db/db.connection";
import {
  type BaseInvoiceEvent,
  INVOICE_EVENTS,
} from "@/server/events/invoice/invoice-event.types";
import { AppError } from "@/shared/errors/core/app-error.entity";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import {
  selectSparseFieldErrors,
  toDenseFieldErrorMap,
} from "@/shared/forms/logic/factories/field-error-map.factory";
import {
  makeFormError,
  makeFormOk,
} from "@/shared/forms/logic/factories/form-result.factory";
import { logger } from "@/shared/logging/infrastructure/logging.client";
import { ROUTES } from "@/shared/routes/routes";

// Publish "invoice updated" domain event
async function publishUpdatedEvent(
  previousInvoice: InvoiceDto,
  updatedInvoice: InvoiceDto,
): Promise<void> {
  const { EventBus } = await import("@/server/events/event-bus");
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

  return makeFormError<UpdateInvoiceFieldNames>({
    fieldErrors: toDenseFieldErrorMap({}, schemaFields),
    formData: {},
    formErrors: [],
    key: error instanceof AppError ? error.key : "unknown",
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
  _prevState: FormResult<UpdateInvoicePayload>,
  id: string,
  formData: FormData,
): Promise<FormResult<UpdateInvoicePayload>> {
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

      return makeFormError<UpdateInvoiceFieldNames>({
        fieldErrors: dense,
        formData: input as Partial<Record<UpdateInvoiceFieldNames, string>>,
        formErrors: [],
        key: "validation",
        message: INVOICE_MSG.validationFailed,
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

    return makeFormOk(
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
