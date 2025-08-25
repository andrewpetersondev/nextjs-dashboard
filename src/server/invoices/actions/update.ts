"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import {
  INVOICE_ERROR_MESSAGES,
  INVOICE_SUCCESS_MESSAGES,
} from "@/features/invoices/messages";
import type { InvoiceStatus } from "@/features/invoices/types";
import { getDB } from "@/server/db/connection";
import { ValidationError } from "@/server/errors/errors";
import {
  type BaseInvoiceEvent,
  INVOICE_EVENTS,
} from "@/server/events/invoice/invoice-event.types";
import type { InvoiceFormDto } from "@/server/invoices/dto";
import { InvoiceRepository } from "@/server/invoices/repo";
import { UpdateInvoiceSchema } from "@/server/invoices/schema";
import { InvoiceService } from "@/server/invoices/service";
import type { InvoiceActionResult } from "@/server/invoices/types";
import { logger } from "@/server/logging/logger";

/**
 * Server action for updating an invoice.
 * Extracts and validates form data, then calls the service layer.
 * Handles exact optional property types for strict TypeScript settings.
 * @param prevState - Previous form state
 * @param id - Invoice ID as a string
 * @param formData - FormData from the client
 * @returns InvoiceActionResult with data, errors, message, and success
 */
export async function updateInvoiceAction(
  prevState: InvoiceActionResult,
  id: string,
  formData: FormData,
): Promise<InvoiceActionResult> {
  let result: InvoiceActionResult = prevState;

  try {
    // Validate parameters first
    if (!id) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_ID, {
        formData,
        id,
      });
    }

    if (!formData) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_FORM_DATA, {
        formData,
        id,
      });
    }

    // Build the partial DTO immutably using object spread strategy
    const input = {
      ...(formData.has("amount") && { amount: Number(formData.get("amount")) }),
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
    } as Partial<InvoiceFormDto>;

    const parsed = UpdateInvoiceSchema.safeParse(input);

    if (!parsed.success) {
      result = {
        ...prevState,
        errors: z.flattenError(parsed.error).fieldErrors,
        message: INVOICE_ERROR_MESSAGES.VALIDATION_FAILED,
        success: false,
      };
    }

    if (parsed.success) {
      // success path only runs when valid
      const repo = new InvoiceRepository(getDB());
      const service = new InvoiceService(repo);

      const previousInvoice = await service.readInvoice(id);
      const updatedInvoice = await service.updateInvoice(id, parsed.data);

      const { EventBus } = await import("@/server/events/event-bus");
      await EventBus.publish<BaseInvoiceEvent>(INVOICE_EVENTS.UPDATED, {
        eventId: crypto.randomUUID(),
        eventTimestamp: new Date().toISOString(),
        invoice: updatedInvoice,
        operation: "invoice_updated",
        previousInvoice,
      });

      // Invalidate dashboard cache so revenue chart updates
      revalidatePath("/dashboard");

      // Success result
      result = {
        data: updatedInvoice,
        errors: {},
        message: INVOICE_SUCCESS_MESSAGES.UPDATE_SUCCESS,
        success: true,
      };
    }
  } catch (error) {
    logger.error({
      context: "updateInvoiceAction",
      error,
      id,
      message: INVOICE_ERROR_MESSAGES.SERVICE_ERROR,
      prevState,
    });

    // Error response shaped as InvoiceActionResult
    result = {
      ...prevState,
      errors: {},
      message:
        error instanceof ValidationError
          ? INVOICE_ERROR_MESSAGES.INVALID_INPUT
          : INVOICE_ERROR_MESSAGES.SERVICE_ERROR,
      success: false,
    };
  }

  return result;
}
