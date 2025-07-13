"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
import type {
  FetchFilteredInvoicesData,
  InvoiceCreateState,
  InvoiceEditState,
} from "@/features/invoices/invoice.types";
import { CreateInvoiceSchema } from "@/features/invoices/invoice.types";
import { extractInvoiceFormFields } from "@/features/invoices/invoice.utils";
import { INVOICE_ERROR_MESSAGES } from "@/lib/constants/error-messages";
import {
  toCustomerId,
  toInvoiceId,
  toInvoiceStatusBrand,
} from "@/lib/definitions/brands";
import {
  buildErrorMap,
  getFormField,
  logError,
} from "@/lib/utils/utils.server";

// --- CRUD Actions for Invoices ---

/**
 * Server action to create a new invoice.
 */
export async function createInvoiceAction(
  _prevState: InvoiceCreateState,
  formData: FormData,
): Promise<InvoiceCreateState> {
  try {
    const db = getDB();

    // Extract and validate fields using a helper
    const { rawAmount, rawCustomerId, rawStatus } =
      extractInvoiceFormFields(formData);

    // --- Zod validation ---
    const validated = CreateInvoiceSchema.safeParse({
      amount: rawAmount,
      customerId: rawCustomerId,
      status: rawStatus,
    });

    if (!validated.success) {
      return {
        errors: validated.error.flatten().fieldErrors,
        message: INVOICE_ERROR_MESSAGES.INVALID_INPUT,
        success: false,
      } as const;
    }

    // --- Type-safe transformation ---
    const { amount, customerId, status } = validated.data;
    const brandedCustomerId = toCustomerId(customerId);
    const brandedStatus = toInvoiceStatusBrand(status);
    const amountInCents = Math.round(amount * 100); // Avoid floating point issues
    const now = new Date().toISOString().split("T")[0];

    // --- DAL call ---
    const brands = {
      amount: amountInCents,
      customerId: brandedCustomerId,
      date: now as string, // cast to string for DAL
      status: brandedStatus,
    };

    const invoice = await createInvoiceDal(db, brands);

    if (!invoice) {
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
    // Use structured logging in production
    console.error(error);
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
    logError("readInvoiceAction", error, { id });
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
    } catch (err) {
      logError("updateInvoiceAction:missingFields", err, { id });
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
      message: "Updated invoice successfully.",
      success: true,
    };
  } catch (error) {
    logError("updateInvoiceAction", error, { id });
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
