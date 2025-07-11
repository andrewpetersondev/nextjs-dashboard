/**
 * Centralized error messages for invoice actions and DAL.
 * Update here to propagate changes throughout the app.
 */
export const INVOICE_ERROR_MESSAGES = {
  AMOUNT_REQUIRED: "Amount is required.",
  CUSTOMER_ID_REQUIRED: "Customer ID is required.",
  STATUS_REQUIRED: "Status is required.",
  INVALID_INPUT: "Invalid input. Failed to create invoice.",
  MISSING_FIELDS: "Missing required fields.",
  CREATE_FAILED: "Failed to create invoice.",
  UPDATE_FAILED: "Failed to update invoice.",
  FETCH_FAILED: "Database Error. Failed to Fetch InvoiceEntity.",
  DELETE_FAILED: "Failed to delete invoice.",
  DB_ERROR: "Database Error. Please try again.",
};
