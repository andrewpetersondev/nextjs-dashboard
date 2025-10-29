import {
  INVOICE_MSG,
  type InvoiceMessageId,
} from "@/shared/i18n/messages/invoice-messages";

// Single-locale dictionary (en) with compile-time completeness check
export const enInvoices = {
  [INVOICE_MSG.AMOUNT_REQUIRED]: "Amount is required.",
  [INVOICE_MSG.CREATE_FAILED]: "Failed to create invoice.",
  [INVOICE_MSG.CREATE_SUCCESS]: "Invoice created successfully.",
  [INVOICE_MSG.CUSTOMER_ID_REQUIRED]: "Customer ID is required.",
  [INVOICE_MSG.DB_ERROR]: "Database Error. Please try again.",
  [INVOICE_MSG.DELETE_FAILED]: "Failed to delete invoice.",
  [INVOICE_MSG.DELETE_SUCCESS]: "Invoice deleted successfully.",
  [INVOICE_MSG.FETCH_ALL_SUCCESS]: "All invoices fetched successfully.",
  [INVOICE_MSG.FETCH_FAILED]: "Database Error. Failed to Fetch InvoiceEntity.",
  [INVOICE_MSG.FETCH_FILTERED_FAILED]: "Failed to fetch filtered invoices.",
  [INVOICE_MSG.FETCH_FILTERED_SUCCESS]:
    "Filtered invoices fetched successfully.",
  [INVOICE_MSG.FETCH_LATEST_FAILED]: "Failed to fetch the latest invoices.",
  [INVOICE_MSG.FETCH_LATEST_SUCCESS]: "Latest invoices fetched successfully.",
  [INVOICE_MSG.FETCH_PAGES_FAILED]:
    "Failed to fetch the total number of invoice pages.",
  [INVOICE_MSG.FETCH_PAGES_SUCCESS]:
    "Total invoice pages fetched successfully.",
  [INVOICE_MSG.FETCH_TOTAL_PAID_FAILED]:
    "Failed to fetch the total amount of pending invoices.",
  [INVOICE_MSG.FETCH_TOTAL_PENDING_FAILED]:
    "Failed to fetch the total amount of pending invoices.",
  [INVOICE_MSG.INVALID_FORM_DATA]:
    "Invalid form data. Please check your input.",
  [INVOICE_MSG.INVALID_ID]: "Invalid invoice ID provided.",
  [INVOICE_MSG.INVALID_INPUT]: "Invalid input. Failed to create invoice.",
  [INVOICE_MSG.LIST_SUCCESS]: "Invoices listed successfully.",
  [INVOICE_MSG.MAPPING_FAILED]: "Failed to map invoice data.",
  [INVOICE_MSG.MISSING_FIELDS]: "Missing required fields.",
  [INVOICE_MSG.notFound]: "Invoice not found.",
  [INVOICE_MSG.READ_FAILED]: "Failed to read invoice.",
  [INVOICE_MSG.READ_SUCCESS]: "Invoice fetched successfully.",
  [INVOICE_MSG.REPO_ERROR]: "Invoice Repository Error. Please try again.",
  [INVOICE_MSG.SERVICE_ERROR]: "Invoice Service Error. Please try again.",
  [INVOICE_MSG.STATUS_REQUIRED]: "Status is required.",
  [INVOICE_MSG.TRANSFORMATION_FAILED]: "Failed to transform invoice data.",
  [INVOICE_MSG.UPDATE_FAILED]: "Failed to update invoice.",
  [INVOICE_MSG.UPDATE_SUCCESS]: "Invoice updated successfully.",
  [INVOICE_MSG.VALIDATION_FAILED]:
    "Validation failed. Please check your input.",
} satisfies Record<InvoiceMessageId, string>;
