import {
  INVOICE_MSG,
  type InvoiceMessageId,
} from "@/shared/i18n/invoice-messages";

// Single-locale dictionary (en) with compile-time completeness check
export const enInvoices = {
  [INVOICE_MSG.amountRequired]: "Amount is required.",
  [INVOICE_MSG.createFailed]: "Failed to create invoice.",
  [INVOICE_MSG.createSuccess]: "Invoice created successfully.",
  [INVOICE_MSG.customerIdRequired]: "Customer ID is required.",
  [INVOICE_MSG.dbError]: "Database Error. Please try again.",
  [INVOICE_MSG.deleteFailed]: "Failed to delete invoice.",
  [INVOICE_MSG.deleteSuccess]: "Invoice deleted successfully.",
  [INVOICE_MSG.fetchAllSuccess]: "All invoices fetched successfully.",
  [INVOICE_MSG.fetchFailed]: "Database Error. Failed to Fetch InvoiceEntity.",
  [INVOICE_MSG.fetchFilteredFailed]: "Failed to fetch filtered invoices.",
  [INVOICE_MSG.fetchFilteredSuccess]: "Filtered invoices fetched successfully.",
  [INVOICE_MSG.fetchLatestFailed]: "Failed to fetch the latest invoices.",
  [INVOICE_MSG.fetchLatestSuccess]: "Latest invoices fetched successfully.",
  [INVOICE_MSG.fetchPagesFailed]:
    "Failed to fetch the total number of invoice pages.",
  [INVOICE_MSG.fetchPagesSuccess]: "Total invoice pages fetched successfully.",
  [INVOICE_MSG.fetchTotalPaidFailed]:
    "Failed to fetch the total amount of pending invoices.",
  [INVOICE_MSG.fetchTotalPendingFailed]:
    "Failed to fetch the total amount of pending invoices.",
  [INVOICE_MSG.invalidFormData]: "Invalid form data. Please check your input.",
  [INVOICE_MSG.invalidId]: "Invalid invoice ID provided.",
  [INVOICE_MSG.invalidInput]: "Invalid input. Failed to create invoice.",
  [INVOICE_MSG.listSuccess]: "Invoices listed successfully.",
  [INVOICE_MSG.mappingFailed]: "Failed to map invoice data.",
  [INVOICE_MSG.missingFields]: "Missing required fields.",
  [INVOICE_MSG.notFound]: "Invoice not found.",
  [INVOICE_MSG.readFailed]: "Failed to read invoice.",
  [INVOICE_MSG.readSuccess]: "Invoice fetched successfully.",
  [INVOICE_MSG.repoError]: "Invoice Repository Error. Please try again.",
  [INVOICE_MSG.serviceError]: "Invoice Service Error. Please try again.",
  [INVOICE_MSG.statusRequired]: "Status is required.",
  [INVOICE_MSG.transformationFailed]: "Failed to transform invoice data.",
  [INVOICE_MSG.updateFailed]: "Failed to update invoice.",
  [INVOICE_MSG.updateSuccess]: "Invoice updated successfully.",
  [INVOICE_MSG.validationFailed]: "Validation failed. Please check your input.",
} satisfies Record<InvoiceMessageId, string>;
