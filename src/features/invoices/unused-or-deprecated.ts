import * as z from "zod";
import { getDB } from "@/db/connection";
import {
  createInvoiceDal,
  deleteInvoiceDal,
  readInvoiceDal,
  updateInvoiceDal,
} from "@/features/invoices/invoice.dal";
import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import {
  CreateInvoiceSchema,
  type InvoiceActionResult,
  type InvoiceEditState,
  type InvoiceFieldName,
  type InvoiceFormStateCreate,
} from "@/features/invoices/invoice.types";
import { processInvoiceFormData } from "@/features/invoices/invoice.utils";
import { INVOICE_ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { INVOICE_SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import {
  toCustomerId,
  toInvoiceId,
  toInvoiceStatusBrand,
} from "@/lib/definitions/brands";
import { logger } from "@/lib/utils/logger";
import { handleServerError } from "@/lib/utils/utils.server";

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
      handleServerError(
        "createInvoiceAction:processInvoiceFormDataError",
        errors,
        { errors, message },
      );

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
 * Server action to update an existing invoice.
 */
export async function _updateInvoiceAction_old(
  id: string,
  prevState: InvoiceEditState,
  formData: FormData,
): Promise<InvoiceEditState> {
  try {
    const db = getDB();

    const validated = CreateInvoiceSchema.safeParse({
      amount: formData.get("amount"),
      customerId: formData.get("customerId"),
      status: formData.get("status"),
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
        errors: z.flattenError(validated.error).fieldErrors,
        invoice: prevState.invoice,
        message: INVOICE_ERROR_MESSAGES.INVALID_INPUT,
        success: false,
      };
    }

    const { amount, customerId, status } = validated.data;

    const updatedInvoice = await updateInvoiceDal(db, toInvoiceId(id), {
      amount: Math.round(amount * 100),
      customerId: toCustomerId(customerId),
      status: toInvoiceStatusBrand(status),
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
        // data: null,
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
      // data: null,
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
        // data: null,
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
      // data: null,
      message: INVOICE_ERROR_MESSAGES.DB_ERROR,
      success: false,
    };
  }
}
