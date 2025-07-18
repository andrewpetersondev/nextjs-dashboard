"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";
import { getDB } from "@/db/connection";
import {
  createInvoiceDal,
  deleteInvoiceDal,
  fetchFilteredInvoices,
  fetchInvoicesPages,
  fetchLatestInvoices,
  readInvoiceDal,
  updateInvoiceDal,
} from "@/features/invoices/invoice.dal";
import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import { InvoiceRepository } from "@/features/invoices/invoice.repository";
import {
  CreateInvoiceSchema,
  type InvoiceActionResult,
  type InvoiceEditState,
  type InvoiceFieldName,
  type InvoiceFormStateCreate,
  type InvoiceTableRow,
} from "@/features/invoices/invoice.types";
import { processInvoiceFormData } from "@/features/invoices/invoice.utils";
import { INVOICE_ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { INVOICE_SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import {
  toCustomerId,
  toInvoiceId,
  toInvoiceStatusBrand,
} from "@/lib/definitions/brands";
import { buildErrorMap } from "@/lib/forms/form-validation";
import { logger } from "@/lib/utils/logger";
import { getFormField } from "@/lib/utils/utils.server";

/**
 * Server action for creating a new invoice.
 *
 * ## Overview
 * - Validates and transforms form input using Zod schema and domain logic.
 * - Brands fields for database safety and inserts the invoice via DAL.
 * - Returns a strictly typed form state for UI feedback, including errors, messages, and the created invoice DTO.
 *
 * ## Parameters
 * @param _prevState - Previous form state (unused, reserved for future stateful workflows).
 * @param formData - FormData from the client, containing invoice fields.
 *
 * ## Returns
 * @returns {Promise<InvoiceFormStateCreate>} Form state object:
 * - `data`: The created invoice DTO (on success).
 * - `errors`: Field-level error map (on validation failure).
 * - `message`: General status or error message.
 * - `success`: Indicates operation result.
 *
 * ## Error Handling
 * - Validation and transformation errors are logged with context and returned to the UI.
 * - Database errors are logged and returned as a general error message.
 * - No sensitive data is exposed in error messages.
 *
 * ## Data Flow
 * 1. Validate and transform input (`processInvoiceFormData`).
 * 2. If valid, insert invoice via DAL (`createInvoiceDal`).
 * 3. Return form state for UI feedback.
 *
 * ## Accessibility & Internationalization
 * - Error messages are suitable for display in accessible UI components.
 * - All messages should be localized for internationalization.
 *
 * ## Example
 * ```typescript
 * const result = await createInvoiceAction(prevState, formData);
 * if (!result.success) {
 *   // Display result.errors and result.message in the UI
 * }
 */
export async function _createInvoiceAction_old(
  _prevState: InvoiceFormStateCreate,
  formData: FormData,
): Promise<InvoiceFormStateCreate> {
  try {
    const db = getDB();

    const { dalInput, errors, message } = processInvoiceFormData(formData);

    if (!dalInput) {
      logger.error({
        context: "createInvoiceAction:validationOrTransformError",
        errors,
        message,
      });
      return {
        errors: errors ?? {},
        message: message ?? INVOICE_ERROR_MESSAGES.INVALID_INPUT,
        success: false,
      };
    }

    const invoice = await createInvoiceDal(db, dalInput);

    if (!invoice) {
      logger.error({
        context: "createInvoiceAction:createFailed",
        dalInput,
        message: INVOICE_ERROR_MESSAGES.CREATE_FAILED,
      });
      return {
        errors: {},
        message: INVOICE_ERROR_MESSAGES.CREATE_FAILED,
        success: false,
      };
    }

    // Log success
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
      message: INVOICE_ERROR_MESSAGES.DB_ERROR,
    });
    return {
      errors: {},
      message: INVOICE_ERROR_MESSAGES.DB_ERROR,
      success: false,
    };
  }
  // finally {
  // cleanup if needed (close db connection, etc.)
  // logger.info({})
  // telemetry/tracing
  // non-blocking side effects
  // }
  // revalidatePath("/dashboard/invoices");
  // redirect("/dashboard/invoices");
}

/**
 * Server action to fetch a single invoice by its ID.
 * @param id - The invoice ID (string).
 * @returns An InvoiceDto, or null.
 */
export async function readInvoiceAction(
  id: string,
): Promise<InvoiceDto | null> {
  try {
    const db = getDB();
    const brandedId = toInvoiceId(id);
    const invoice = await readInvoiceDal(db, brandedId);
    return invoice ? invoice : null;
  } catch (error) {
    logger.error({
      context: "readInvoiceAction",
      error,
      id,
      message: INVOICE_ERROR_MESSAGES.DB_ERROR,
    });
    throw new Error("Database Error: Failed to Fetch InvoiceEntity.");
  }
}

/**
 * Server action to update an existing invoice.
 */
export async function _updateInvoiceAction_old(
  id: string,
  prevState: InvoiceEditState,
  formData: FormData,
): Promise<InvoiceEditState> {
  try {
    const db = getDB();

    let rawAmount: string;
    let rawCustomerId: string;
    let rawStatus: string;
    try {
      rawAmount = getFormField(formData, "amount");
      rawCustomerId = getFormField(formData, "customerId");
      rawStatus = getFormField(formData, "status");
    } catch (error) {
      logger.error({
        context: "updateInvoiceAction:missingFields",
        error,
        id,
        message: INVOICE_ERROR_MESSAGES.MISSING_FIELDS,
      });
      return {
        errors: buildErrorMap({
          amount: formData.get("amount")
            ? undefined
            : [INVOICE_ERROR_MESSAGES.AMOUNT_REQUIRED],
          customerId: formData.get("customerId")
            ? undefined
            : [INVOICE_ERROR_MESSAGES.CUSTOMER_ID_REQUIRED],
          status: formData.get("status")
            ? undefined
            : [INVOICE_ERROR_MESSAGES.STATUS_REQUIRED],
        }),
        invoice: prevState.invoice,
        message: INVOICE_ERROR_MESSAGES.MISSING_FIELDS,
        success: false,
      };
    }

    const validated = CreateInvoiceSchema.safeParse({
      amount: rawAmount,
      customerId: rawCustomerId,
      status: rawStatus,
    });

    if (!validated.success) {
      logger.error({
        context: "updateInvoiceAction:validationError",
        error: validated.error,
        id,
        message: INVOICE_ERROR_MESSAGES.INVALID_INPUT,
        prevState,
      });

      return {
        errors: buildErrorMap(validated.error.flatten().fieldErrors),
        invoice: prevState.invoice,
        message: INVOICE_ERROR_MESSAGES.INVALID_INPUT,
        success: false,
      };
    }

    const { amount, customerId, status } = validated.data;
    const brandedId = toInvoiceId(id);
    const brandedCustomerId = toCustomerId(customerId);
    const brandedStatus = toInvoiceStatusBrand(status);
    const amountInCents = Math.round(amount * 100);

    const updatedInvoice = await updateInvoiceDal(db, brandedId, {
      amount: amountInCents,
      customerId: brandedCustomerId,
      status: brandedStatus,
    });

    if (!updatedInvoice) {
      logger.error({
        context: "updateInvoiceAction:updateFailed",
        id,
        message: INVOICE_ERROR_MESSAGES.UPDATE_FAILED,
        prevState,
      });

      return {
        errors: {},
        invoice: prevState.invoice,
        message: INVOICE_ERROR_MESSAGES.UPDATE_FAILED,
        success: false,
      };
    }

    return {
      errors: {},
      invoice: updatedInvoice,
      message: INVOICE_SUCCESS_MESSAGES.UPDATE_SUCCESS,
      success: true,
    };
  } catch (error) {
    logger.error({
      context: "updateInvoiceAction",
      error,
      id,
      message: INVOICE_ERROR_MESSAGES.DB_ERROR,
      prevState,
    });

    return {
      errors: {},
      invoice: prevState.invoice,
      message: INVOICE_ERROR_MESSAGES.DB_ERROR,
      success: false,
    };
  }
}

/**
 * Programmatic server action to delete an invoice by string ID.
 * @param id - The invoice ID as a string.
 * @returns The deleted InvoiceDto or null.
 */
export async function deleteInvoiceAction(
  id: string,
): Promise<InvoiceDto | null> {
  const db = getDB();
  return await deleteInvoiceDal(db, toInvoiceId(id));
}

/**
 * Form server action for deleting an invoice.
 * Accepts FormData, extracts and brands the ID, and handles navigation.
 * @param formData - The form data containing the invoice ID.
 * @returns A promise that resolves when the action completes.
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

// --- Read Actions for Invoices ---

/**
 * Server action to fetch the total number of invoice pages for pagination.
 * @param query - Search query string (optional, defaults to empty string)
 * @returns Promise<number> - Total number of pages (integer >= 1)
 */
export async function readInvoicesPagesAction(
  query: string = "",
): Promise<number> {
  // Sanitize input to prevent SQL injection and ensure type safety
  const sanitizedQuery = typeof query === "string" ? query.trim() : "";

  try {
    const db = getDB();

    // Delegate to DAL, which already handles error logging and page calculation
    const totalPages = await fetchInvoicesPages(db, sanitizedQuery);

    // Defensive: Ensure a valid number is always returned
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
    // Rethrow or return a safe fallback (never expose internal errors to the client)
    throw new Error(INVOICE_ERROR_MESSAGES.DB_ERROR);
  }
}

/**
 * Server action to fetch filtered invoices for the invoices table.
 * @param query - Search query string
 * @param currentPage - Current page number
 * @returns Array of FetchFilteredInvoicesData
 */
export async function readFilteredInvoicesAction(
  query: string = "",
  currentPage: number = 1,
): Promise<InvoiceTableRow[]> {
  const db = getDB();
  return fetchFilteredInvoices(db, query, currentPage);
}

/**
 * Server action to fetch the latest invoices for the dashboard.
 * @returns Array of ModifiedLatestInvoicesData
 */
export async function readLatestInvoicesAction() {
  const db = getDB();
  return fetchLatestInvoices(db);
}

/**
 * Server action to create an invoice using the new repository pattern.
 */
export async function createInvoiceAction_v2(
  _prevState: InvoiceFormStateCreate,
  formData: FormData,
): Promise<InvoiceFormStateCreate> {
  const repo = new InvoiceRepository(getDB());
  const { dalInput, errors, message } = processInvoiceFormData(formData);

  if (!dalInput) {
    logger.error({
      context: "createInvoiceAction:validationOrTransformError",
      errors,
      message,
    });
    return {
      errors: errors ?? {},
      message: message ?? INVOICE_ERROR_MESSAGES.INVALID_INPUT,
      success: false,
    };
  }

  try {
    const invoice = await repo.create(dalInput);
    if (!invoice) {
      return {
        errors: {},
        message: INVOICE_ERROR_MESSAGES.CREATE_FAILED,
        success: false,
      };
    }
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
      message: INVOICE_ERROR_MESSAGES.DB_ERROR,
    });
    return {
      errors: {},
      message: INVOICE_ERROR_MESSAGES.DB_ERROR,
      success: false,
    };
  }
}

/**
 * Server action to fetch a single invoice by its ID.
 */
export async function readInvoiceAction_v2(
  id: string,
): Promise<InvoiceDto | null> {
  try {
    const repo = new InvoiceRepository(getDB());
    const invoice = await repo.read(toInvoiceId(id));
    return invoice;
  } catch (error) {
    logger.error({
      context: "readInvoiceAction",
      error,
      id,
      message: INVOICE_ERROR_MESSAGES.DB_ERROR,
    });
    return null;
  }
}

/**
 * Server action to update an invoice using the repository pattern.
 *
 * - Validates and transforms form input using Zod schema and domain logic.
 * - Brands fields for database safety and updates the invoice via repository.
 * - Returns a strictly typed form state for UI feedback, including errors, messages, and the updated invoice DTO.
 *
 * @param id - Invoice ID as string.
 * @param prevState - Previous form state for UI.
 * @param formData - FormData from the client, containing invoice fields.
 * @returns {Promise<InvoiceEditState>} Form state object for UI feedback.
 */
export async function updateInvoiceAction_v2(
  id: string,
  prevState: InvoiceEditState,
  formData: FormData,
): Promise<InvoiceEditState> {
  const repo = new InvoiceRepository(getDB());

  // Validate and transform input
  const validated = CreateInvoiceSchema.safeParse({
    amount: formData.get("amount"),
    customerId: formData.get("customerId"),
    status: formData.get("status"),
  });

  if (!validated.success) {
    logger.error({
      context: "updateInvoiceAction_v2:validationError",
      error: validated.error,
      id,
      message: INVOICE_ERROR_MESSAGES.INVALID_INPUT,
      prevState,
    });
    return {
      errors: buildErrorMap(validated.error.flatten().fieldErrors),
      invoice: prevState.invoice,
      message: INVOICE_ERROR_MESSAGES.INVALID_INPUT,
      success: false,
    };
  }

  const { amount, customerId, status } = validated.data;

  try {
    const updatedInvoice = await repo.update(toInvoiceId(id), {
      amount: Math.round(amount * 100),
      customerId: toCustomerId(customerId),
      status: toInvoiceStatusBrand(status),
    });

    if (!updatedInvoice) {
      logger.error({
        context: "updateInvoiceAction_v2:updateFailed",
        id,
        message: INVOICE_ERROR_MESSAGES.UPDATE_FAILED,
        prevState,
      });
      return {
        errors: {},
        invoice: prevState.invoice,
        message: INVOICE_ERROR_MESSAGES.UPDATE_FAILED,
        success: false,
      };
    }

    return {
      errors: {},
      invoice: updatedInvoice,
      message: INVOICE_SUCCESS_MESSAGES.UPDATE_SUCCESS,
      success: true,
    };
  } catch (error) {
    logger.error({
      context: "updateInvoiceAction_v2",
      error,
      id,
      message: INVOICE_ERROR_MESSAGES.DB_ERROR,
      prevState,
    });
    return {
      errors: {},
      invoice: prevState.invoice,
      message: INVOICE_ERROR_MESSAGES.DB_ERROR,
      success: false,
    };
  }
}

/**
 * Create Invoice Action with prevState.
 * Uses InvoiceActionResult to maintain state across actions.
 */
export async function createInvoiceAction(
  prevState: InvoiceActionResult<InvoiceFieldName, InvoiceDto>,
  formData: FormData,
): Promise<InvoiceActionResult<InvoiceFieldName, InvoiceDto>> {
  try {
    const validated = CreateInvoiceSchema.safeParse({
      amount: formData.get("amount"),
      customerId: formData.get("customerId"),
      status: formData.get("status"),
    });

    if (!validated.success) {
      return {
        ...prevState,
        // errors: buildErrorMap(validated.error.flatten().fieldErrors),
        errors: z.flattenError(validated.error).fieldErrors,
        message: INVOICE_ERROR_MESSAGES.INVALID_INPUT,
        success: false,
      };
    }

    const invoice = await createInvoiceDal(getDB(), {
      amount: Math.round(validated.data.amount * 100),
      customerId: toCustomerId(validated.data.customerId),
      date: new Date().toISOString(),
      status: toInvoiceStatusBrand(validated.data.status),
    });

    if (!invoice) {
      return {
        ...prevState,
        errors: {},
        message: INVOICE_ERROR_MESSAGES.CREATE_FAILED,
        success: false,
      };
    }

    return {
      data: invoice,
      errors: {},
      message: INVOICE_SUCCESS_MESSAGES.CREATE_SUCCESS,
      success: true,
    };
  } catch (error) {
    logger.error({
      context: "createInvoiceActionWithState",
      error,
      message: INVOICE_ERROR_MESSAGES.DB_ERROR,
      prevState,
    });
    return {
      ...prevState,
      errors: {},
      message: INVOICE_ERROR_MESSAGES.DB_ERROR,
      success: false,
    };
  }
}

/**
 * Read Invoice Action with prevState.
 * Uses InvoiceActionResult to maintain state across actions.
 */
export async function _readInvoiceActionWithState(
  prevState: InvoiceActionResult<InvoiceFieldName, InvoiceDto>,
  id: string,
): Promise<InvoiceActionResult<InvoiceFieldName, InvoiceDto>> {
  try {
    const invoice = await readInvoiceDal(getDB(), toInvoiceId(id));
    if (!invoice) {
      return {
        ...prevState,
        data: null,
        message: INVOICE_ERROR_MESSAGES.READ_FAILED,
        success: false,
      };
    }
    return {
      data: invoice,
      errors: {},
      message: INVOICE_SUCCESS_MESSAGES.READ_SUCCESS,
      success: true,
    };
  } catch (error) {
    logger.error({
      context: "readInvoiceActionWithState",
      error,
      id,
      message: INVOICE_ERROR_MESSAGES.DB_ERROR,
      prevState,
    });
    return {
      ...prevState,
      data: null,
      message: INVOICE_ERROR_MESSAGES.DB_ERROR,
      success: false,
    };
  }
}

/**
 * Update Invoice Action with prevState.
 * Uses InvoiceActionResult to maintain state across actions.
 */
export async function updateInvoiceAction(
  prevState: InvoiceActionResult<InvoiceFieldName, InvoiceDto>,
  id: string,
  formData: FormData,
): Promise<InvoiceActionResult<InvoiceFieldName, InvoiceDto>> {
  try {
    const validated = CreateInvoiceSchema.safeParse({
      amount: formData.get("amount"),
      customerId: formData.get("customerId"),
      status: formData.get("status"),
    });

    if (!validated.success) {
      return {
        ...prevState,
        // errors: buildErrorMap(validated.error.flatten().fieldErrors),
        errors: z.flattenError(validated.error).fieldErrors,
        message: INVOICE_ERROR_MESSAGES.INVALID_INPUT,
        success: false,
      };
    }

    const updatedInvoice = await updateInvoiceDal(getDB(), toInvoiceId(id), {
      amount: Math.round(validated.data.amount * 100),
      customerId: toCustomerId(validated.data.customerId),
      status: toInvoiceStatusBrand(validated.data.status),
    });

    if (!updatedInvoice) {
      return {
        ...prevState,
        errors: {},
        message: INVOICE_ERROR_MESSAGES.UPDATE_FAILED,
        success: false,
      };
    }

    return {
      data: updatedInvoice,
      errors: {},
      message: INVOICE_SUCCESS_MESSAGES.UPDATE_SUCCESS,
      success: true,
    };
  } catch (error) {
    logger.error({
      context: "updateInvoiceActionWithState",
      error,
      id,
      message: INVOICE_ERROR_MESSAGES.DB_ERROR,
      prevState,
    });
    return {
      ...prevState,
      errors: {},
      message: INVOICE_ERROR_MESSAGES.DB_ERROR,
      success: false,
    };
  }
}

/**
 * Delete Invoice Action with prevState.
 * Uses InvoiceActionResult to maintain state across actions.
 */
export async function _deleteInvoiceActionWithState(
  prevState: InvoiceActionResult<InvoiceFieldName, InvoiceDto>,
  id: string,
): Promise<InvoiceActionResult<InvoiceFieldName, InvoiceDto>> {
  try {
    const deletedInvoice = await deleteInvoiceDal(getDB(), toInvoiceId(id));
    if (!deletedInvoice) {
      return {
        ...prevState,
        data: null,
        message: INVOICE_ERROR_MESSAGES.DELETE_FAILED,
        success: false,
      };
    }
    return {
      data: deletedInvoice,
      errors: {},
      message: INVOICE_SUCCESS_MESSAGES.DELETE_SUCCESS,
      success: true,
    };
  } catch (error) {
    logger.error({
      context: "deleteInvoiceActionWithState",
      error,
      id,
      message: INVOICE_ERROR_MESSAGES.DB_ERROR,
      prevState,
    });
    return {
      ...prevState,
      data: null,
      message: INVOICE_ERROR_MESSAGES.DB_ERROR,
      success: false,
    };
  }
}
