"use server";
import { revalidatePath } from "next/cache";
import type { InvoiceDto } from "@/features/invoices/lib/dto";
import {
  type UpdateInvoiceFieldNames,
  type UpdateInvoiceOutput,
  UpdateInvoiceSchema,
} from "@/features/invoices/lib/invoice.schema";
import { getAppDb } from "@/server/db/db.connection";
import {
  type BaseInvoiceEvent,
  INVOICE_EVENTS,
} from "@/server/events/invoice/invoice-event.types";
import { InvoiceRepository } from "@/server/invoices/repo";
import { InvoiceService } from "@/server/invoices/service";
import { AppError } from "@/shared/errors/core/app-error.class";
import {
  selectSparseFieldErrors,
  toDenseFieldErrorMap,
} from "@/shared/forms/domain/factories/create-error-map.factory";
import {
  formError,
  formOk,
} from "@/shared/forms/domain/factories/create-form-result.factory";
import type { FormResult } from "@/shared/forms/domain/types/form-result.types";
import { INVOICE_MSG } from "@/shared/i18n/invoice-messages";
import { logger } from "@/shared/logging/infra/logging.client";
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
    const previousInvoice = await service.readInvoice(id);
    const updatedInvoice = await service.updateInvoice(id, parsed.data);

    await publishUpdatedEvent(previousInvoice, updatedInvoice);
    revalidatePath(ROUTES.dashboard.root);

    return formOk(updatedInvoice, INVOICE_MSG.updateSuccess);
  } catch (error) {
    return handleActionError(id, error);
  }
}
