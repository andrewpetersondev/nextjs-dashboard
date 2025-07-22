"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";
import { getDB } from "@/db/connection";
import { DatabaseError, ValidationError } from "@/errors/errors";
import {
  fetchFilteredInvoices,
  fetchInvoicesPagesDal,
  fetchLatestInvoices,
} from "@/features/invoices/invoice.dal";
import { InvoiceRepository } from "@/features/invoices/invoice.repository";
import { CreateInvoiceSchema } from "@/features/invoices/invoice.schemas";
import { InvoiceService } from "@/features/invoices/invoice.service";
import type {
  InvoiceActionResult,
  InvoiceTableRow,
} from "@/features/invoices/invoice.types";
import { INVOICE_ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { INVOICE_SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { logger } from "@/lib/utils/logger";

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
    const parsed = CreateInvoiceSchema.safeParse({
      amount: formData.get("amount"),
      customerId: formData.get("customerId"),
      sensitiveData: formData.get("sensitiveData"),
      status: formData.get("status"),
    });
    if (!parsed.success) {
      return {
        ...prevState,
        errors: z.flattenError(parsed.error).fieldErrors,
        message: INVOICE_ERROR_MESSAGES.VALIDATION_FAILED,
        success: false,
      };
    }

    const repo = new InvoiceRepository(getDB());
    const service = new InvoiceService(repo);
    const invoice = await service.createInvoice(formData);

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
      message:
        error instanceof ValidationError
          ? INVOICE_ERROR_MESSAGES.INVALID_INPUT
          : INVOICE_ERROR_MESSAGES.SERVICE_ERROR,
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
    const repo = new InvoiceRepository(getDB());
    const service = new InvoiceService(repo);
    const invoice = await service.readInvoice(id);

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
    const repo = new InvoiceRepository(getDB());
    const service = new InvoiceService(repo);
    const updatedInvoice = await service.updateInvoice(id, formData);

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
    return {
      ...prevState,
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
 * Server action to delete an invoice by string ID.
 * @param id - The invoice ID as a string
 * @returns InvoiceActionResultGeneric with data, errors, message, and success
 */
export async function deleteInvoiceAction(
  id: string,
): Promise<InvoiceActionResult> {
  try {
    const repo = new InvoiceRepository(getDB());
    const service = new InvoiceService(repo);
    const invoice = await service.deleteInvoice(id);

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
 * @returns Array of InvoiceTableRow
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
 * @returns Array of InvoiceTableRow
 */
export async function readLatestInvoicesAction(): Promise<InvoiceTableRow[]> {
  const db = getDB();
  return fetchLatestInvoices(db);
}
