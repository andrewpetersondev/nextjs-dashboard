"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import {
  INVOICE_ERROR_MESSAGES,
  INVOICE_SUCCESS_MESSAGES,
} from "@/features/invoices/messages";
import type {
  CreateInvoiceFormFieldNames,
  CreateInvoiceFormFields,
  InvoiceStatus,
} from "@/features/invoices/types";
import { getDB } from "@/server/db/connection";
import { ValidationError } from "@/server/errors/errors";
import {
  type BaseInvoiceEvent,
  INVOICE_EVENTS,
} from "@/server/events/invoice/invoice-event.types";
import type { InvoiceDto } from "@/server/invoices/dto";
import { InvoiceRepository } from "@/server/invoices/repo";
import { CreateInvoiceSchema } from "@/server/invoices/schema";
import { InvoiceService } from "@/server/invoices/service";
import { logger } from "@/server/logging/logger";
import type { FormState } from "@/shared/forms/types";
import {
  deriveAllowedFieldsFromSchema,
  mapFieldErrors,
} from "@/shared/forms/utils";

const allowed = deriveAllowedFieldsFromSchema(CreateInvoiceSchema);

/**
 * Server action for creating a new invoice.
 * @param prevState - Previous form state
 * @param formData - FormData from the client
 * @returns FormState with data, errors, message, and success
 */
export async function createInvoiceAction(
  prevState: FormState<CreateInvoiceFormFieldNames, CreateInvoiceFormFields>,
  formData: FormData,
): Promise<FormState<CreateInvoiceFormFieldNames, CreateInvoiceFormFields>> {
  let result: FormState<CreateInvoiceFormFieldNames, CreateInvoiceFormFields>;

  try {
    if (!formData || !(formData instanceof FormData)) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_INPUT, {
        formData,
      });
    }

    // Extract and coerce form data
    const input: CreateInvoiceFormFields = {
      amount: Number(formData.get("amount")),
      customerId: String(formData.get("customerId")),
      date: String(formData.get("date")),
      sensitiveData: String(formData.get("sensitiveData")),
      status: String(formData.get("status")) as InvoiceStatus,
    };
    const parsed = CreateInvoiceSchema.safeParse(input);

    if (!parsed.success) {
      result = {
        ...prevState,
        errors: mapFieldErrors(parsed.error.flatten().fieldErrors, allowed),
        message: INVOICE_ERROR_MESSAGES.VALIDATION_FAILED,
        success: false,
      };
    } else {
      const repo = new InvoiceRepository(getDB());
      const service = new InvoiceService(repo);
      const invoice: InvoiceDto = await service.createInvoice(parsed.data);
      const { EventBus } = await import("@/server/events/event-bus");
      await EventBus.publish<BaseInvoiceEvent>(INVOICE_EVENTS.CREATED, {
        eventId: crypto.randomUUID(),
        eventTimestamp: new Date().toISOString(),
        invoice,
        operation: "invoice_created",
      });
      revalidatePath("/dashboard");
      result = {
        data: parsed.data,
        message: INVOICE_SUCCESS_MESSAGES.CREATE_SUCCESS,
        success: true,
      };
    }
  } catch (error) {
    logger.error({
      context: "createInvoiceAction",
      error,
      message: INVOICE_ERROR_MESSAGES.SERVICE_ERROR,
    });

    result = {
      ...prevState,
      errors:
        error instanceof z.ZodError
          ? mapFieldErrors(error.flatten().fieldErrors, allowed)
          : {},
      message:
        error instanceof z.ZodError
          ? INVOICE_ERROR_MESSAGES.VALIDATION_FAILED
          : INVOICE_ERROR_MESSAGES.SERVICE_ERROR,
      success: false,
    };
  }

  return result;
}
