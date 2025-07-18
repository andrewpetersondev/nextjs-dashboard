"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";
import { getDB } from "@/db/connection";
import {
  deleteInvoiceDal,
  fetchFilteredInvoices,
  fetchInvoicesPages,
  fetchLatestInvoices,
  readInvoiceDal,
} from "@/features/invoices/invoice.dal";
import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import { InvoiceRepository } from "@/features/invoices/invoice.repository";
import { InvoiceService } from "@/features/invoices/invoice.service";
import type {
  InvoiceActionResultGeneric,
  InvoiceFieldName,
  InvoiceTableRow,
} from "@/features/invoices/invoice.types";
import { INVOICE_ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { INVOICE_SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { toInvoiceId } from "@/lib/definitions/brands";
import { logger } from "@/lib/utils/logger";
import { handleServerError } from "@/lib/utils/utils.server";

/**
 * Server action for creating a new invoice.
 * Handles request/response and error formatting for the UI.
 */
export async function createInvoiceAction(
  prevState: InvoiceActionResultGeneric<InvoiceFieldName, InvoiceDto>,
  formData: FormData,
): Promise<InvoiceActionResultGeneric<InvoiceFieldName, InvoiceDto>> {
  const repo = new InvoiceRepository(getDB());
  const service = new InvoiceService(repo);

  try {
    const invoice = await service.createInvoice(formData);
    return {
      data: invoice,
      errors: {},
      message: INVOICE_SUCCESS_MESSAGES.CREATE_SUCCESS,
      success: true,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Potential new error handling function
      handleServerError("createInvoiceAction:validationError", error, {
        error,
        message: INVOICE_ERROR_MESSAGES.INVALID_INPUT,
        prevState,
      });

      return {
        ...prevState,
        errors: z.flattenError(error).fieldErrors,
        message: INVOICE_ERROR_MESSAGES.INVALID_INPUT,
        success: false,
      };
    }
    // Potential new error handling function
    handleServerError("createInvoiceAction:dbError", error, {
      error,
      message: INVOICE_ERROR_MESSAGES.DB_ERROR,
      prevState,
    });
    logger.error({
      context: "createInvoiceAction",
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
 * Server action for updating an invoice.
 * Handles request/response and error formatting for the UI.
 */
export async function updateInvoiceAction(
  prevState: InvoiceActionResultGeneric<InvoiceFieldName, InvoiceDto>,
  id: string,
  formData: FormData,
): Promise<InvoiceActionResultGeneric<InvoiceFieldName, InvoiceDto>> {
  const repo = new InvoiceRepository(getDB());
  const service = new InvoiceService(repo);

  try {
    const updatedInvoice = await service.updateInvoice(id, formData);
    return {
      data: updatedInvoice,
      errors: {},
      message: INVOICE_SUCCESS_MESSAGES.UPDATE_SUCCESS,
      success: true,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        ...prevState,
        errors: z.flattenError(error).fieldErrors,
        message: INVOICE_ERROR_MESSAGES.INVALID_INPUT,
        success: false,
      };
    }
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
