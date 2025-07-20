"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";
import { getDB } from "@/db/connection";
import { DatabaseError, ValidationError } from "@/errors/errors";
import {
  fetchFilteredInvoices,
  fetchInvoicesPages,
  fetchLatestInvoices,
} from "@/features/invoices/invoice.dal";
import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import { InvoiceRepository } from "@/features/invoices/invoice.repository";
import { CreateInvoiceSchema } from "@/features/invoices/invoice.schemas";
import { InvoiceService } from "@/features/invoices/invoice.service";
import type {
  InvoiceActionResultGeneric,
  InvoiceFieldName,
  InvoiceTableRow,
} from "@/features/invoices/invoice.types";
import { INVOICE_ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { INVOICE_SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { logger } from "@/lib/utils/logger";

/**
 * Server action for creating a new invoice.
 * @param prevState - Previous form state.
 * @param formData - FormData from the client.
 * @returns InvoiceActionResultGeneric with data, errors, message, and success.
 */
export async function createInvoiceAction(
  prevState: InvoiceActionResultGeneric<InvoiceFieldName, InvoiceDto>,
  formData: FormData,
): Promise<InvoiceActionResultGeneric<InvoiceFieldName, InvoiceDto>> {
  try {
    // 1. Validate and parse input using Zod
    const parsed = CreateInvoiceSchema.safeParse({
      amount: formData.get("amount"),
      customerId: formData.get("customerId"),
      sensitiveData: formData.get("sensitiveData"),
      status: formData.get("status"),
    });
    if (!parsed.success) {
      return {
        ...prevState,
        // errors: parsed.error.flatten().fieldErrors,
        errors: z.flattenError(parsed.error).fieldErrors,
        message: INVOICE_ERROR_MESSAGES.VALIDATION_FAILED,
        success: false,
      };
    }

    // 2. Call service layer
    const repo = new InvoiceRepository(getDB());
    const service = new InvoiceService(repo);
    const invoice = await service.createInvoiceService(formData);

    // 3. Return consistent result
    return {
      data: invoice,
      errors: {},
      message: INVOICE_SUCCESS_MESSAGES.CREATE_SUCCESS,
      success: true,
    };
  } catch (error) {
    // 4. Centralized error mapping/logging
    logger.error({
      context: "createInvoiceAction",
      error,
      message: INVOICE_ERROR_MESSAGES.SERVICE_ERROR,
    });
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
 * @param id - The invoice ID (string).
 * @returns An InvoiceActionResultGeneric with data, errors, message, and success.
 */
export async function readInvoiceAction(
  id: string,
): Promise<InvoiceActionResultGeneric<InvoiceFieldName, InvoiceDto>> {
  const repo = new InvoiceRepository(getDB());
  const service = new InvoiceService(repo);

  try {
    const invoice = await service.readInvoiceService(id);

    return {
      data: invoice,
      errors: {},
      message: INVOICE_SUCCESS_MESSAGES.READ_SUCCESS,
      success: true,
    };
  } catch (error) {
    // Single error handler - let Service/Repository determine error types
    logger.error({
      context: "readInvoiceAction",
      error,
      id,
    });

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
 * Handles request/response and error formatting for the UI.
 * @param prevState - Previous form state.
 * @param id - Invoice ID as a string.
 * @param formData - FormData from the client.
 * @returns InvoiceActionResultGeneric with data, errors, message, and success.
 */
export async function updateInvoiceAction(
  prevState: InvoiceActionResultGeneric<InvoiceFieldName, InvoiceDto>,
  id: string,
  formData: FormData,
): Promise<InvoiceActionResultGeneric<InvoiceFieldName, InvoiceDto>> {
  // 1. Validate and parse input using Zod
  const parsed = CreateInvoiceSchema.safeParse({
    amount: formData.get("amount"),
    customerId: formData.get("customerId"),
    sensitiveData: formData.get("sensitiveData"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return {
      ...prevState,
      // errors: parsed.error.flatten().fieldErrors,
      errors: z.flattenError(parsed.error).fieldErrors,
      message: INVOICE_ERROR_MESSAGES.VALIDATION_FAILED,
      success: false,
    };
  }

  const repo = new InvoiceRepository(getDB());
  const service = new InvoiceService(repo);

  try {
    const updatedInvoice = await service.updateInvoiceService(id, formData);

    if (!updatedInvoice) {
      logger.error({
        context: "updateInvoiceAction",
        id,
        message: INVOICE_ERROR_MESSAGES.UPDATE_FAILED,
        prevState,
      });
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
    if (error instanceof ValidationError) {
      logger.warn({
        context: "updateInvoiceAction",
        error,
        id,
        message: INVOICE_ERROR_MESSAGES.INVALID_INPUT,
      });
      return {
        ...prevState,
        errors: {},
        message: INVOICE_ERROR_MESSAGES.INVALID_INPUT,
        success: false,
      };
    }
    if (error instanceof DatabaseError) {
      logger.error({
        context: "updateInvoiceAction",
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
      message: INVOICE_ERROR_MESSAGES.SERVICE_ERROR,
      success: false,
    };
  }
}

/**
 * Server action to delete an invoice by string ID.
 * Returns a consistent result shape and logs errors with context.
 * @param id - The invoice ID as a string.
 * @returns InvoiceActionResultGeneric with data, errors, message, and success.
 */
export async function deleteInvoiceAction(
  id: string,
): Promise<InvoiceActionResultGeneric<InvoiceFieldName, InvoiceDto>> {
  const db = getDB();
  const repo = new InvoiceRepository(db);
  const service = new InvoiceService(repo);
  try {
    const invoice = await service.deleteInvoiceService(id);

    if (!invoice) {
      logger.error({
        context: "deleteInvoiceAction",
        id,
        message: INVOICE_ERROR_MESSAGES.NOT_FOUND,
      });

      return {
        errors: {},
        message: INVOICE_ERROR_MESSAGES.DELETE_FAILED,
        success: false,
      };
    }

    return {
      data: invoice,
      errors: {},
      message: INVOICE_SUCCESS_MESSAGES.DELETE_SUCCESS,
      success: true,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      logger.warn({
        context: "deleteInvoiceAction",
        error,
        id,
        message: INVOICE_ERROR_MESSAGES.INVALID_INPUT,
      });
      return {
        errors: {},
        message: INVOICE_ERROR_MESSAGES.INVALID_INPUT,
        success: false,
      };
    }
    if (error instanceof DatabaseError) {
      logger.error({
        context: "deleteInvoiceAction",
        error,
        id,
        message: INVOICE_ERROR_MESSAGES.DB_ERROR,
      });
      return {
        errors: {},
        message: INVOICE_ERROR_MESSAGES.DB_ERROR,
        success: false,
      };
    }
    logger.error({
      context: "deleteInvoiceAction",
      error,
      id,
      message: INVOICE_ERROR_MESSAGES.SERVICE_ERROR,
    });
    return {
      errors: {},
      message: INVOICE_ERROR_MESSAGES.SERVICE_ERROR,
      success: false,
    };
  }
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
  const sanitizedQuery = query.trim();

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
