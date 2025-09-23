"use server";

import { revalidatePath } from "next/cache";
import type { InvoiceDto, InvoiceFormDto } from "@/features/invoices/lib/dto";
import {
  type UpdateInvoiceFieldNames,
  type UpdateInvoiceInput,
  UpdateInvoiceSchema,
} from "@/features/invoices/lib/invoice.schema";
import type { InvoiceStatus } from "@/features/invoices/lib/types";
import { getDB } from "@/server/db/connection";
import {
  type BaseInvoiceEvent,
  INVOICE_EVENTS,
} from "@/server/events/invoice/invoice-event.types";
import { InvoiceRepository } from "@/server/invoices/repo";
import { InvoiceService } from "@/server/invoices/service";
import { serverLogger } from "@/server/logging/serverLogger";
import { ValidationError } from "@/shared/core/errors/domain";
import type { FieldError, FormState } from "@/shared/forms/form-types";
import { INVOICE_MSG } from "@/shared/i18n/messages/invoice-messages";
import { ROUTES } from "@/shared/routes/routes";

function buildUpdateInput(formData: FormData): Partial<InvoiceFormDto> {
  return {
    ...(formData.has("amount") && {
      // Amount comes from the form in USD; schema transforms to integer cents
      amount: Number(formData.get("amount")),
    }),
    ...(formData.has("customerId") && {
      customerId: String(formData.get("customerId")),
    }),
    ...(formData.has("date") && { date: String(formData.get("date")) }),
    ...(formData.has("sensitiveData") && {
      sensitiveData: String(formData.get("sensitiveData")),
    }),
    ...(formData.has("status") && {
      status: String(formData.get("status")) as InvoiceStatus,
    }),
  };
}

// Publish "invoice updated" domain event
async function publishUpdatedEvent(
  previousInvoice: InvoiceDto,
  updatedInvoice: InvoiceDto,
): Promise<void> {
  const { EventBus } = await import("@/server/events/event-bus");
  await EventBus.publish<BaseInvoiceEvent>(INVOICE_EVENTS.UPDATED, {
    eventId: crypto.randomUUID(),
    eventTimestamp: new Date().toISOString(),
    invoice: updatedInvoice,
    operation: "invoice_updated",
    previousInvoice,
  });
}

function handleActionError<
  N extends UpdateInvoiceFieldNames,
  F extends UpdateInvoiceInput,
>(prevState: FormState<N, F>, id: string, error: unknown): FormState<N, F> {
  serverLogger.error({
    context: "updateInvoiceAction",
    error,
    id,
    message: INVOICE_MSG.SERVICE_ERROR,
    prevState,
  });
  return {
    ...prevState,
    errors: {},
    message:
      error instanceof ValidationError
        ? INVOICE_MSG.INVALID_INPUT
        : INVOICE_MSG.SERVICE_ERROR,
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
  prevState: FormState<UpdateInvoiceFieldNames, UpdateInvoiceInput>,
  id: string,
  formData: FormData,
): Promise<FormState<UpdateInvoiceFieldNames, UpdateInvoiceInput>> {
  try {
    const input = buildUpdateInput(formData);
    const parsed = UpdateInvoiceSchema.safeParse(input);

    if (!parsed.success) {
      return {
        ...prevState,
        errors: parsed.error.flatten().fieldErrors as Partial<
          Record<UpdateInvoiceFieldNames, FieldError>
        >,
        message: INVOICE_MSG.VALIDATION_FAILED,
        success: false,
      };
    }

    const service = new InvoiceService(new InvoiceRepository(getDB()));
    const previousInvoice = await service.readInvoice(id);
    const updatedInvoice = await service.updateInvoice(id, parsed.data);

    await publishUpdatedEvent(previousInvoice, updatedInvoice);
    revalidatePath(ROUTES.DASHBOARD.ROOT);

    return {
      data: updatedInvoice,
      message: INVOICE_MSG.UPDATE_SUCCESS,
      success: true,
    };
  } catch (error) {
    return handleActionError(prevState, id, error);
  }
}
