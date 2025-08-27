"use server";

import { revalidatePath } from "next/cache";
import {
  INVOICE_ERROR_MESSAGES,
  INVOICE_SUCCESS_MESSAGES,
} from "@/features/invoices/messages";
import type {
  BaseInvoiceFormFieldNames,
  BaseInvoiceFormFields,
} from "@/features/invoices/types";
import { getDB } from "@/server/db/connection";
import {
  type BaseInvoiceEvent,
  INVOICE_EVENTS,
} from "@/server/events/invoice/invoice-event.types";
import type { InvoiceDto, InvoiceFormDto } from "@/server/invoices/dto";
import { InvoiceRepository } from "@/server/invoices/repo";
import { UpdateInvoiceSchema } from "@/server/invoices/schema";
import { InvoiceService } from "@/server/invoices/service";
import { logger } from "@/server/logging/logger";
import { ValidationError } from "@/shared/errors/domain";
import type { FormFieldError, FormState } from "@/shared/forms/types";
import type { InvoiceStatus } from "@/shared/invoices/invoices";

function buildUpdateInput(formData: FormData): Partial<InvoiceFormDto> {
  return {
    ...(formData.has("amount") && {
      // biome-ignore lint/style/noMagicNumbers: <good enough>
      amount: Math.round(Number(formData.get("amount")) * 100),
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
  N extends BaseInvoiceFormFieldNames,
  F extends BaseInvoiceFormFields,
>(prevState: FormState<N, F>, id: string, error: unknown): FormState<N, F> {
  logger.error({
    context: "updateInvoiceAction",
    error,
    id,
    message: INVOICE_ERROR_MESSAGES.SERVICE_ERROR,
    prevState,
  });
  return {
    ...prevState,
    errors: {},
    message:
      error instanceof ValidationError
        ? INVOICE_ERROR_MESSAGES.INVALID_INPUT
        : INVOICE_ERROR_MESSAGES.SERVICE_ERROR,
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
  prevState: FormState<BaseInvoiceFormFieldNames, BaseInvoiceFormFields>,
  id: string,
  formData: FormData,
): Promise<FormState<BaseInvoiceFormFieldNames, BaseInvoiceFormFields>> {
  try {
    const input = buildUpdateInput(formData);
    const parsed = UpdateInvoiceSchema.safeParse(input);

    if (!parsed.success) {
      return {
        ...prevState,
        errors: parsed.error.flatten().fieldErrors as Partial<
          Record<BaseInvoiceFormFieldNames, FormFieldError>
        >,
        message: INVOICE_ERROR_MESSAGES.VALIDATION_FAILED,
        success: false,
      };
    }

    const service = new InvoiceService(new InvoiceRepository(getDB()));
    const previousInvoice = await service.readInvoice(id);
    const updatedInvoice = await service.updateInvoice(id, parsed.data);

    await publishUpdatedEvent(previousInvoice, updatedInvoice);
    revalidatePath("/dashboard");

    return {
      data: updatedInvoice,
      message: INVOICE_SUCCESS_MESSAGES.UPDATE_SUCCESS,
      success: true,
    };
  } catch (error) {
    return handleActionError(prevState, id, error);
  }
}
