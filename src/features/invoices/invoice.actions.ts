"use server";

import "@/features/revenues/services/events/revenue-events.bootstrap";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";
import { INVOICE_ERROR_MESSAGES } from "@/errors/error-messages";
import { DatabaseError, ValidationError } from "@/errors/errors";
import {
  fetchFilteredInvoicesDal,
  fetchInvoicesPagesDal,
} from "@/features/invoices/invoice.dal";
import type {
  InvoiceDto,
  InvoiceFormDto,
} from "@/features/invoices/invoice.dto";
import { InvoiceRepository } from "@/features/invoices/invoice.repository";
import {
  CreateInvoiceSchema,
  UpdateInvoiceSchema,
} from "@/features/invoices/invoice.schemas";
import { InvoiceService } from "@/features/invoices/invoice.service";
import type {
  InvoiceActionResult,
  InvoiceListFilter,
  InvoiceStatus,
} from "@/features/invoices/invoice.types";
import { INVOICE_SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import {
  type BaseInvoiceEvent,
  INVOICE_EVENTS,
} from "@/lib/events/event.invoice";
import { logger } from "@/lib/logging/logger";
import { getDB } from "@/server/db/connection";

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

    // If validation fails, shape the error response to match InvoiceActionResult
    if (!parsed.success) {
      return {
        ...prevState,
        errors: z.flattenError(parsed.error).fieldErrors,
        message: INVOICE_ERROR_MESSAGES.VALIDATION_FAILED,
        success: false,
      };
    }

    // Dependency injection: pass repository to service
    const repo = new InvoiceRepository(getDB());

    // Create service instance with injected repository
    const service = new InvoiceService(repo);

    // Call service with validated DTO to retrieve complete InvoiceDto
    const invoice: InvoiceDto = await service.createInvoice(parsed.data);

    // Emit base event with all context.
    // TODO: why do i have await here? It seems unnecessary to scale.
    const { EventBus } = await import("@/lib/events/event.bus");
    await EventBus.publish<BaseInvoiceEvent>(INVOICE_EVENTS.CREATED, {
      eventId: crypto.randomUUID(),
      eventTimestamp: new Date().toISOString(),
      invoice,
      operation: "invoice_created",
    });

    // Return success result with created invoice data, id is returned, but is it used? Should I add a step so Entities are used, then transform to DTO?
    // Invalidate dashboard cache so revenue chart updates immediately (KISS)
    revalidatePath("/dashboard");
    return {
      data: invoice,
      errors: {},
      message: INVOICE_SUCCESS_MESSAGES.CREATE_SUCCESS,
      success: true,
    };
  } catch (error) {
    logger.error({
      context: "createInvoiceAction",
      error,
      message: INVOICE_ERROR_MESSAGES.SERVICE_ERROR,
    });

    // Find out where this error can come from.
    if (error instanceof z.ZodError) {
      return {
        ...prevState,
        errors: z.flattenError(error).fieldErrors,
        message: INVOICE_ERROR_MESSAGES.VALIDATION_FAILED,
        success: false,
      };
    }

    return {
      ...prevState,
      errors: {},
      message: INVOICE_ERROR_MESSAGES.SERVICE_ERROR,
      success: false,
    };
  }
}

/**
 * Server action to fetch a single invoice by its ID.
 * @param id - The invoice ID (string)
 * @returns An InvoiceActionResult with data, errors, message, and success
 */
export async function readInvoiceAction(
  id: string,
): Promise<InvoiceActionResult> {
  try {
    // Dependency injection: pass repository to service
    const repo = new InvoiceRepository(getDB());
    // Create service instance with injected repository
    const service = new InvoiceService(repo);
    // Call service with validated DTO to retrieve complete InvoiceDto
    const invoice: InvoiceDto = await service.readInvoice(id);

    // Return success result with invoice data shaped as InvoiceActionResult
    return {
      data: invoice,
      errors: {},
      message: INVOICE_SUCCESS_MESSAGES.READ_SUCCESS,
      success: true,
    };
  } catch (error) {
    logger.error({
      context: "readInvoiceAction",
      error,
      id,
    });

    // Return error response shaped as InvoiceActionResult
    return {
      errors: {},
      message:
        error instanceof ValidationError
          ? INVOICE_ERROR_MESSAGES.INVALID_INPUT
          : INVOICE_ERROR_MESSAGES.SERVICE_ERROR,
      success: false,
    };
  }
}

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
  try {
    // Validate parameters first
    if (!id || !formData) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_ID, {
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

    // Validate input using update schema
    const parsed = UpdateInvoiceSchema.safeParse(input);

    // If validation fails, shape the error response to match InvoiceActionResult
    if (!parsed.success) {
      return {
        ...prevState,
        errors: z.flattenError(parsed.error).fieldErrors,
        message: INVOICE_ERROR_MESSAGES.VALIDATION_FAILED,
        success: false,
      };
    }

    // Dependency injection: pass repository to service
    const repo = new InvoiceRepository(getDB());

    // Create service instance with injected repository
    const service = new InvoiceService(repo);

    // Get previous invoice state for event emission
    // TODO: idk how i feel about this.
    const previousInvoice: InvoiceDto = await service.readInvoice(id);

    // Call service to update invoice with validated DTO. Function returns InvoiceDto.
    const updatedInvoice: InvoiceDto = await service.updateInvoice(
      id,
      parsed.data,
    );

    // Emit base event with all context.
    // TODO: why do i have await here? It seems unnecessary to scale.
    const { EventBus } = await import("@/lib/events/event.bus");
    await EventBus.publish<BaseInvoiceEvent>(INVOICE_EVENTS.UPDATED, {
      eventId: crypto.randomUUID(),
      eventTimestamp: new Date().toISOString(),
      invoice: updatedInvoice,
      operation: "invoice_updated",
      previousInvoice,
    });

    // Return success result with updated invoice data shaped as InvoiceActionResult
    // Invalidate dashboard cache so revenue chart updates
    revalidatePath("/dashboard");
    return {
      data: updatedInvoice,
      errors: {},
      message: INVOICE_SUCCESS_MESSAGES.UPDATE_SUCCESS,
      success: true,
    };
  } catch (error) {
    logger.error({
      context: "updateInvoiceAction",
      error,
      id,
      message: INVOICE_ERROR_MESSAGES.SERVICE_ERROR,
      prevState,
    });
    // Return error response shaped as InvoiceActionResult
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
}

/**
 * Server action to delete an invoice by string ID.
 * @param id - The invoice ID as a string
 * @returns InvoiceActionResultGeneric with data, errors, message, and success
 */
export async function deleteInvoiceAction(
  id: string,
): Promise<InvoiceActionResult> {
  try {
    // Basic validation of input. Throw error catch block.
    if (!id) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_ID, { id });
    }

    // Dependency injection: pass repository to service
    const repo = new InvoiceRepository(getDB());
    // Create service instance with injected repository
    const service = new InvoiceService(repo);
    // Call service with validated DTO to retrieve complete InvoiceDto
    const invoice = await service.deleteInvoice(id);

    // Emit base event with all context.
    // TODO: why do i have await here? It seems unnecessary to scale.
    const { EventBus } = await import("@/lib/events/event.bus");
    await EventBus.publish<BaseInvoiceEvent>(INVOICE_EVENTS.DELETED, {
      eventId: crypto.randomUUID(),
      eventTimestamp: new Date().toISOString(),
      invoice,
      operation: "invoice_deleted",
    });

    // Return success result with deleted invoice data shaped as InvoiceActionResult
    // Invalidate dashboard cache so revenue chart updates
    revalidatePath("/dashboard");
    return {
      data: invoice,
      errors: {},
      message: INVOICE_SUCCESS_MESSAGES.DELETE_SUCCESS,
      success: true,
    };
  } catch (error) {
    logger.error({
      context: "deleteInvoiceAction",
      error,
      id,
      message: INVOICE_ERROR_MESSAGES.SERVICE_ERROR,
    });
    return {
      errors: {},
      message:
        error instanceof ValidationError
          ? INVOICE_ERROR_MESSAGES.INVALID_INPUT
          : error instanceof DatabaseError
            ? INVOICE_ERROR_MESSAGES.DB_ERROR
            : INVOICE_ERROR_MESSAGES.SERVICE_ERROR,
      success: false,
    };
  }
}

/**
 * Form server action for deleting an invoice.
 * @param formData - The form data containing the invoice ID
 * @returns A promise that resolves when the action completes
 */
export async function deleteInvoiceFormAction(
  formData: FormData,
): Promise<void> {
  "use server";
  const id = formData.get("id");
  if (typeof id !== "string") {
    throw new Error("Invalid invoice ID");
  }
  await deleteInvoiceAction(id);
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

/**
 * Server action to fetch the total number of invoice pages for pagination.
 * @param query - Search query string
 * @returns Promise<number> - Total number of pages
 */
export async function readInvoicesPagesAction(
  query: string = "",
): Promise<number> {
  try {
    const db = getDB();
    const sanitizedQuery = query.trim();
    const totalPages = await fetchInvoicesPagesDal(db, sanitizedQuery);

    if (!Number.isInteger(totalPages) || totalPages < 1) {
      logger.error({
        context: "readInvoicesPagesAction",
        message: "Invalid totalPages returned from DAL",
        query: sanitizedQuery,
      });
      throw new Error(INVOICE_ERROR_MESSAGES.FETCH_PAGES_FAILED);
    }

    return totalPages;
  } catch (error) {
    logger.error({
      context: "readInvoicesPagesAction",
      error,
      message: INVOICE_ERROR_MESSAGES.DB_ERROR,
      query,
    });
    throw new Error(INVOICE_ERROR_MESSAGES.DB_ERROR);
  }
}

/**
 * Server action to fetch filtered invoices for the invoices table.
 * @param query - Search query string
 * @param currentPage - Current page number
 * @returns Array of InvoiceListFilter
 */
export async function readFilteredInvoicesAction(
  query: string = "",
  currentPage: number = 1,
): Promise<InvoiceListFilter[]> {
  const db = getDB();
  return fetchFilteredInvoicesDal(db, query, currentPage);
}

export async function readInvoiceByIdAction(id: string): Promise<InvoiceDto> {
  try {
    if (!id) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_ID, { id });
    }
    // Dependency injection: pass repository to service
    const repo = new InvoiceRepository(getDB());
    // Create service instance with injected repository
    const service = new InvoiceService(repo);
    // Call service with validated DTO to retrieve complete InvoiceDto
    const invoice: InvoiceDto = await service.readInvoice(id);
    if (!invoice) {
      throw new Error(`Invoice with ID ${id} not found`);
    }
    return invoice;
  } catch (error) {
    throw new DatabaseError(INVOICE_ERROR_MESSAGES.DB_ERROR, error);
  }
}
