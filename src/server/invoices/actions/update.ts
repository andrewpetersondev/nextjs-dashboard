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
import { ValidationError } from "@/shared/errors/base-error.subclasses";
import {
  selectSparseFieldErrors,
  toDenseFieldErrorMap,
} from "@/shared/forms/domain/error-map.factory";
import type { LegacyFormState } from "@/shared/forms/legacy/legacy-form.types";
import { INVOICE_MSG } from "@/shared/i18n/messages/invoice-messages";
import { logger } from "@/shared/logging/logger.shared";
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

function handleActionError<
  N extends UpdateInvoiceFieldNames,
  F extends UpdateInvoiceOutput,
>(
  prevState: LegacyFormState<N, F>,
  id: string,
  error: unknown,
): LegacyFormState<N, F> {
  logger.error(INVOICE_MSG.serviceError, {
    context: "updateInvoiceAction",
    error,
    id,
    message: INVOICE_MSG.serviceError,
    prevState,
  });
  return {
    ...prevState,
    errors: toDenseFieldErrorMap({}, [] as unknown as readonly N[]),
    message:
      error instanceof ValidationError
        ? INVOICE_MSG.invalidInput
        : INVOICE_MSG.serviceError,
    success: false,
  };
}

/**
 * Server action for updating an invoice.
 * Extracts and validates form data, then calls the service layer.
 * @param prevState - Previous form state
 * @param id - Invoice ID as a string
 * @param formData - FormData from the client
 * @returns FormState with data, errors, message, and success
 */
export async function updateInvoiceAction(
  prevState: LegacyFormState<UpdateInvoiceFieldNames, UpdateInvoiceOutput>,
  id: string,
  formData: FormData,
): Promise<LegacyFormState<UpdateInvoiceFieldNames, UpdateInvoiceOutput>> {
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

      return {
        ...prevState,
        errors: dense,
        message: INVOICE_MSG.validationFailed,
        success: false,
        // Optionally echo raw values (avoid sensitive fields if present)
        values: input as Partial<Record<UpdateInvoiceFieldNames, string>>,
      };
    }

    const service = new InvoiceService(new InvoiceRepository(getAppDb()));
    const previousInvoice = await service.readInvoice(id);
    const updatedInvoice = await service.updateInvoice(id, parsed.data);

    await publishUpdatedEvent(previousInvoice, updatedInvoice);
    revalidatePath(ROUTES.dashboard.root);

    return {
      data: updatedInvoice,
      message: INVOICE_MSG.updateSuccess,
      success: true,
    };
  } catch (error) {
    return handleActionError(prevState, id, error);
  }
}
