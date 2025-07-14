"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type * as z from "zod";
import { getDB } from "@/db/connection";
import { brandInvoiceFields } from "@/features/invoices/invoice.branding";
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
import {
  CreateInvoiceSchema,
  type FetchFilteredInvoicesData,
  type InvoiceEditState,
  type InvoiceFieldName,
} from "@/features/invoices/invoice.types";
import { INVOICE_ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { INVOICE_SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import {
  toCustomerId,
  toInvoiceId,
  toInvoiceStatusBrand,
} from "@/lib/definitions/brands";
import type { FormState } from "@/lib/forms/form.types";
import { validateFormData } from "@/lib/forms/form-validation";
import { logger } from "@/lib/utils/logger";
import { buildErrorMap, getFormField } from "@/lib/utils/utils.server";

// --- CRUD Actions for Invoices ---

// Use this as the return type for your action
type InvoiceFormState = FormState<
  InvoiceFieldName,
  z.output<typeof CreateInvoiceSchema>
>;

/**
 * Server action to create a new invoice.
 */
export async function createInvoiceAction(
  _prevState: InvoiceFormState,
  formData: FormData,
): Promise<InvoiceFormState> {
  try {
    const db = getDB();

    // --- Centralized validation using the generic utility ---
    const validationResult = validateFormData<
      InvoiceFieldName,
      typeof CreateInvoiceSchema._output
    >(formData, CreateInvoiceSchema);

    if (!validationResult.success) {
      logger.error({
        context: "createInvoiceAction:validationError",
        error: validationResult.errors,
        message: INVOICE_ERROR_MESSAGES.INVALID_INPUT,
      });

      return {
        errors: validationResult.errors,
        message: INVOICE_ERROR_MESSAGES.INVALID_INPUT,
        success: false,
      };
    }

    const { amount, customerId, status } = validationResult.data!; // Non-null assertion since we validated success

    const amountInCents = Math.round(amount * 100); // Avoid floating point issues

    const now = new Date().toISOString().split("T")[0] as string; // typeof string | undefined --> string

    const fields = { amount: amountInCents, customerId, date: now, status };

    const brands = brandInvoiceFields(fields);

    const invoice = await createInvoiceDal(db, brands);

    if (!invoice) {
      logger.error({
        brands,
        context: "createInvoiceAction:createFailed",
        message: INVOICE_ERROR_MESSAGES.CREATE_FAILED,
        success: false,
      });

      return {
        errors: {},
        message: "Failed to create invoice.",
        success: false,
      };
    }

    return {
      errors: {},
      message: "Invoice created successfully.",
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
  // NOTE: returning actionResult on success made this unreachable.
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
export async function updateInvoiceAction(
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
 * Server action to fetch the total number of invoice pages.
 * @param query - Search query string
 * @returns Total number of pages
 */
export async function readInvoicesPagesAction(
  query: string = "",
): Promise<number> {
  const db = getDB();
  return fetchInvoicesPages(db, query);
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
): Promise<FetchFilteredInvoicesData[]> {
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
