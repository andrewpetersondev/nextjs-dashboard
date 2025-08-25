"use server";

import "@/server/revenues/events/revenue-events.bootstrap";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";
import {
  INVOICE_ERROR_MESSAGES,
  INVOICE_SUCCESS_MESSAGES,
} from "@/features/invoices/messages";
import type { InvoiceStatus } from "@/features/invoices/types";
import { getDB } from "@/server/db/connection";
import { DatabaseError, ValidationError } from "@/server/errors/errors";
import {
  type BaseInvoiceEvent,
  INVOICE_EVENTS,
} from "@/server/events/invoice/invoice-event.types";
import {
  fetchFilteredInvoicesDal,
  fetchInvoicesPagesDal,
} from "@/server/invoices/dal";
import type { InvoiceDto, InvoiceFormDto } from "@/server/invoices/dto";
import { InvoiceRepository } from "@/server/invoices/repo";
import {
  CreateInvoiceSchema,
  UpdateInvoiceSchema,
} from "@/server/invoices/schema";
import { InvoiceService } from "@/server/invoices/service";
import type {
  InvoiceActionResult,
  InvoiceListFilter,
} from "@/server/invoices/types";
import { logger } from "@/server/logging/logger";

/**
 * Validation rule for parameters.
 * Encapsulates a validation function and an associated error message.
 * @typeParam V - Type of value to validate.
 * @property validate - Function to check if the value passes the rule.
 * @property message - Error message to display if the rule fails.
 */
type ParamRule<V> = {
  validate: (value: V) => boolean;
  message: string;
};

/**
 * Defines validation rules for a subset of object properties.
 * Accepts a record type `T` and keys `K` from `T` to map each selected property
 * to a validation rule of type {@link ParamRule}.
 * @typeParam T - The object type being validated.
 * @typeParam K - Keys of the object `T` that require validations.
 * @remarks
 * Each key in `K` maps to a {@link ParamRule} corresponding to the value type of
 * that key in `T`.
 */
type ParamValidators<T extends Record<string, unknown>, K extends keyof T> = {
  [P in K]: ParamRule<T[P]>;
};

/**
 * Assert that provided parameters meet specified validation rules.
 * Iterates over the given validators and checks each parameter against its
 * corresponding rule. Throws a `ValidationError` if a parameter fails validation.
 * @typeParam T - Type representing the overall structure of the parameters.
 * @typeParam K - Keys of `T` which are validated.
 * @param params - Object containing the parameters to validate.
 * @param validators - Object where keys match `params` keys and values define
 * validation rules for the corresponding parameter.
 * @returns void - Throws an error if validation fails; otherwise, no return value.
 * @remarks
 * - At least one validator must be provided in the `validators` object.
 * - Throws `ValidationError` if a parameter fails its respective validation rule.
 */
function assertParams<
  T extends Record<string, unknown>,
  K extends keyof T & string,
>(params: T, validators: ParamValidators<T, K>): void {
  // Ensure at least one validator is provided
  if (Object.keys(validators).length === 0) {
    throw new ValidationError("No validators provided", { params });
  }

  // Iterate defined validators; no non-null assertion needed
  for (const [key, rule] of Object.entries(validators) as [
    K,
    ParamRule<T[K]>,
  ][]) {
    const value = params[key];
    if (!rule.validate(value)) {
      throw new ValidationError(rule.message, { param: key, value });
    }
  }
}

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

/**
 * Server action to fetch a single invoice by its ID.
 * @param id - The invoice ID (string)
 * @returns An InvoiceActionResult with data, errors, message, and success
 */
export async function readInvoiceAction(
  id: string,
): Promise<InvoiceActionResult> {
  let result: InvoiceActionResult;

  try {
    // Validate parameters using generic assertParams
    assertParams(
      { id },
      {
        id: {
          message: INVOICE_ERROR_MESSAGES.INVALID_ID,
          validate: (v) => v.trim().length > 0,
        },
      },
    );

    // Dependency injection: pass repository to service
    const repo = new InvoiceRepository(getDB());
    // Create service instance with injected repository
    const service = new InvoiceService(repo);
    // Call service and get invoice
    const invoice: InvoiceDto = await service.readInvoice(id);

    // Success result with invoice data
    result = {
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

    // Error response shaped as InvoiceActionResult
    result = {
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

/**
 * Server action to delete an invoice by string ID.
 * @param id - The invoice ID as a string
 * @returns InvoiceActionResultGeneric with data, errors, message, and success
 */
export async function deleteInvoiceAction(
  id: string,
): Promise<InvoiceActionResult> {
  let result: InvoiceActionResult;

  try {
    // Basic validation of input. Throw to catch block.
    if (!id) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_ID, { id });
    }

    // Dependency injection: pass repository to service
    const repo = new InvoiceRepository(getDB());
    // Create service instance with injected repository
    const service = new InvoiceService(repo);
    // Call service with validated ID to delete the invoice
    const invoice = await service.deleteInvoice(id);

    // Emit base event with all context.
    const { EventBus } = await import("@/server/events/event-bus");
    await EventBus.publish<BaseInvoiceEvent>(INVOICE_EVENTS.DELETED, {
      eventId: crypto.randomUUID(),
      eventTimestamp: new Date().toISOString(),
      invoice,
      operation: "invoice_deleted",
    });

    // Invalidate dashboard cache so revenue chart updates
    revalidatePath("/dashboard");

    // Success result
    result = {
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

    // Error result
    result = {
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

  return result;
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
  return await fetchFilteredInvoicesDal(db, query, currentPage);
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
