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
import type { InvoiceDto, InvoiceFormDto } from "@/server/invoices/dto";
import { InvoiceRepository } from "@/server/invoices/repo";
import { CreateInvoiceSchema } from "@/server/invoices/schema";
import { InvoiceService } from "@/server/invoices/service";
import type { InvoiceActionResult } from "@/server/invoices/types";
import { logger } from "@/server/logging/logger";

/**
 * Server action for creating a new invoice.
 * @param prevState - Previous form state
 * @param formData - FormData from the client
 * @returns InvoiceActionResultGeneric with data, errors, message, and success
 */
export async function createInvoiceAction(
  prevState: InvoiceActionResult,
  formData: FormData,
): Promise<InvoiceActionResult> {
  let result: InvoiceActionResult;

  try {
    // Basic validation of formData. If not present, throw error to catch block.
    if (!formData || !(formData instanceof FormData)) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_INPUT, {
        formData,
      });
    }

    // Extract and coerce form data
    const input: InvoiceFormDto = {
      amount: Number(formData.get("amount")),
      customerId: String(formData.get("customerId")),
      date: String(formData.get("date")),
      sensitiveData: String(formData.get("sensitiveData")),
      status: String(formData.get("status")) as InvoiceStatus,
    };

    // Validate input using Zod schema
    const parsed = CreateInvoiceSchema.safeParse(input);

    if (!parsed.success) {
      // Shape the error response to match InvoiceActionResult
      result = {
        ...prevState,
        errors: z.flattenError(parsed.error).fieldErrors,
        message: INVOICE_ERROR_MESSAGES.VALIDATION_FAILED,
        success: false,
      };
    } else {
      // Dependency injection: pass repository to service
      const repo = new InvoiceRepository(getDB());

      // Create service instance with injected repository
      const service = new InvoiceService(repo);

      // Call service with validated DTO to retrieve complete InvoiceDto
      const invoice: InvoiceDto = await service.createInvoice(parsed.data);

      // Emit base event with all context.
      const { EventBus } = await import("@/server/events/event-bus");
      await EventBus.publish<BaseInvoiceEvent>(INVOICE_EVENTS.CREATED, {
        eventId: crypto.randomUUID(),
        eventTimestamp: new Date().toISOString(),
        invoice,
        operation: "invoice_created",
      });

      // Invalidate dashboard cache so revenue chart updates immediately (KISS)
      revalidatePath("/dashboard");

      // Success result
      result = {
        data: invoice,
        errors: {},
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

    const isZod = error instanceof z.ZodError;
    const errors = isZod ? z.flattenError(error).fieldErrors : {};
    const message = isZod
      ? INVOICE_ERROR_MESSAGES.VALIDATION_FAILED
      : INVOICE_ERROR_MESSAGES.SERVICE_ERROR;

    result = {
      ...prevState,
      errors,
      message,
      success: false,
    };
  }

  return result;
}
