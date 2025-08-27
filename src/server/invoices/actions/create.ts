"use server";

import { revalidatePath } from "next/cache";
import {
  INVOICE_ERROR_MESSAGES,
  INVOICE_SUCCESS_MESSAGES,
} from "@/features/invoices/messages";
import { getDB } from "@/server/db/connection";
import {
  type BaseInvoiceEvent,
  INVOICE_EVENTS,
} from "@/server/events/invoice/invoice-event.types";
import { InvoiceRepository } from "@/server/invoices/repo";
import { InvoiceService } from "@/server/invoices/service";
import { serverLogger } from "@/server/logging/serverLogger";
import { isZodError } from "@/shared/forms/guards";
import type { FormState } from "@/shared/forms/types";
import {
  deriveAllowedFieldsFromSchema,
  mapFieldErrors,
} from "@/shared/forms/utils";
import type { InvoiceDto, InvoiceFormDto } from "@/shared/invoices/dto";
import {
  type CreateInvoiceFieldNames,
  type CreateInvoiceInput,
  CreateInvoiceSchema,
} from "@/shared/invoices/schema.shared";
import type { InvoiceStatus } from "@/shared/invoices/types";

const allowed = deriveAllowedFieldsFromSchema(CreateInvoiceSchema);

/**
 * Server action for creating a new invoice.
 * @param prevState - Previous form state
 * @param formData - FormData from the client
 * @returns FormState with data, errors, message, and success
 */
export async function createInvoiceAction(
  prevState: FormState<CreateInvoiceFieldNames, CreateInvoiceInput>,
  formData: FormData,
): Promise<FormState<CreateInvoiceFieldNames, CreateInvoiceInput>> {
  let result: FormState<CreateInvoiceFieldNames, CreateInvoiceInput>;

  try {
    const input: InvoiceFormDto = {
      amount: Number(formData.get("amount")),
      customerId: String(formData.get("customerId")),
      date: String(formData.get("date")),
      sensitiveData: String(formData.get("sensitiveData")),
      status: String(formData.get("status")) as InvoiceStatus,
    };

    const parsed = CreateInvoiceSchema.safeParse(input);

    if (parsed.success) {
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
    } else {
      result = {
        ...prevState,
        errors: mapFieldErrors(parsed.error.flatten().fieldErrors, allowed),
        message: INVOICE_ERROR_MESSAGES.VALIDATION_FAILED,
        success: false,
      };
    }
  } catch (error) {
    serverLogger.error({
      context: "createInvoiceAction",
      error,
      message: INVOICE_ERROR_MESSAGES.SERVICE_ERROR,
    });

    result = {
      ...prevState,
      errors: isZodError(error)
        ? mapFieldErrors(error.flatten().fieldErrors, allowed)
        : {},
      message: isZodError(error)
        ? INVOICE_ERROR_MESSAGES.VALIDATION_FAILED
        : INVOICE_ERROR_MESSAGES.SERVICE_ERROR,
      success: false,
    };
  }
  return result;
}
